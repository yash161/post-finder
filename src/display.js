/**
 * Terminal display module.
 *
 * Rich formatted output grouped by category, with color coding,
 * new-result indicators, and a summary footer.
 */

import chalk from 'chalk';

/**
 * Print the header banner.
 */
export function printHeader() {
  console.log();
  console.log(chalk.bold.hex('#6C63FF')('╔══════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.hex('#6C63FF')('║') + chalk.bold.white('    🔍  LinkedIn Post Finder — Tinyfish Search           ') + chalk.bold.hex('#6C63FF')('║'));
  console.log(chalk.bold.hex('#6C63FF')('╚══════════════════════════════════════════════════════════╝'));
  console.log();
}

/**
 * Print progress during API calls.
 * @param {number} completed
 * @param {number} total
 * @param {string} categoryName
 */
export function printProgress(completed, total, categoryName) {
  const bar = '█'.repeat(Math.round((completed / total) * 20));
  const empty = '░'.repeat(20 - bar.length);
  process.stdout.write(
    `\r  ${chalk.dim(`[${bar}${empty}]`)} ${chalk.cyan(`${completed}/${total}`)} queries — ${chalk.dim(categoryName)}`
  );
  if (completed === total) {
    process.stdout.write('\n');
  }
}

/**
 * Print results for a single category.
 *
 * @param {Object} category - Category object from config
 * @param {Object[]} results - Results for this category (with isNew flags)
 */
export function printCategoryResults(category, results) {
  const tierColor = category.id <= 4
    ? '#6C63FF'    // Core (purple)
    : category.id <= 8
      ? '#00D2FF'  // Cloud specifics (cyan)
      : '#FF6B6B'; // Specialties (coral)

  console.log(
    chalk.bold.hex(tierColor)(`━━━ ${category.id}. ${category.name} ━━━`)
  );

  if (results.length === 0) {
    console.log(chalk.dim('  (no results)'));
    console.log();
    return;
  }

  const newCount = results.filter((r) => r.isNew).length;
  if (newCount > 0) {
    console.log(chalk.green(`  ${newCount} new`) + chalk.dim(` / ${results.length} total`));
  } else {
    console.log(chalk.dim(`  ${results.length} results (all previously seen)`));
  }

  for (const result of results) {
    const indicator = result.isNew ? chalk.green.bold('🆕 ') : chalk.dim('   ');
    const dateStr = result.date ? chalk.yellow(result.date) + '  ' : '';

    console.log(`  ${indicator}${dateStr}${chalk.white(truncate(result.title, 70))}`);

    if (result.snippet) {
      console.log(`       ${chalk.dim(truncate(result.snippet, 80))}`);
    }

    if (result.author) {
      console.log(`       ${chalk.hex('#A0A0FF')('by ' + result.author)}`);
    }

    console.log(`       ${chalk.underline.hex('#888')(result.url)}`);
    console.log(chalk.dim('  ───'));
  }

  console.log();
}

/**
 * Print the run summary.
 *
 * @param {Object} summary
 * @param {number} summary.totalResults
 * @param {number} summary.newResults
 * @param {number} summary.categoriesWithResults
 * @param {number} summary.totalCategories
 * @param {string[]} summary.emptyCategories
 * @param {number} summary.totalQueries
 * @param {number} summary.runNumber
 */
export function printSummary(summary) {
  console.log(chalk.bold.hex('#6C63FF')('━━━ Summary ━━━'));
  console.log(`  ${chalk.green.bold(summary.newResults)} new posts out of ${chalk.white.bold(summary.totalResults)} total`);
  console.log(`  ${chalk.cyan(summary.categoriesWithResults)}/${chalk.white(summary.totalCategories)} categories returned results`);
  console.log(`  ${chalk.dim(summary.totalQueries + ' API queries executed')}`);

  if (summary.emptyCategories.length > 0) {
    console.log(`  ${chalk.yellow('Empty:')} ${chalk.dim(summary.emptyCategories.join(', '))}`);
  }

  console.log();
  console.log(chalk.dim('  💡 Run again in ~12 hours to cover the full 48h window.'));
  console.log(chalk.dim(`  📊 Run #${summary.runNumber} — ${new Date().toLocaleString()}`));
  console.log();
}

/**
 * Print an error message.
 * @param {string} message
 */
export function printError(message) {
  console.error(chalk.red.bold('  ❌  ') + chalk.red(message));
}

/**
 * Print a rate-limit retry notice.
 * @param {number} retryNum
 * @param {number} waitMs
 */
export function printRetry(retryNum, waitMs) {
  const waitSec = Math.round(waitMs / 1000);
  console.log(chalk.yellow(`\n  ⏳ Rate limited — retry ${retryNum}, waiting ${waitSec}s…`));
}

/**
 * Truncate a string to a max length.
 * @param {string} str
 * @param {number} max
 * @returns {string}
 */
function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}
