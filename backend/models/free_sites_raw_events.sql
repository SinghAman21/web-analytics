-- Free analytics raw event data model
-- Purpose:
--   1) Store one row per tracked site event
--   2) Preserve the client-side payload needed for dashboard analytics
--   3) Support aggregation by site, session, page, device, and date range

BEGIN;

CREATE TABLE IF NOT EXISTS free_sites_raw_event (
	id BIGSERIAL PRIMARY KEY,
	site_hex VARCHAR(12) NOT NULL,
	event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	event_type VARCHAR(32) NOT NULL DEFAULT 'page_view',
	unique_cookie VARCHAR(64) NOT NULL,
	session_id VARCHAR(64) NOT NULL,
	page_url TEXT NOT NULL,
	page_path TEXT NOT NULL,
	page_title TEXT,
	page_hostname TEXT,
	referrer TEXT,
	device_type VARCHAR(16) NOT NULL,
	viewport_res VARCHAR(32),
	screen_res VARCHAR(32),
	language VARCHAR(16),
	timezone VARCHAR(64),
	connection_type VARCHAR(32),
	connection_effective_type VARCHAR(32),
	browser VARCHAR(32),
	browser_version VARCHAR(32),
	os VARCHAR(32),
	os_version VARCHAR(32),
	utm_source TEXT,
	utm_medium TEXT,
	utm_campaign TEXT,
	utm_content TEXT,
	utm_term TEXT,
	page_load_time INTEGER,
	dom_interactive_time INTEGER,
	first_paint_time INTEGER,
	first_contentful_paint_time INTEGER,
	interaction_count INTEGER NOT NULL DEFAULT 0,
	scroll_depth INTEGER,
	is_bounce BOOLEAN NOT NULL DEFAULT FALSE,
	country TEXT,
	country_code VARCHAR(8),
	region TEXT,
	city TEXT,
	latitude NUMERIC(10, 7),
	longitude NUMERIC(10, 7),
	isp TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT chk_free_sites_raw_event_hex_format CHECK (site_hex ~ '^[a-zA-Z0-9]{12}$'),
	CONSTRAINT chk_free_sites_raw_event_page_path_nonempty CHECK (length(trim(page_path)) > 0),
	CONSTRAINT chk_free_sites_raw_event_interaction_count_nonnegative CHECK (interaction_count >= 0),
	CONSTRAINT chk_free_sites_raw_event_scroll_depth_range CHECK (scroll_depth IS NULL OR (scroll_depth >= 0 AND scroll_depth <= 100))
);

CREATE INDEX IF NOT EXISTS idx_free_sites_raw_event_site_event_time
	ON free_sites_raw_event (site_hex, event_time DESC);

CREATE INDEX IF NOT EXISTS idx_free_sites_raw_event_site_session
	ON free_sites_raw_event (site_hex, session_id);

CREATE INDEX IF NOT EXISTS idx_free_sites_raw_event_site_page_path
	ON free_sites_raw_event (site_hex, page_path);

CREATE INDEX IF NOT EXISTS idx_free_sites_raw_event_site_unique_cookie
	ON free_sites_raw_event (site_hex, unique_cookie);

CREATE INDEX IF NOT EXISTS idx_free_sites_raw_event_site_event_type
	ON free_sites_raw_event (site_hex, event_type, event_time DESC);

COMMIT;

-- --------------------------------------------------------------
-- Query reference for backend usage
-- --------------------------------------------------------------
-- Recent events for a site:
-- SELECT *
-- FROM free_sites_raw_event
-- WHERE site_hex = :site_hex
-- ORDER BY event_time DESC
-- LIMIT 100;

-- Analytics window for a site:
-- SELECT *
-- FROM free_sites_raw_event
-- WHERE site_hex = :site_hex
--   AND event_time >= NOW() - INTERVAL '30 days';
