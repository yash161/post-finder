/**
 * Result storage — JSON file persistence.
 *
 * Stores results in data/results.json with metadata about
 * when each result was first seen, which category it matched, etc.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const RESULTS_FILE = join(DATA_DIR, 'results.json');

/**
 * Load previously stored results from disk.
 * @returns {Object} { results: [...], lastRun: ISO string | null, runs: number }
 */
export function loadPreviousResults() {
  try {
    if (!existsSync(RESULTS_FILE)) {
      return { results: [], lastRun: null, runs: 0 };
    }
    const raw = readFileSync(RESULTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { results: [], lastRun: null, runs: 0 };
  }
}

/**
 * Save results to disk, merging with previous results.
 *
 * @param {Object[]} newResults - This run's results (already deduplicated, with isNew flags)
 * @param {Object} previousData - The object returned by loadPreviousResults()
 */
export function saveResults(newResults, previousData) {
  // Ensure data directory exists
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  // Merge: keep all previous results, add truly new ones
  const previousUrls = new Set(previousData.results.map((r) => r.url));
  const merged = [...previousData.results];

  for (const result of newResults) {
    if (!previousUrls.has(result.url)) {
      merged.push(result);
    }
  }

  const data = {
    results: merged,
    lastRun: new Date().toISOString(),
    runs: (previousData.runs || 0) + 1,
  };

  writeFileSync(RESULTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

/**
 * Get the path to the results file (for the dashboard to serve).
 * @returns {string}
 */
export function getResultsFilePath() {
  return RESULTS_FILE;
}

/**
 * Get the data directory path.
 * @returns {string}
 */
export function getDataDir() {
  return DATA_DIR;
}
