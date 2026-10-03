/**
 * Company name extraction from LinkedIn post titles/snippets.
 *
 * Hiring posts usually name the company ("Acme Corp is hiring…",
 * "Join our team at Stripe", "DevOps Engineer at Datadog"). This module
 * extracts it with conservative patterns and a location/generic-term
 * blocklist so we never show a city or "Remote" as a company.
 *
 * Returns the company name string, or null when unsure.
 */

const WORD = "[A-Z0-9][\\w&'.-]*";
const NAME = `(${WORD}(?:\\s+${WORD}){0,3})`;
// Case-insensitive wrapper for keyword parts only — the NAME itself stays
// case-sensitive so it can't swallow lowercase words ("Vercel we are hiring").
const I = (s) => `(?i:${s})`;

const PATTERNS = [
  // "Acme Corp is hiring a DevOps Engineer"
  new RegExp(`${NAME}\\s+${I('is')}\\s+${I('hiring')}\\b`),
  // "Join our team at Stripe" / "Join the team at Acme Corp"
  new RegExp(`\\b${I('join')}\\s+(?:${I('our\\s+team\\s+at')}|${I('the\\s+team\\s+at')}|${I('us\\s+at')}|${I('our\\s+team')}|${I('the\\s+team')})\\s+${NAME}`),
  // "We're hiring for a Senior SRE at Netflix"
  new RegExp(`\\b${I("we(?:'re|\\s+are)\\s+hiring")}\\b[^.\\n]{0,60}?\\b${I('at')}\\s+${NAME}`),
  // "Now hiring: DevOps Engineer at Datadog"
  new RegExp(`\\b(?:${I('now')}\\s+)?${I('hiring')}\\b[^.\\n]{0,60}?\\b${I('at')}\\s+${NAME}`),
];

// Words that are never a company name on their own or in a candidate.
const BLOCKLIST = new Set([
  'united states', 'san francisco', 'los angeles', 'new york', 'san jose',
  'remote', 'hybrid', 'onsite', 'on-site', 'us', 'usa', 'u.s.',
  'full-time', 'full time', 'part-time', 'part time', 'contract',
  'hiring', 'join', 'team', 'our team', 'my team',
]);

// Common first names — a single-word candidate matching one of these is
// almost certainly a person's name fragment, not a company.
const FIRST_NAMES = new Set(
  'james john robert michael william david joseph thomas charles daniel matthew joe jane mary patricia jennifer linda elizabeth barbara susan jessica sarah karen nancy lisa betty margaret sandra ashley emily alex chris mike dave steve brian kevin jason jeff mark paul andrew josh ryan nick tony sam ben tom will jim bob tommy'.split(' ')
);
// Location words: a candidate ending in these is a "Company City" glue —
// strip them ("Netflix Los Angeles" → "Netflix", "3M St Paul" → "3M").
const LOCATION_WORDS = new Set([
  'san', 'los', 'las', 'new', 'santa', 'mountain', 'menlo', 'palo',
  'redwood', 'sunnyvale', 'francisco', 'angeles', 'diego', 'jose',
  'york', 'austin', 'seattle', 'boston', 'chicago', 'denver', 'alto',
  'clara', 'view', 'park', 'city', 'beach', 'vegas', 'st', 'paul',
  'valley', 'county',
]);

function cleanCompany(raw) {
  if (!raw) return null;
  // Strip possessives and trailing punctuation
  let s = raw.trim().replace(/[''']s$/i, '').replace(/[.,:;!?]+$/, '').trim();
  const words = s.split(/\s+/).filter(Boolean);
  // Drop leading articles
  while (words.length && /^(the|a|an)$/i.test(words[0])) words.shift();
  // Drop trailing location words ("Netflix Los Angeles" → "Netflix")
  while (words.length && LOCATION_WORDS.has(words[words.length - 1].toLowerCase())) words.pop();
  if (words.length === 0 || words.length > 4) return null;
  // Every word must look like a proper noun (or an acronym like IBM / 3M)
  for (const w of words) {
    if (!/^[A-Z0-9]/.test(w)) return null;
  }
  const lowered = words.join(' ').toLowerCase();
  if (BLOCKLIST.has(lowered)) return null;
  // A lone first name is not a company ("Joe's Bar" → "Joe").
  if (words.length === 1 && FIRST_NAMES.has(lowered)) return null;
  // Block candidates that END with a blocklisted word ("Google Remote" etc.)
  const last = words[words.length - 1].toLowerCase();
  if (['remote', 'hybrid', 'onsite', 'us', 'usa'].includes(last)) return null;
  return words.join(' ');
}

/**
 * Extract a company name from a post title/snippet.
 *
 * @param {string} title
 * @param {string} snippet
 * @returns {string|null}
 */
export function extractCompany(title = '', snippet = '') {
  const text = `${title || ''} ${snippet || ''}`;
  for (const re of PATTERNS) {
    const m = text.match(re);
    if (m) {
      const name = cleanCompany(m[1]);
      if (name) return name;
    }
  }
  return null;
}
