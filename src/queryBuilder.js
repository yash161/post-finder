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
