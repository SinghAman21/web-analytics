(The file `/home/aman/Documents/code/web-analytics/.agents/summary.md` exists, but is empty)
Project: Web Analytics

High-level purpose:
- A privacy-first analytics product with two implemented tiers:
	- ultrafree: public, anonymous dashboards and public tracker scripts.
	- free: signed-in dashboards for a user’s own sites.
- Pro exists in the UI copy, but it is not implemented yet. Keep it blank / future-only.

Core tier mapping:
- ultrafree = public tier, no login required.
- free = Google-signed-in tier, user-owned sites only.
- pro = not separated in code yet.

What ultrafree means in this codebase:
- No login is required to create or view the public dashboard flow.
- The public site list lives under `/public`, creation under `/public/new`, and analytics under `/analytics/[hex]`.
- Public dashboards are explicitly labeled FREE in the UI copy.
- Retention is 30 days in both the page copy and the analytics API path, which calls processing with `hours=720`.
- Metrics shown publicly are aggregate only: pageviews, unique visitors, bounce rate, sessions, average pages per session, device split, daily chart, and top pages.
- The UI also shows locked upgrade-only features such as page performance, referrers, UTM breakdown, browsers/OS, geography, live sessions, funnels, and trends.
- All files and APIs named `ultrafree` belong to this tier: backend routers, backend services, backend processing, SQL model files, frontend API wrappers, and the tracker script.
- The tracker script stores `ultrafree_cookie` and `ultrafree_session`, auto-inits from `data-site-hex`, and sends data to `/api/ping`.
- The backend ingest endpoint for ultrafree events is `/api/ping`, not the older comment references to `/api/ultrafreeevents`.

What free means in this codebase:
- Free users sign in with Google through the login page.
- Auth is session-based; the backend issues an HttpOnly `auth-token` cookie and session expiry is 15 days.
- Free users can create their own sites and only see sites they own.
- Free site creation and listing are credentials-based and use the authenticated `/api/auth/free-sites` routes.
- Retention is 90 days in the dashboard UI and billing copy.
- The free dashboard is for signed-in users, shows only their own sites, and routes to `/sites/new` for new site creation.
- Site creation normalizes URLs, prevents duplicate URLs per user, and stores a 12-character share ID.
- The free data model uses `free_users`, `free_user_sessions`, and `free_sites` tables.
- The code and UI suggest additional features beyond ultrafree, including live users, referrers, geo data, browsers/OS, and richer analytics views.

Backend architecture:
- `backend/main.py` sets up the FastAPI app, CORS, trusted hosts, gzip, and router registration.
- `backend/core/config.py` loads environment variables and initializes the Supabase client.
- `backend/routers/ultrafree.py` exposes public site creation, public site lookup/listing, event ingestion, and 30-day analytics.
- `backend/routers/free.py` exposes login/register/logout, Google OAuth sign-in, current user lookup, and authenticated site management.
- `backend/services/ultrafree.py` creates public sites, looks them up, lists them, and logs raw events.
- `backend/services/free.py` creates and lists user-owned sites.
- `backend/processing/ultrafree.py` aggregates raw events into summary analytics.
- `backend/processing/free.py` exists and adds country breakdown logic, but it is not clearly wired into a live router.
- `backend/models/` contains SQL for the two tiers and schema definitions for API payloads.

Frontend architecture:
- `frontend/app/public/page.tsx` lists public dashboards and describes the no-login flow.
- `frontend/app/public/new/page.tsx` creates a new public dashboard.
- `frontend/app/analytics/[hex]/page.tsx` renders the public analytics dashboard and highlights the 30-day window.
- `frontend/app/dashboard/page.tsx` renders the signed-in dashboard and shows 90-day retention.
- `frontend/app/sites/new/page.tsx` handles authenticated site creation and redirects unauthenticated users to login.
- `frontend/app/billing/page.tsx` describes Free and Pro, with Pro still only being marketing copy.
- `frontend/app/(auth)/login/[[...rest]]/page.tsx` is the Google OAuth entry point.
- `frontend/lib/apis/publicSites.ts` wraps the public ultrafree APIs.
- `frontend/lib/apis/freeSites.ts` wraps authenticated free-site APIs.
- `frontend/lib/apis/ultrafreeanalytics.ts` fetches public analytics and logs events.
- `frontend/public/ultrafree.js` and `frontend/public/free.js` are the client tracker scripts.

Important implementation details:
- Public analytics are accessed without credentials.
- Signed-in free routes use `credentials: 'include'`.
- The public analytics page and billing page both describe Free as 30-day retention and Pro as richer analytics.
- The signed-in dashboard page shows retention as 90 days.
- The public analytics response includes daily data, device split, top pages, bounce rate, sessions, and average pages per session.
- The free site table enforces unique `(user_id, site_url)` so a user cannot create the same dashboard twice.
- The free user/session schema stores IP address, user agent, activity timestamps, and 15-day expiry.
- The ultrafree event table is partitioned by month, and the cron SQL creates monthly partitions and drops older ones.

File map for future agents:
- `backend/main.py`
- `backend/core/config.py`
- `backend/routers/ultrafree.py`
- `backend/routers/free.py`
- `backend/services/ultrafree.py`
- `backend/services/free.py`
- `backend/processing/ultrafree.py`
- `backend/processing/free.py`
- `backend/models/ultrafree.sql`
- `backend/models/free_sites.sql`
- `backend/models/free_users_and_sessions.sql`
- `backend/models/1month_cron.sql`
- `backend/models/schemas.py`
- `frontend/app/public/page.tsx`
- `frontend/app/public/new/page.tsx`
- `frontend/app/analytics/[hex]/page.tsx`
- `frontend/app/dashboard/page.tsx`
- `frontend/app/sites/new/page.tsx`
- `frontend/app/billing/page.tsx`
- `frontend/app/(auth)/login/[[...rest]]/page.tsx`
- `frontend/lib/apis/publicSites.ts`
- `frontend/lib/apis/freeSites.ts`
- `frontend/lib/apis/ultrafreeanalytics.ts`
- `frontend/public/ultrafree.js`
- `frontend/public/free.js`

Operational notes:
- Backend expects `SUPABASE_URL` and `SUPABASE_KEY` in `backend/.env`.
- Google login also depends on Google OAuth env vars.
- The backend `/api/ping` route has a special CORS exception for public tracker ingestion.
- If a file or page is named `ultrafree`, it belongs to the public/no-login tier.
- If a file or page is named `free`, it belongs to the signed-in/user-owned tier.

Guidance for agents:
- When stuck, search for `ultrafree`, `free-sites`, `auth-token`, `api/ping`, `30 days`, and `90 days`.
- Treat the codebase’s naming as authoritative for the implemented tiers.
- Pro should stay blank until there is real implementation.

Last updated: expanded tier context for agent re-readability.
