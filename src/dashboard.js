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
import { getResultsFilePath } from './results.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DASHBOARD_HTML = join(__dirname, '..', 'dashboard', 'index.html');
const PORT = 3000;

export function startDashboard() {
  const app = express();

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

  app.listen(PORT, () => {
    console.log(`\n  🌐 Dashboard running at http://localhost:${PORT}\n`);
  });
}
