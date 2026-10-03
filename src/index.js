#!/usr/bin/env node

/**
 * Post Finder — Main orchestrator.
 *
 * Runs all (or selected) LinkedIn hiring query categories against
 * the Tinyfish Search API, deduplicates, persists, and displays results.
 *
 * Usage:
 *   node src/index.js                        # Run all 14 categories (past 24h)
 *   node src/index.js --hours 48             # Past 48 hours
 *   node src/index.js --categories 1,2,9     # Run specific categories
 *   node src/index.js --concurrency 1        # Sequential (default: 3 paced workers)
 *   node src/index.js --limit 50 --pages 2    # More results per query (extra API calls)
 *   node src/index.js --dashboard            # Also start the web dashboard
 *   node src/index.js --json                 # Output raw JSON to stdout
 *   node src/index.js --dashboard-only       # Only start the dashboard (no new search)
 */

import 'dotenv/config';
import { program } from 'commander';
import { categories } from './config.js';
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
import { loadPreviousResults, saveResults } from './results.js';
import {
  printHeader,
  printProgress,
  printCategoryResults,
  printSummary,
  printError,
  printRetry,
} from './display.js';
import { startDashboard } from './dashboard.js';

// ── CLI ──────────────────────────────────────────────────────

program
  .name('post-finder')
  .description('Automated LinkedIn hiring post discovery via Tinyfish Search API')
  .version('1.0.0')
  .option('-c, --categories <ids>', 'Comma-separated category IDs to run (default: all)', '')
  .option('-h, --hours <hours>', 'Max post age in hours (default: 24)', '24')
  .option('-j, --concurrency <n>', 'Parallel API workers, paced to stay in rate limit (default: 3)', '3')
  .option('-l, --limit <n>', 'Results requested per API call (default: 30)', '30')
  .option('--pages <n>', 'Result pages to fetch per query, 1 extra API call per page (default: 1)', '1')
  .option('--dashboard', 'Start the web dashboard after searching')
  .option('--dashboard-only', 'Start the web dashboard without running a new search')
  .option('--json', 'Output raw JSON to stdout instead of formatted text')
  .parse();

const opts = program.opts();

// ── Main ─────────────────────────────────────────────────────

