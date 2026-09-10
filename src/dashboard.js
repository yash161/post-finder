/**
 * Dashboard server module.
 *
 * Starts a tiny Express server that serves:
 *   - /            → the dashboard HTML
 *   - /api/results → the results JSON
 */

import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getResultsFilePath, loadPreviousResults, saveResults } from './results.js';
import { runSearch, markNewResults } from './runSearch.js';
import { registerHeartbeat, getActiveUsers, getClientIp } from './activeUsers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DASHBOARD_HTML = join(__dirname, '..', 'dashboard', 'index.html');
const PORT = 3000;

export function startDashboard() {
  const app = express();
  app.use(express.json());

  // Serve dashboard HTML
  app.get('/', (_req, res) => {
    res.sendFile(DASHBOARD_HTML);
  });

  // API endpoint for results JSON
  app.get('/api/results', (_req, res) => {
    const resultsPath = getResultsFilePath();
    if (!existsSync(resultsPath)) {
      return res.json({ results: [], lastRun: null, runs: 0 });
    }
    try {
      const data = JSON.parse(readFileSync(resultsPath, 'utf-8'));
      res.json(data);
    } catch {
      res.status(500).json({ error: 'Failed to read results' });
    }
  });

  // Presence — the dashboard pings this to say "I'm still here", and polls
  // it to show how many people are currently viewing the page (plus their
  // name/IP, best-effort based on the heartbeat's sender).
  app.post('/api/active-users', (req, res) => {
    const { sessionId, name } = req.body || {};
    registerHeartbeat(sessionId, name, getClientIp(req));
    res.json({ ok: true });
  });

  app.get('/api/active-users', (_req, res) => {
    const users = getActiveUsers();
    res.json({ count: users.length, users });
  });

  // "Run Now" — runs a fresh search across all categories and saves to data/results.json
  app.post('/api/run', async (req, res) => {
    const hours = Number.isFinite(+req.body?.hours) && +req.body.hours > 0 ? +req.body.hours : 24;
    console.log(`\n  ▶ Run Now triggered from dashboard (past ${hours}h)…`);
    try {
      const previousData = loadPreviousResults();
      const allResults = await runSearch({ maxHours: hours });
      const markedResults = markNewResults(allResults, previousData.results);
      const savedData = saveResults(markedResults, previousData);
      const newCount = markedResults.filter((r) => r.isNew).length;
      console.log(`  ✅ Run complete — ${newCount} new, ${savedData.results.length} tracked total.\n`);
      res.json({ ok: true, newCount, totalCount: savedData.results.length, data: savedData });
    } catch (err) {
      console.error(`  ❌ Run failed: ${err.message}\n`);
      res.status(500).json({ error: err.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`\n  🌐 Dashboard running at http://localhost:${PORT}\n`);
  });
}
