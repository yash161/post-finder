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
const API_KEY = process.env.TINYFISH_API_KEY;

// 30 req/min → minimum 2000ms between calls; use 2100ms for safety margin
const DEFAULT_DELAY_MS = 2100;
const MAX_RETRIES = 3;
const RETRY_RATE_LIMIT_MS = 30_000; // Wait 30s on first 429, doubling each retry
const RETRY_SERVER_ERROR_MS = 5_000; // Wait 5s on first 5xx, doubling each retry

if (!API_KEY) {
  throw new Error('TINYFISH_API_KEY is not set. Create a .env file with your key.');
}

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
 * @param {function} options.onRetry - Called when retrying: (retryNum, waitMs)
 * @returns {Promise<Object>} { query, results: [...], totalResults }
 */
export async function search(query, { location = 'US', language = 'en', recencyMinutes = null, onRetry = null } = {}) {
  const url = new URL(API_BASE);
  url.searchParams.set('query', query);
  url.searchParams.set('location', location);
  url.searchParams.set('language', language);
  if (recencyMinutes) {
    url.searchParams.set('recency_minutes', String(recencyMinutes));
  }

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
 * Execute multiple queries sequentially with rate-limit-safe delays.
 *
 * @param {string[]} queries - Array of search strings
 * @param {Object} options
 * @param {number} options.delayMs - Milliseconds between API calls (default: 2100 for 30/min limit)
 * @param {string} options.location
 * @param {string} options.language
 * @param {number} options.recencyMinutes - Freshness window in minutes, forwarded to search()
 * @param {function} options.onProgress - Called after each query with (completedCount, totalCount, query)
 * @param {function} options.onRetry - Called on rate-limit retry with (retryNum, waitMs, query)
 * @returns {Promise<Object[]>} Array of { query, results, totalResults }
 */
export async function searchBatch(queries, {
  delayMs = DEFAULT_DELAY_MS,
  location = 'US',
  language = 'en',
  recencyMinutes = null,
  onProgress = null,
  onRetry = null,
} = {}) {
  const allResults = [];

  for (let i = 0; i < queries.length; i++) {
    try {
      const result = await search(queries[i], {
        location,
        language,
        recencyMinutes,
        onRetry: onRetry
          ? (retryNum, waitMs) => onRetry(retryNum, waitMs, queries[i])
          : null,
      });
      allResults.push(result);
    } catch (err) {
      // Log the error but continue with remaining queries
      allResults.push({ query: queries[i], results: [], totalResults: 0, error: err.message });
    }

    if (onProgress) {
      onProgress(i + 1, queries.length, queries[i]);
    }

    // Rate-limit delay between calls (skip after last)
    if (i < queries.length - 1) {
      await sleep(delayMs);
    }
  }

  return allResults;
}
