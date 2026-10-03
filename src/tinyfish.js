/**
 * Tinyfish Search API client.
 *
 * Calls https://api.search.tinyfish.ai with the given query,
 * using the API key from .env, and returns parsed results.
 *
 * Rate limit: 30 requests per minute (1 every 2 seconds).
 * Includes automatic retry with exponential backoff on transient errors (429, 5xx).
 */

import 'dotenv/config';

const API_BASE = 'https://api.search.tinyfish.ai';

// Read at call time (not module load) so importing this module never
// throws — callers get a clean error only when they actually search.

// Tinyfish returns ~10 results per call unless asked; raise it — the
// client-side filters (queryBuilder) drop the loose matches anyway.
const DEFAULT_LIMIT = 30;

/**
 * Build the Tinyfish request URL (exported for testing).
 */
export function buildSearchUrl(query, { location = 'US', language = 'en', recencyMinutes = null, limit = DEFAULT_LIMIT, page = 1 } = {}) {
  const url = new URL(API_BASE);
  url.searchParams.set('query', query);
  url.searchParams.set('location', location);
  url.searchParams.set('language', language);
  url.searchParams.set('limit', String(limit));
  if (page > 1) url.searchParams.set('page', String(page));
  if (recencyMinutes) {
    url.searchParams.set('recency_minutes', String(recencyMinutes));
  }
  return url.toString();
}

// 30 req/min → minimum 2000ms between calls; use 2100ms for safety margin
const DEFAULT_DELAY_MS = 2100;
const MAX_RETRIES = 3;
const RETRY_RATE_LIMIT_MS = 30_000; // Wait 30s on first 429, doubling each retry
const RETRY_SERVER_ERROR_MS = 5_000; // Wait 5s on first 5xx, doubling each retry

/**
 * Delay helper.
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an HTTP status code is a retryable transient error.
 */
function isRetryable(status) {
  return status === 429 || (status >= 500 && status <= 599);
}

/**
 * Execute a single search query against Tinyfish, with retry on transient errors.
 *
 * @param {string} query - The full search string (already built by queryBuilder)
 * @param {Object} options
 * @param {string} options.location - Geo filter (default: 'US')
 * @param {string} options.language - Language filter (default: 'en')
 * @param {number} options.recencyMinutes - Freshness window in minutes (e.g. 1440 for 24h).
 *   Without this, Tinyfish ranks by relevance across its whole index and can return
 *   results that are months or years old even when genuinely fresh matches exist.
 * @param {number} options.limit - Max results per API call (default: 30)
 * @param {number} options.page - Result page to fetch (default: 1)
 * @param {function} options.onRetry - Called when retrying: (retryNum, waitMs)
 * @returns {Promise<Object>} { query, results: [...], totalResults }
 */
export async function search(query, { location = 'US', language = 'en', recencyMinutes = null, limit = DEFAULT_LIMIT, page = 1, onRetry = null } = {}) {
  const API_KEY = process.env.TINYFISH_API_KEY;
  if (!API_KEY) {
    throw new Error('TINYFISH_API_KEY is not set. Create a .env file with your key.');
  }

  const url = buildSearchUrl(query, { location, language, recencyMinutes, limit, page });

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url.toString(), {
      headers: {
        'X-API-Key': API_KEY,
        'X-TF-Request-Origin': 'api',
        'X-TF-Client-Name': 'post-finder',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        query,
        results: data.results || [],
        totalResults: data.total_results || 0,
      };
    }

    // Handle transient errors (429 rate limit, 5xx server errors) with retry
    if (isRetryable(response.status) && attempt < MAX_RETRIES) {
      const baseMs = response.status === 429 ? RETRY_RATE_LIMIT_MS : RETRY_SERVER_ERROR_MS;
      const waitMs = baseMs * Math.pow(2, attempt);
      if (onRetry) {
        onRetry(attempt + 1, waitMs);
      }
      await sleep(waitMs);
      continue;
    }

    const text = await response.text();
    throw new Error(`Tinyfish API error ${response.status}: ${text}`);
  }
}

/**
 * Execute multiple queries with paced concurrency.
 *
 * The Tinyfish limit is 30 req/min. Each worker spaces its own calls by
 * `delayMs * concurrency`, so total throughput stays within the limit
 * regardless of worker count (e.g. 3 workers × 6300ms ≈ 28 req/min).
 *
 * @param {string[]} queries - Array of search strings
 * @param {Object} options
 * @param {number} options.delayMs - Base milliseconds between API calls (default: 2100 for 30/min limit)
 * @param {number} options.concurrency - Parallel workers (default: 1, sequential)
 * @param {number} options.limit - Max results per API call (default: 30)
 * @param {number} options.maxPages - Pages to fetch per query (default: 1).
 *   Page 2+ costs one extra API call each — keep at 1 on quota-sensitive runs.
 * @param {string} options.location
 * @param {string} options.language
 * @param {number} options.recencyMinutes - Freshness window in minutes, forwarded to search()
 * @param {function} options.onProgress - Called after each query with (completedCount, totalCount, query)
 * @param {function} options.onRetry - Called on rate-limit retry with (retryNum, waitMs, query)
 * @returns {Promise<Object[]>} Array of { query, results, totalResults }, in input order
 */
export async function searchBatch(queries, {
  delayMs = DEFAULT_DELAY_MS,
  concurrency = 1,
  limit = DEFAULT_LIMIT,
  maxPages = 1,
  location = 'US',
  language = 'en',
  recencyMinutes = null,
  onProgress = null,
  onRetry = null,
} = {}) {
  const workers = Math.max(1, Math.min(concurrency, queries.length));
  const perWorkerDelay = delayMs * workers;
  const allResults = new Array(queries.length);
  let next = 0;
  let completed = 0;

  async function fetchQuery(q) {
    const pages = [];
    let totalResults = 0;
    for (let page = 1; page <= maxPages; page++) {
      const res = await search(q, {
        location,
        language,
        recencyMinutes,
        limit,
        page,
        onRetry: onRetry
          ? (retryNum, waitMs) => onRetry(retryNum, waitMs, q)
          : null,
      });
      totalResults = res.totalResults;
      pages.push(...res.results);
      // Last page was short — no more results to fetch
      if (res.results.length < limit) break;
      await sleep(perWorkerDelay);
    }
    return { query: q, results: pages, totalResults };
  }

  async function worker() {
    while (true) {
      const i = next++;
      if (i >= queries.length) return;
      try {
        allResults[i] = await fetchQuery(queries[i]);
      } catch (err) {
        // Log the error but continue with remaining queries
        allResults[i] = { query: queries[i], results: [], totalResults: 0, error: err.message };
      }

      completed++;
      if (onProgress) {
        onProgress(completed, queries.length, queries[i]);
      }

      // Pace this worker's own calls so aggregate throughput stays in-budget
      await sleep(perWorkerDelay);
    }
  }

  await Promise.all(Array.from({ length: workers }, () => worker()));
  return allResults;
}
