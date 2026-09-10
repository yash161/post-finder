/**
 * Vercel serverless function — tracks who's currently viewing the dashboard.
 *
 * POST records a heartbeat (session id + optional display name); GET
 * returns everyone seen recently. State lives in module scope, so it's
 * only shared across requests handled by the same warm Lambda instance —
 * with Vercel free to spin up multiple instances, this is a best-effort
 * presence view rather than a guaranteed global count.
 *
 * POST /api/active-users  Body: { sessionId: string, name?: string }
 * GET  /api/active-users  -> { count, users: [{ id, name, ip, lastSeen }] }
 */

import { registerHeartbeat, getActiveUsers, getClientIp } from '../src/activeUsers.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    registerHeartbeat(body.sessionId, body.name, getClientIp(req));
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method === 'GET') {
    const users = getActiveUsers();
    res.status(200).json({ count: users.length, users });
    return;
  }

  res.status(405).json({ error: 'Use GET or POST' });
}
