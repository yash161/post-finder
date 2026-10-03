/**
 * Shared "run a fresh search" routine, used by both
 * the local dashboard server and the CLI.
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
import { extractCompany } from './company.js';

/**
 * Run searches for the given categories, filter by recency, and dedupe.
 *
 * @param {Object} options
 * @param {Object[]} [options.categories] - Categories to search (default: all)
 * @param {number} [options.maxHours] - Recency window in hours (default: 24)
 * @returns {Promise<Object[]>} Deduplicated results
 */
export async function runSearch({ categories = allCategories, maxHours = 24, concurrency = 3, limit = 30, maxPages = 1 } = {}) {
  const allResults = [];
  const globalSeen = new Set();
  const recencyMinutes = maxHours * 60;

  for (const category of categories) {
    const queries = buildCategoryQueries(category);
    const batchResults = await searchBatch(queries, { recencyMinutes, concurrency, limit, maxPages });

    const flatResults = [];
    for (const batch of batchResults) {
      if (batch.error) continue;
      // Tinyfish doesn't strictly enforce quoted phrases or boolean groups,
      // so it can return results that only loosely match (e.g. wrong
      // country, or none of the required skill terms) — verify both.
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
          company: extractCompany(result.title, result.snippet),
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
