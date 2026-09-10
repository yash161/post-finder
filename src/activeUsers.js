/**
 * Active-user presence tracking for the dashboard.
 *
 * The dashboard page sends a heartbeat every few seconds with a
 * per-browser session id and an optional display name. We keep the
 * most recent heartbeat per session in memory and consider a session
 * "active" until it goes quiet for HEARTBEAT_TIMEOUT_MS.
 *
 * This is in-memory only — fine for the long-running local Express
 * server (src/dashboard.js). On Vercel it's best-effort: state only
 * survives across requests handled by the same warm Lambda instance,
 * so the count can undercount when traffic spreads across instances.
 */

const HEARTBEAT_TIMEOUT_MS = 45_000;

const activeUsers = new Map(); // sessionId -> { name, ip, lastSeen }

/**
 * Record a heartbeat for a session.
 * @param {string} sessionId
 * @param {string} [name]
 * @param {string} [ip]
 */
export function registerHeartbeat(sessionId, name, ip) {
  if (!sessionId || typeof sessionId !== 'string') return;
  const cleanName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 40) : 'Guest';
  activeUsers.set(sessionId.slice(0, 100), {
    name: cleanName,
    ip: ip || 'unknown',
    lastSeen: Date.now(),
  });
}

/**
 * Get the list of currently active users (heartbeat within the timeout window).
 * @returns {{ id: string, name: string, ip: string, lastSeen: string }[]}
 */
export function getActiveUsers() {
  const now = Date.now();
  for (const [id, user] of activeUsers) {
    if (now - user.lastSeen > HEARTBEAT_TIMEOUT_MS) {
      activeUsers.delete(id);
    }
  }
  return [...activeUsers.entries()]
    .map(([id, user]) => ({
      id,
      name: user.name,
      ip: user.ip,
      lastSeen: new Date(user.lastSeen).toISOString(),
    }))
    .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
}

/**
 * Best-effort extraction of the requester's IP from a Node HTTP request,
 * working for both Express (local dashboard) and Vercel serverless requests.
 * @param {import('http').IncomingMessage} req
 * @returns {string}
 */
export function getClientIp(req) {
  const xff = req.headers?.['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
}
