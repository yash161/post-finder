/**
 * Vercel serverless function — runs a fresh Tinyfish search on demand
 * (triggered by the "Run Now" button on the dashboard) and commits the
 * merged results back to GitHub via the Contents API.
 *
 * Protected by RUN_SECRET: every POST must carry it as the `x-run-secret`
 * header (or `?secret=` query param). Without it the endpoint returns 401.
 * Set RUN_SECRET in Vercel env vars — never commit it.
 *
 * Only data/results.json is written here — it's the single source of
 * truth (same file the scheduled GitHub Action writes to). The commit
 * triggers a Vercel redeploy, whose existing buildCommand (see
 * vercel.json) copies it into dashboard/api/results.json, so we don't
 * duplicate that write and risk the two files diverging if one commit
 * succeeds and the other doesn't. The response also returns the fresh
 * data directly, so the dashboard updates immediately without waiting
 * on the redeploy.
 *
 * POST /api/run
 * Body: { hours?: number, limit?: number, pages?: number }
 */

import { runSearch, markNewResults } from '../src/runSearch.js';

const GITHUB_REPO = process.env.GITHUB_REPO || 'yash161/post-finder';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GITHUB_API = 'https://api.github.com';

async function githubRequest(path, options = {}) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function getFile(path) {
  try {
    const data = await githubRequest(`/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`);
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return { json: JSON.parse(content), sha: data.sha };
  } catch {
    return { json: { results: [], lastRun: null, runs: 0 }, sha: null };
  }
}

async function putFile(path, json, sha, message) {
  const content = Buffer.from(JSON.stringify(json, null, 2), 'utf-8').toString('base64');
  try {
    await githubRequest(`/repos/${GITHUB_REPO}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({ message, content, sha: sha || undefined, branch: GITHUB_BRANCH }),
    });
  } catch (err) {
    // A concurrent run (scheduled Action + manual Run Now) can change the
    // blob sha between our read and write → retry once with a fresh sha.
    if (/GitHub API (409|422)/.test(err.message)) {
      const fresh = await getFile(path);
      await githubRequest(`/repos/${GITHUB_REPO}/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify({ message, content, sha: fresh.sha || undefined, branch: GITHUB_BRANCH }),
      });
      return;
    }
    throw err;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' });
    return;
  }

  // Read at request time so a newly-set env var never needs a redeploy to take effect.
  const RUN_SECRET = process.env.RUN_SECRET;
  if (!RUN_SECRET) {
    res.status(500).json({ error: 'RUN_SECRET is not configured on the server.' });
    return;
  }
  const provided = req.headers['x-run-secret'] || req.query?.secret;
  if (provided !== RUN_SECRET) {
    res.status(401).json({ error: 'Unauthorized: invalid run secret.' });
    return;
  }

  if (!process.env.TINYFISH_API_KEY) {
    res.status(500).json({ error: 'TINYFISH_API_KEY is not configured on the server.' });
    return;
  }
  if (!process.env.GH_TOKEN) {
    res.status(500).json({ error: 'GH_TOKEN is not configured on the server.' });
    return;
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const maxHours = Number.isFinite(+body.hours) && +body.hours > 0 ? +body.hours : 24;
  const limit = Number.isFinite(+body.limit) && +body.limit > 0 ? Math.min(+body.limit, 100) : 30;
  const maxPages = Number.isFinite(+body.pages) && +body.pages > 0 ? Math.min(+body.pages, 5) : 1;

  try {
    const dataFile = await getFile('data/results.json');
    const previousData = dataFile.json;

    const allResults = await runSearch({ maxHours, limit, maxPages });
    const markedResults = markNewResults(allResults, previousData.results || []);

    // Merge with previous, mirroring src/results.js saveResults()
    const previousUrls = new Set((previousData.results || []).map((r) => r.url));
    const merged = [...(previousData.results || [])];
    for (const result of markedResults) {
      if (!previousUrls.has(result.url)) {
        merged.push(result);
      }
    }

    const newData = {
      results: merged,
      lastRun: new Date().toISOString(),
      runs: (previousData.runs || 0) + 1,
    };

    const commitMessage = `🔍 Manual run via dashboard — ${new Date().toISOString()} [skip ci]`;
    await putFile('data/results.json', newData, dataFile.sha, commitMessage);

    res.status(200).json({
      ok: true,
      newCount: markedResults.filter((r) => r.isNew).length,
      totalCount: newData.results.length,
      data: newData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
