/**
 * Email digest mailer.
 *
 * Reads data/results.json, filters for new posts,
 * and sends an HTML email digest grouped by category.
 *
 * Uses Nodemailer + Gmail (same pattern as the portfolio app).
 *
 * Usage:
 *   node src/mailer.js              # Send digest if new posts exist
 *   node src/mailer.js --force      # Send even if no new posts
 *   node src/mailer.js --dry-run    # Preview without sending
 */

import 'dotenv/config';
import nodemailer from 'nodemailer';
import { loadPreviousResults } from './results.js';
import { filterByRecency } from './dateParser.js';

// ── Config ───────────────────────────────────────────────────

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
const RECIPIENT = process.env.EMAIL_RECIPIENT || 'yashshah3698@gmail.com';

if (!GMAIL_USER || !GMAIL_PASS) {
  console.error('  ❌ GMAIL_USER and GMAIL_APP_PASSWORD must be set (environment or .env).');
  console.error('  Never hardcode credentials in source — the repo is public.');
  process.exit(1);
}
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'https://post-finder-neon.vercel.app';

const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_HOURS = parseInt(
  process.argv.find((a, i) => process.argv[i - 1] === '--hours') || '24',
  10
);

// ── Category metadata ────────────────────────────────────────

const CATEGORIES = {
  1: 'Cloud Automation / DevOps / Platform',
  2: 'SRE / Infrastructure',
  3: 'Kubernetes / Containers',
  4: 'Terraform / Ansible / IaC',
  5: 'AWS',
  6: 'Azure',
  7: 'CockroachDB / Database Migration / CDC',
  8: 'CI/CD Tooling',
  9: 'AI Infrastructure / Agentic AI / MLOps',
  10: 'Full-Stack Engineer',
  11: 'AI Engineer / MLOps / Perception',
  12: 'HIL / Software Test Automation',
  13: 'General Software Engineering',
  14: 'Data Engineering / ETL',
  15: 'Web Scraping / Data Extraction',
  16: 'Linux / RHEL System Administration',
  17: 'NoSQL / Graph Databases',
  18: 'GCP (Google Cloud)',
  19: 'Security Engineering / DevSecOps',
  20: 'IoT / Embedded Systems',
  21: 'Internal Tooling / ChatOps / Integration',
};

const TIER_COLORS = {
  core: '#6C63FF',
  cloud: '#00D2FF',
  specialty: '#FF6B6B',
};

function getTier(catId) {
  if (catId <= 4) return 'core';
  if (catId <= 8) return 'cloud';
  return 'specialty';
}

// ── Build email HTML ─────────────────────────────────────────

