/**
 * Shared "run a fresh search" routine, used by both
 * the local dashboard server and the CLI.
 */

import { categories as allCategories } from './config.js';
import { buildCategoryQueries } from './queryBuilder.js';
import { searchBatch } from './tinyfish.js';
import { deduplicateResults, markNewResults, extractAuthor, normalizeUrl } from './dedup.js';
import { filterByRecency, parseRelativeDate } from './dateParser.js';

/**
 * Run searches for the given categories, filter by recency, and dedupe.
 *
 * @param {Object} options
 * @param {Object[]} [options.categories] - Categories to search (default: all)
 * @param {number} [options.maxHours] - Recency window in hours (default: 24)
 * @returns {Promise<Object[]>} Deduplicated results
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
      for (const result of batch.results) {
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
