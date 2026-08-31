/**
 * Date parser for relative date strings from Tinyfish results.
 *
 * Tinyfish returns dates like "6 days ago", "2 weeks ago", "1 year ago",
 * "1 month ago", etc. This module parses those into actual Date objects
 * so we can filter by recency.
 */

/**
 * Parse a relative date string into a Date object.
 *
 * Supports: "just now", "X seconds ago", "X minutes ago", "X hours ago",
 * "X days ago", "X weeks ago", "X months ago", "X years ago"
 *
 * @param {string} dateStr - e.g. "6 days ago", "2 weeks ago"
 * @returns {Date|null} Parsed date, or null if unparseable
 */
export function parseRelativeDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const str = dateStr.trim().toLowerCase();

  if (str === 'just now') {
    return new Date();
  }

  // Match patterns like "6 days ago", "1 year ago", "2 weeks ago"
  const match = str.match(/^(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/);
  if (!match) return null;

  const amount = parseInt(match[1], 10);
  const unit = match[2];
  const now = new Date();

  switch (unit) {
    case 'second':
      return new Date(now.getTime() - amount * 1000);
    case 'minute':
      return new Date(now.getTime() - amount * 60 * 1000);
    case 'hour':
      return new Date(now.getTime() - amount * 60 * 60 * 1000);
    case 'day':
      return new Date(now.getTime() - amount * 24 * 60 * 60 * 1000);
    case 'week':
      return new Date(now.getTime() - amount * 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - amount * 30 * 24 * 60 * 60 * 1000);
    case 'year':
      return new Date(now.getTime() - amount * 365 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

/**
 * Check if a result's date falls within the given hours window.
 *
 * Tinyfish omits the `date` field entirely when a search is scoped with
 * `recency_minutes` (see src/tinyfish.js) — in that case we fall back to
 * `foundAt`, our own timestamp of when the result was fetched, rather than
 * excluding it outright. That's accurate at fetch time (the server already
 * enforced the window) and still a reasonable signal later, e.g. when
 * mailer.js re-filters already-stored results for a digest.
 *
 * @param {Object} result - A result object with a `date` and/or `foundAt` field
 * @param {number} maxHours - Maximum age in hours (e.g. 24, 48)
 * @returns {boolean} True if the post is within the window, or if age is unknown
 */
export function isWithinHours(result, maxHours) {
  const parsedDate = (result.date && parseRelativeDate(result.date))
    || (result.foundAt && new Date(result.foundAt))
    || null;

  if (!parsedDate) {
    // No date info at all — we can't determine age, exclude it to be safe
    return false;
  }

  const ageMs = Date.now() - parsedDate.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  return ageHours <= maxHours;
}

/**
 * Filter an array of results to only include posts within the given hours window.
 *
 * @param {Object[]} results
 * @param {number} maxHours
 * @returns {Object[]} Filtered results
 */
export function filterByRecency(results, maxHours) {
  return results.filter((r) => isWithinHours(r, maxHours));
}