async function main() {
  // Dashboard-only mode
  if (opts.dashboardOnly) {
    startDashboard();
    return;
  }

  if (!opts.json) {
    printHeader();
  }

  // Determine which categories to run
  let selectedCategories = categories;
  if (opts.categories) {
    const ids = opts.categories.split(',').map((s) => parseInt(s.trim(), 10));
    selectedCategories = categories.filter((c) => ids.includes(c.id));
    if (selectedCategories.length === 0) {
      printError(`No categories found for IDs: ${opts.categories}`);
      printError(`Valid IDs: ${categories.map((c) => c.id).join(', ')}`);
      process.exit(1);
    }
  }

  const maxHours = parseInt(opts.hours, 10) || 24;
  const concurrency = Math.max(1, parseInt(opts.concurrency, 10) || 3);
  const limit = Math.max(1, parseInt(opts.limit, 10) || 30);
  const maxPages = Math.max(1, parseInt(opts.pages, 10) || 1);

  if (!opts.json) {
    console.log(`  Running ${selectedCategories.length} categories (past ${maxHours}h)…\n`);
  }

  // Load previous results for comparison
  const previousData = loadPreviousResults();

  // Build all queries across selected categories
  const categoryQueries = selectedCategories.map((cat) => ({
    category: cat,
    queries: buildCategoryQueries(cat),
  }));

  const totalQueries = categoryQueries.reduce((sum, cq) => sum + cq.queries.length, 0);

  // Execute all queries, category by category
  const allCategoryResults = [];
  let queryCount = 0;

  for (const { category, queries } of categoryQueries) {
    if (!opts.json) {
      console.log(`  📂 ${category.name} (${queries.length} queries)`);
    }

    const batchResults = await searchBatch(queries, {
      recencyMinutes: maxHours * 60,
      concurrency,
      limit,
      maxPages,
      onProgress: !opts.json
        ? (done, total) => {
            queryCount++;
            printProgress(queryCount, totalQueries, category.name);
          }
        : null,
      onRetry: !opts.json
        ? (retryNum, waitMs) => printRetry(retryNum, waitMs)
        : null,
    });

    // Flatten all results from this category's queries
    const flatResults = [];
    let failedQueries = 0;
    let offLocationCount = 0;
    let offTopicCount = 0;
    for (const batch of batchResults) {
      if (batch.error) {
        failedQueries++;
        if (!opts.json) {
          console.log(`    ⚠️  Query failed: ${batch.error.slice(0, 80)}`);
        }
        continue;
      }
      // Tinyfish doesn't strictly enforce quoted phrases or boolean groups,
      // so it can return results that only loosely match (e.g. wrong
      // country, or none of the required skill terms) — verify both.
      const locationPhrase = extractLocationPhrase(batch.query);
      const requiredGroups = extractRequiredGroups(batch.query);
      for (const result of batch.results) {
        if (!matchesLocation(result, locationPhrase)) {
          offLocationCount++;
          continue;
        }
        if (!matchesRequiredGroups(result, requiredGroups)) {
          offTopicCount++;
          continue;
        }
        // Parse the relative date string into a timestamp for filtering
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

    // Filter by recency
    const recentResults = filterByRecency(flatResults, maxHours);

    // Deduplicate within this category
    const dedupedResults = deduplicateResults(recentResults);

    if (!opts.json && offLocationCount > 0) {
      console.log(`    📍 Filtered out ${offLocationCount} posts that didn't actually mention the target location`);
    }

    if (!opts.json && offTopicCount > 0) {
      console.log(`    🎯 Filtered out ${offTopicCount} posts that didn't mention any required skill/role term`);
    }

    if (!opts.json && flatResults.length > 0 && recentResults.length < flatResults.length) {
      const filtered = flatResults.length - recentResults.length;
      console.log(`    📅 Filtered out ${filtered} posts older than ${maxHours}h`);
    }

    allCategoryResults.push({
      category,
      results: dedupedResults,
      failedQueries,
    });
  }

  if (!opts.json) {
    console.log('\n');
  }

  // Global deduplication across all categories
  const allResults = [];
  const globalSeen = new Set();

  for (const { category, results } of allCategoryResults) {
    const uniqueForCategory = [];
    for (const r of results) {
      const key = normalizeUrl(r.url);
      if (!globalSeen.has(key)) {
        globalSeen.add(key);
        uniqueForCategory.push(r);
        allResults.push(r);
      }
    }
    // Update the category's results to only include globally unique ones
    // (We still want per-category display to not repeat cross-category dupes)
    results.length = 0;
    results.push(...uniqueForCategory);
  }

  // Mark new vs. previously seen
  const markedResults = markNewResults(allResults, previousData.results);

  // Apply isNew flags back to category results
  const isNewMap = new Map(markedResults.map((r) => [normalizeUrl(r.url), r.isNew]));
  for (const { results } of allCategoryResults) {
    for (const r of results) {
      r.isNew = isNewMap.get(normalizeUrl(r.url)) ?? true;
    }
  }

  // Save results
  const savedData = saveResults(markedResults, previousData);

  // ── Output ───────────────────────────────────────────────

  if (opts.json) {
    // JSON mode: output to stdout
    const output = {
      timestamp: new Date().toISOString(),
      runNumber: savedData.runs,
      categories: allCategoryResults.map(({ category, results }) => ({
        id: category.id,
        name: category.name,
        results,
      })),
      summary: {
        totalResults: allResults.length,
        newResults: markedResults.filter((r) => r.isNew).length,
        totalQueries,
      },
    };
    console.log(JSON.stringify(output, null, 2));
  } else {
    // Terminal display mode
    for (const { category, results } of allCategoryResults) {
      printCategoryResults(category, results);
    }

    // Summary
    const emptyCategories = allCategoryResults
      .filter(({ results }) => results.length === 0)
      .map(({ category }) => category.name);

    printSummary({
      totalResults: allResults.length,
      newResults: markedResults.filter((r) => r.isNew).length,
      categoriesWithResults: allCategoryResults.filter(({ results }) => results.length > 0).length,
      totalCategories: selectedCategories.length,
      emptyCategories,
      totalQueries,
      runNumber: savedData.runs,
    });
  }

  // ── Dashboard ────────────────────────────────────────────

  if (opts.dashboard) {
    startDashboard();
  }
}

main().catch((err) => {
  printError(err.message);
  console.error(err);
  process.exit(1);
});
