/**
 * Vercel serverless function — runs a fresh Tinyfish search on demand
 * (triggered by the "Run Now" button on the dashboard) and commits the
 * merged results back to GitHub via the Contents API, so data/results.json
 * and dashboard/api/results.json stay in sync with what the scheduled
 * GitHub Action produces.
 *
 * POST /api/run
 * Body: { hours?: number }
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
  await githubRequest(`/repos/${GITHUB_REPO}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content, sha: sha || undefined, branch: GITHUB_BRANCH }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' });
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

  try {
    const [dataFile, dashboardFile] = await Promise.all([
      getFile('data/results.json'),
      getFile('dashboard/api/results.json'),
    ]);
    const previousData = dataFile.json;

    const allResults = await runSearch({ maxHours });
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
    await Promise.all([
      putFile('data/results.json', newData, dataFile.sha, commitMessage),
      putFile('dashboard/api/results.json', newData, dashboardFile.sha, commitMessage),
    ]);

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
