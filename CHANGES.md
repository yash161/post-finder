# post-finder — review & improvements (2026-10-03)

Improved copy of https://github.com/yash161/post-finder. Review covered all
source files, the GitHub Actions workflow, and the Vercel setup.

## What the system does

Scheduled LinkedIn hiring-post discovery: 21 query categories × ~4-5 boolean
queries run against the Tinyfish Search API 3×/day via GitHub Actions,
results deduplicated and stored in `data/results.json`, a static dashboard
served from `dashboard/` on Vercel, email digests via Gmail SMTP, and a
"Run Now" button that triggers a fresh search through a Vercel serverless
function (`api/run.js`).

## Issues found and fixed in this copy

1. **Hardcoded Gmail credentials in a public repo** (`src/mailer.js`)
   The Gmail username and app password were hardcoded as fallback defaults.
   Anyone reading the public repo could send mail from that account.
   Fix: credentials now come only from `GMAIL_USER` / `GMAIL_APP_PASSWORD`
   env vars (or `.env`); the mailer exits with a clear error if missing.
   ⚠️ The exposed app password should be revoked in Google Account settings
   and replaced, regardless of this fix.

2. **Unauthenticated `/api/run` endpoint** (`api/run.js`)
   Anyone on the internet could POST to it and burn Tinyfish API quota plus
   commit to the repo on every call.
   Fix: every POST must carry a `RUN_SECRET` (Vercel env var) as the
   `x-run-secret` header or `?secret=` param; otherwise 401. The dashboard's
   Run Now button prompts for the secret once per session and retries the
   prompt if it's rejected.

3. **Import-time crash when API key missing** (`src/tinyfish.js`)
   The module threw at import time if `TINYFISH_API_KEY` was unset, so even
   the serverless function's clean 500-message path could never run.
   Fix: the key is now checked inside `search()` at call time.

4. **GitHub commit race** (`api/run.js`)
   A manual Run Now overlapping the scheduled Action could fail with a
   409/422 on a stale blob sha.
   Fix: one automatic retry with a freshly fetched sha.

5. **Committed `.DS_Store`** — added to `.gitignore` (delete the tracked
   file: `git rm --cached .DS_Store`).

## Verified

- `node --check` passes on all 13 JS files.
- Smoke-tested queryBuilder / dedup / dateParser (query building, location
  + group matching, URL normalization, recency filter).
- Live-tested `api/run.js` handler: GET→405, no RUN_SECRET→500, wrong
  secret→401, correct secret without keys→500.

## To apply (maintainer steps)

1. Revoke the exposed Gmail app password; generate a new one.
2. Copy the changed files over the repo:
   `src/mailer.js`, `src/tinyfish.js`, `api/run.js`,
   `dashboard/index.html`, `.gitignore`.
3. Set `RUN_SECRET` in Vercel → Project → Settings → Environment Variables
   (any long random string).
4. `git rm --cached .DS_Store`, commit, push.
5. Test the dashboard Run Now button with the new secret.

## Round 2 — more jobs per run (2026-10-03, later)

Focused purely on recall (finding MORE posts). No UI or structural changes.

1. **`limit` param** (`src/tinyfish.js`): Tinyfish returns ~10 results per call
   unless asked. Now requests 30 per call by default (`--limit` to tune,
   up to the API's max). ~3x more raw results per query for the same number
   of API calls.
2. **Pagination** (`src/tinyfish.js`, `--pages`, `api/run.js` body `pages`):
   `page` param support; fetches page 2+ per query when asked, stopping
   early when a page comes back short. Default stays 1 to protect API quota —
   use `--pages 2` on local runs where you want maximum coverage.
3. **Hiring-phrase groups no longer hard-reject** (`src/queryBuilder.js`):
   groups made only of hiring phrases ("we're hiring" OR "we are hiring")
   are now skipped; only the skill/role groups are enforced. Snippets often
   truncate the exact phrase, so this was silently dropping legit posts.
   Off-topic posts (no skill-term match) are still rejected — verified.
4. **"united states" location check removed** (`src/queryBuilder.js`):
   every search already carries `location=US` server-side; requiring the
   literal phrase in a short snippet was dropping legit US posts. City
   queries (SF/LA) still verify the city in title/snippet — verified.

Verified: URL carries `limit`/`page`/`recency_minutes`/`location`; a legit
post previously rejected by the hiring-phrase group now passes while an
off-topic post is still rejected; city checks still enforced; `--help`
shows the new flags; `node --check` clean on all touched files.

## Not changed (working as designed)

- Scheduled workflow (`scheduled-search.yml`): secrets-based, commits results
  back, 15-min timeout is enough for ~90 sequential queries.
- Query config (21 categories), location/topic post-filters, dedup logic,
  date parsing, dashboard rendering, email digest format.
