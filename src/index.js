#!/usr/bin/env node

/**
 * Post Finder — Main orchestrator.
 *
 * Runs all (or selected) LinkedIn hiring query categories against
 * the Tinyfish Search API, deduplicates, persists, and displays results.
 *
 * Usage:
 *   node src/index.js                        # Run all 14 categories
 *   node src/index.js --categories 1,2,9     # Run specific categories
 *   node src/index.js --past-week            # Expand to past week (low-volume)
 *   node src/index.js --dashboard            # Also start the web dashboard
 *   node src/index.js --json                 # Output raw JSON to stdout
 *   node src/index.js --dashboard-only       # Only start the dashboard (no new search)
 */

import 'dotenv/config';
import { program } from 'commander';
import { categories } from './config.js';
import { buildCategoryQueries } from './queryBuilder.js';
import { searchBatch } from './tinyfish.js';
import { deduplicateResults, markNewResults, extractAuthor, normalizeUrl } from './dedup.js';
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
  .option('--past-week', 'Search past week instead of past 24h (for low-volume categories)')
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

  if (!opts.json) {
    console.log(`  Running ${selectedCategories.length} categories…\n`);
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
    for (const batch of batchResults) {
      if (batch.error) {
        failedQueries++;
        if (!opts.json) {
          console.log(`    ⚠️  Query failed: ${batch.error.slice(0, 80)}`);
        }
        continue;
      }
      for (const result of batch.results) {
        flatResults.push({
          ...result,
          categoryId: category.id,
          categoryName: category.name,
          author: extractAuthor(result.url),
          url: normalizeUrl(result.url),
          foundAt: new Date().toISOString(),
        });
      }
    }

    // Deduplicate within this category
    const dedupedResults = deduplicateResults(flatResults);

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