function buildEmailHtml(newPosts, totalPosts, runNumber) {
  const grouped = {};
  for (const post of newPosts) {
    const catId = post.categoryId || 0;
    if (!grouped[catId]) grouped[catId] = [];
    grouped[catId].push(post);
  }

  const catIds = Object.keys(grouped).map(Number).sort((a, b) => a - b);
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  let categorySections = '';

  for (const catId of catIds) {
    const posts = grouped[catId];
    const catName = CATEGORIES[catId] || `Category ${catId}`;
    const tier = getTier(catId);
    const color = TIER_COLORS[tier];

    let postRows = '';
    for (const post of posts) {
      const author = post.author || '—';
      const dateStr = post.date || '';
      const snippet = post.snippet
        ? `<p style="margin:2px 0 0 0;color:#888;font-size:13px;line-height:1.4;">${escHtml(post.snippet).slice(0, 120)}${post.snippet.length > 120 ? '…' : ''}</p>`
        : '';

      postRows += `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #2a2a3a;">
            <a href="${escHtml(post.url)}" style="color:#e8e8f0;text-decoration:none;font-weight:600;font-size:14px;">
              ${escHtml(post.title || 'Untitled')}
            </a>
            ${snippet}
            <p style="margin:4px 0 0 0;font-size:12px;">
              <span style="color:${color};">👤 ${escHtml(author)}</span>
              ${dateStr ? `<span style="color:#FBBF24;margin-left:12px;">📅 ${escHtml(dateStr)}</span>` : ''}
            </p>
          </td>
        </tr>
      `;
    }

    categorySections += `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="padding:8px 16px;background:linear-gradient(90deg,${color}22,transparent);border-left:3px solid ${color};border-radius:4px;">
            <span style="font-weight:700;font-size:15px;color:${color};">${catId}. ${escHtml(catName)}</span>
            <span style="color:#888;font-size:12px;margin-left:8px;">${posts.length} new</span>
          </td>
        </tr>
        ${postRows}
      </table>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8" /></head>
    <body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#12121a;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="padding:24px 24px 16px;background:linear-gradient(135deg,#6C63FF22,#00D2FF11);border-bottom:1px solid #2a2a3a;">
            <h1 style="margin:0;font-size:22px;color:#e8e8f0;">
              🔍 Post Finder Digest
            </h1>
            <p style="margin:6px 0 0;font-size:13px;color:#9090aa;">
              ${date} · Run #${runNumber}
            </p>
          </td>
        </tr>

        <!-- Stats -->
        <tr>
          <td style="padding:16px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align:center;padding:12px;background:#1a1a2e;border-radius:8px;width:33%;">
                  <div style="font-size:24px;font-weight:700;color:#4ADE80;">${newPosts.length}</div>
                  <div style="font-size:11px;color:#888;text-transform:uppercase;">New Posts</div>
                </td>
                <td width="8"></td>
                <td style="text-align:center;padding:12px;background:#1a1a2e;border-radius:8px;width:33%;">
                  <div style="font-size:24px;font-weight:700;color:#6C63FF;">${catIds.length}</div>
                  <div style="font-size:11px;color:#888;text-transform:uppercase;">Categories</div>
                </td>
                <td width="8"></td>
                <td style="text-align:center;padding:12px;background:#1a1a2e;border-radius:8px;width:33%;">
                  <div style="font-size:24px;font-weight:700;color:#00D2FF;">${totalPosts}</div>
                  <div style="font-size:11px;color:#888;text-transform:uppercase;">Total Tracked</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Categories -->
        <tr>
          <td style="padding:8px 24px 24px;">
            ${categorySections}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 24px;background:#0e0e18;border-top:1px solid #2a2a3a;text-align:center;">
            <a href="${DASHBOARD_URL}" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#6C63FF,#00D2FF);color:white;text-decoration:none;border-radius:20px;font-weight:600;font-size:14px;">
              Open Dashboard ↗
            </a>
            <p style="margin:12px 0 0;font-size:11px;color:#606078;">
              Automated by Post Finder · Powered by Tinyfish Search API
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Build a plain-text version for email clients that don't support HTML.
 */
function buildEmailText(newPosts, totalPosts, runNumber) {
  const grouped = {};
  for (const post of newPosts) {
    const catId = post.categoryId || 0;
    if (!grouped[catId]) grouped[catId] = [];
    grouped[catId].push(post);
  }

  const catIds = Object.keys(grouped).map(Number).sort((a, b) => a - b);
  let text = `🔍 Post Finder Digest — ${newPosts.length} new posts\n`;
  text += `Run #${runNumber} · ${new Date().toLocaleDateString()}\n\n`;

  for (const catId of catIds) {
    const catName = CATEGORIES[catId] || `Category ${catId}`;
    text += `━━━ ${catId}. ${catName} (${grouped[catId].length} new) ━━━\n`;

    for (const post of grouped[catId]) {
      const author = post.author || '—';
      text += `\n• ${post.title || 'Untitled'}`;
      if (post.date) text += ` (${post.date})`;
      text += `\n  by ${author}`;
      text += `\n  → ${post.url}\n`;
    }
    text += '\n';
  }

  text += `\n📊 Dashboard: ${DASHBOARD_URL}\n`;
  return text;
}

// ── Send ─────────────────────────────────────────────────────

async function main() {
  console.log('📧 Post Finder Mailer\n');

  // Load results
  const data = loadPreviousResults();
  const allResults = data.results || [];
  const runNumber = data.runs || 0;

  // Filter to only new posts within the time window
  const newPosts = filterByRecency(
    allResults.filter((r) => r.isNew),
    MAX_HOURS
  );

  console.log(`  Total posts:    ${allResults.length}`);
  console.log(`  New (all time): ${allResults.filter(r => r.isNew).length}`);
  console.log(`  New (past ${MAX_HOURS}h): ${newPosts.length}`);
  console.log(`  Run #:          ${runNumber}`);

  if (newPosts.length === 0 && !FORCE) {
    console.log('\n  ✅ No new posts within time window — skipping email.');
    return;
  }

  if (newPosts.length === 0 && FORCE) {
    console.log('\n  ⚠️  No new posts but --force flag set, sending anyway.');
  }

  const dateLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const subject = `Post Finder: ${newPosts.length} new hiring posts - ${dateLabel}`;
  const html = buildEmailHtml(newPosts, allResults.length, runNumber);
  const text = buildEmailText(newPosts, allResults.length, runNumber);

  if (DRY_RUN) {
    console.log('\n  📝 DRY RUN — email preview:\n');
    console.log(`  To: ${RECIPIENT}`);
    console.log(`  Subject: ${subject}`);
    console.log(`\n${text}`);
    return;
  }

  // Create transporter — use SMTP directly for better deliverability
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: GMAIL_USER.includes('@') ? GMAIL_USER : `${GMAIL_USER}@gmail.com`,
      pass: GMAIL_PASS,
    },
  });

  const senderEmail = GMAIL_USER.includes('@') ? GMAIL_USER : `${GMAIL_USER}@gmail.com`;

  const mailOptions = {
    // "from" must match the authenticated Gmail account to avoid spam
    from: `"Yash - Post Finder" <${senderEmail}>`,
    to: RECIPIENT,
    replyTo: RECIPIENT,
    subject,
    text,
    html,
    headers: {
      // Signals this is a wanted, non-bulk personal notification
      'X-Priority': '3',
      'X-Mailer': 'Post Finder Automation',
      'Precedence': 'bulk',
      'List-Unsubscribe': `<mailto:${senderEmail}?subject=unsubscribe>`,
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`\n  ✅ Email sent! Message ID: ${info.messageId}`);
  } catch (err) {
    console.error(`\n  ❌ Email failed: ${err.message}`);
    process.exit(1);
  }
}

// ── Helpers ──────────────────────────────────────────────────

function escHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

main();
