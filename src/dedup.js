/**
 * Deduplication module.
 *
 * Normalizes LinkedIn post URLs and deduplicates results
 * within a single run (across categories) and across runs
 * (by comparing against previously stored results).
 */

/**
 * Normalize a LinkedIn URL by stripping tracking/query params
 * and reducing to the canonical post path.
 *
 * e.g. https://www.linkedin.com/posts/john-smith_some-text-activity-123456-abcd?utm=...
 *   → https://www.linkedin.com/posts/john-smith_some-text-activity-123456-abcd
 *
 * @param {string} url
 * @returns {string} Normalized URL
 */
export function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    // Strip all query params and hash
    parsed.search = '';
    parsed.hash = '';
    // Remove trailing slash
    let normalized = parsed.toString();
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    // If URL parsing fails, return as-is
    return url;
  }
}

/**
 * Extract author slug from a LinkedIn post URL.
 *
 * e.g. https://www.linkedin.com/posts/john-smith-12345_some-text-activity-123-abc
 *   → john-smith-12345
 *
 * @param {string} url
 * @returns {string|null}
 */
export function extractAuthor(url) {
  const match = url.match(/linkedin\.com\/posts\/([^_/]+)/);
  return match ? match[1] : null;
}

/**
 * Deduplicate an array of result objects by normalized URL.
 * Results appearing in earlier entries win (first-seen priority).
 *
 * @param {Object[]} results - Array of { url, title, snippet, ... }
 * @returns {Object[]} Deduplicated array
 */
export function deduplicateResults(results) {
  const seen = new Set();
  const unique = [];

  for (const result of results) {
    const key = normalizeUrl(result.url);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(result);
    }
  }

  return unique;
}

/**
 * Compare current results against previously stored results.
 * Marks each result with `isNew: true/false`.
 *
 * @param {Object[]} currentResults - This run's deduplicated results
 * @param {Object[]} previousResults - Results from data/results.json
 * @returns {Object[]} currentResults with `isNew` flag added
 */
export function markNewResults(currentResults, previousResults) {
  const previousUrls = new Set(
    previousResults.map((r) => normalizeUrl(r.url))
  );

  return currentResults.map((r) => ({
    ...r,
    isNew: !previousUrls.has(normalizeUrl(r.url)),
  }));
}
