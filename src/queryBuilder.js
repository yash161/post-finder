/**
 * Builds Tinyfish-compatible search query strings from category data.
 *
 * Queries in config.js are now raw LinkedIn boolean strings with location
 * targeting baked in. This module just prepends the site restriction.
 *
 * Output format:
 *   site:linkedin.com/posts <raw query string>
 */

/**
 * Build a single search string from a raw query.
 * @param {string} query - The raw boolean query string from config
 * @returns {string} The complete search string for Tinyfish
 */
export function buildQueryString(query) {
  return `site:linkedin.com/posts ${query}`;
}

/**
 * Build all query strings for a given category.
 * @param {Object} category - A category object from config.js
 * @returns {string[]} Array of search strings
 */
export function buildCategoryQueries(category) {
  return category.queries.map((q) => buildQueryString(q));
}

/**
 * Known location phrases used across config.js queries, in the exact
 * quoted form they appear in (e.g. `"los angeles"`).
 */
const LOCATION_PHRASES = ['united states', 'san francisco', 'los angeles'];

/**
 * Extract the quoted location phrase a query was built with, if any.
 *
 * Tinyfish doesn't strictly enforce quoted phrases the way LinkedIn's own
 * search does — it can return loosely-related results (wrong country,
 * wrong city) that merely share other keywords like "hiring". This lets
 * callers verify a result actually mentions the location it matched on.
 *
 * @param {string} query - A built query string (from buildQueryString)
 * @returns {string|null} The location phrase (lowercase, unquoted), or null
 */
export function extractLocationPhrase(query) {
  const lower = query.toLowerCase();
  for (const loc of LOCATION_PHRASES) {
    if (lower.includes(`"${loc}"`)) return loc;
  }
  return null;
}

/**
 * Check whether a result's title/snippet actually contains the location
 * phrase its query targeted (case-insensitive substring match).
 *
 * @param {Object} result - A raw Tinyfish result with title/snippet
 * @param {string|null} locationPhrase - From extractLocationPhrase()
 * @returns {boolean} True if there's no location phrase to check, or it's present
 */
export function matchesLocation(result, locationPhrase) {
  if (!locationPhrase) return true;
  const haystack = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();
  return haystack.includes(locationPhrase);
}
