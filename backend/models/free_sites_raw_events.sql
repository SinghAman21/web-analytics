-- Free analytics raw event data model (partitioned by event_time)
-- Purpose:
--   1) Store one row per tracked site event
--   2) Preserve the client-side payload needed for dashboard analytics
--   3) Support aggregation by site, session, page, device, and date range
--   4) Optimize performance via monthly partitions by event_time

BEGIN;

-- 1. Create main partitioned table (RANGE partitioned by event_time)
CREATE TABLE IF NOT EXISTS free_sites_raw_event (
	id BIGSERIAL,
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
	ref TEXT,
	source_type TEXT,
	source_name TEXT,
	first_touch_source_type TEXT,
	first_touch_source_name TEXT,
	first_touch_source_url TEXT,
	first_touch_landing_url TEXT,
	first_touch_landing_path TEXT,
	first_touch_at TIMESTAMPTZ,
	first_touch_click_id TEXT,
	first_touch_utm_source TEXT,
	first_touch_utm_medium TEXT,
	first_touch_utm_campaign TEXT,
	first_touch_utm_content TEXT,
	first_touch_utm_term TEXT,
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
	ip_hash VARCHAR(16),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY (id, event_time),

	CONSTRAINT chk_free_sites_raw_event_hex_format CHECK (site_hex ~ '^[a-zA-Z0-9]{12}$'),
	CONSTRAINT chk_free_sites_raw_event_page_path_nonempty CHECK (length(trim(page_path)) > 0),
	CONSTRAINT chk_free_sites_raw_event_interaction_count_nonnegative CHECK (interaction_count >= 0),
	CONSTRAINT chk_free_sites_raw_event_scroll_depth_range CHECK (scroll_depth IS NULL OR (scroll_depth >= 0 AND scroll_depth <= 100))
) PARTITION BY RANGE (event_time);

-- 2. Create monthly partitions (existing and upcoming months)


CREATE TABLE IF NOT EXISTS free_sites_raw_event_2026_05060708 PARTITION OF free_sites_raw_event
	FOR VALUES FROM ('2026-05-01') TO ('2026-08-01');

CREATE TABLE IF NOT EXISTS free_sites_raw_event_2026_09101112 PARTITION OF free_sites_raw_event
	FOR VALUES FROM ('2026-09-01') TO ('2026-12-01');

-- 3. Create indexes on partitioned table
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

-- 4. Add foreign key constraint to free_sites table
ALTER TABLE free_sites_raw_event
ADD CONSTRAINT fk_free_sites_raw_event_site_hex
FOREIGN KEY (site_hex) REFERENCES free_sites(hex_share_id) ON DELETE CASCADE;

COMMIT;

-- Additional setup for automatic monthly partition creation (optional cron job)
-- This script can be run monthly to create the next partition
-- Example: Create partition for July 2026
-- CREATE TABLE free_sites_raw_event_2026_07 PARTITION OF free_sites_raw_event
--   FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- Query reference for backend usage
-- Recent events for a site:
-- SELECT *
-- FROM free_sites_raw_event
-- WHERE site_hex = :site_hex
-- ORDER BY event_time DESC
-- LIMIT 100;

-- Analytics window for a site (queries will auto-select relevant partitions):
-- SELECT *
-- FROM free_sites_raw_event
-- WHERE site_hex = :site_hex
--   AND event_time >= NOW() - INTERVAL '30 days'
-- ORDER BY event_time DESC;

-- Check partition info:
-- SELECT schemaname, tablename 
-- FROM pg_tables 
-- WHERE tablename LIKE 'free_sites_raw_event_%'
-- ORDER BY tablename;
