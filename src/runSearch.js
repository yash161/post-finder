/**
 * Shared "run a fresh search across categories" routine, used by both
 * the local dashboard server (src/dashboard.js) and the Vercel
 * /api/run serverless function (api/run.js) that powers the
 * dashboard's "Run Now" button.
 */

import { categories as allCategories } from './config.js';
import {
  buildCategoryQueries,
  extractLocationPhrase,
  matchesLocation,
  extractRequiredGroups,
  matchesRequiredGroups,
} from './queryBuilder.js';
import { searchBatch } from './tinyfish.js';
import { deduplicateResults, markNewResults, extractAuthor, normalizeUrl } from './dedup.js';
import { filterByRecency, parseRelativeDate } from './dateParser.js';

/**
 * Run searches for the given categories, filter by recency, and dedupe
 * globally across categories. Does not persist anything — callers decide
 * how/where to save (local fs vs. a GitHub commit).
 *
 * @param {Object} options
 * @param {Object[]} [options.categories] - Category objects to search (default: all from config.js)
 * @param {number} [options.maxHours] - Recency window in hours (default: 24)
 * @returns {Promise<Object[]>} Globally deduplicated results across all categories
 */
export async function runSearch({ categories = allCategories, maxHours = 24 } = {}) {
  const allResults = [];
  const globalSeen = new Set();

  for (const category of categories) {
    const queries = buildCategoryQueries(category);
    const batchResults = await searchBatch(queries);

    const flatResults = [];
    for (const batch of batchResults) {
      if (batch.error) continue;
      const locationPhrase = extractLocationPhrase(batch.query);
      const requiredGroups = extractRequiredGroups(batch.query);
      for (const result of batch.results) {
        if (!matchesLocation(result, locationPhrase)) continue;
        if (!matchesRequiredGroups(result, requiredGroups)) continue;
        const parsed = parseRelativeDate(result.date);
        flatResults.push({
          ...result,
          categoryId: category.id,
          categoryName: category.name,
          author: extractAuthor(result.url),
          url: normalizeUrl(result.url),
          foundAt: new Date().toISOString(),
          parsedDate: parsed ? parsed.toISOString() : null,
        });
      }
    }

    const recentResults = filterByRecency(flatResults, maxHours);
    const dedupedResults = deduplicateResults(recentResults);

    for (const r of dedupedResults) {
      const key = normalizeUrl(r.url);
      if (!globalSeen.has(key)) {
        globalSeen.add(key);
        allResults.push(r);
      }
    }
  }

  return allResults;
}

export { markNewResults };
