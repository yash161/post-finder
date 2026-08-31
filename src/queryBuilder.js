/**
 * Builds Tinyfish-compatible search query strings from structured category data.
 *
 * Each query in a category has:
 *   - hiring: array of hiring phrases → OR'd into a group
 *   - skills: array of skill terms → OR'd into a group
 *   - extra (optional): additional skill sub-terms → OR'd into a second group
 *   - suffix (optional): appended literally (e.g., "reach out")
 *
 * Output format:
 *   site:linkedin.com/posts (<hiring>) (<skills>) [(<extra>)] [<suffix>]
 */

/**
 * Build a single search string from a query object.
 * @param {Object} query - { hiring, skills, extra?, suffix? }
 * @returns {string} The complete search string for Tinyfish
 */
export function buildQueryString(query) {
  const parts = [];

  // Site restriction — LinkedIn posts only
  parts.push('site:linkedin.com/posts');

  // Hiring phrases group
  if (query.hiring.length === 1) {
    parts.push(query.hiring[0]);
  } else {
    parts.push(`(${query.hiring.join(' OR ')})`);
  }

  // Skills group
  if (query.skills.length === 1) {
    parts.push(query.skills[0]);
  } else {
    parts.push(`(${query.skills.join(' OR ')})`);
  }

  // Extra sub-terms (used in AWS / Azure categories where there's a base skill + specifics)
  if (query.extra && query.extra.length > 0) {
    if (query.extra.length === 1) {
      parts.push(query.extra[0]);
    } else {
      parts.push(`(${query.extra.join(' OR ')})`);
    }
  }

  // Suffix — literal append (e.g., "reach out")
  if (query.suffix) {
    parts.push(query.suffix);
  }

  return parts.join(' ');
}

/**
 * Build all query strings for a given category.
 * @param {Object} category - A category object from config.js
 * @returns {string[]} Array of search strings
 */
export function buildCategoryQueries(category) {
  return category.queries.map((q) => buildQueryString(q));
}
