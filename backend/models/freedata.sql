-- Signed-in dashboard data model
-- Purpose:
--   1) Store site records owned by specific users
--   2) Support filtering by logged-in user (only show their sites)
--   3) Support inserts from /sites/new for authenticated flows

BEGIN;

-- 1) User-owned sites table
CREATE TABLE IF NOT EXISTS free_sites (
	id BIGSERIAL PRIMARY KEY,
	user_id BIGINT NOT NULL REFERENCES free_users(id) ON DELETE CASCADE,
	site_name VARCHAR(120) NOT NULL,
	site_url VARCHAR(255) NOT NULL,
	hex_share_id VARCHAR(12) UNIQUE NOT NULL,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	-- Basic guards for data quality
	CONSTRAINT chk_free_sites_name_nonempty CHECK (length(trim(site_name)) > 0),
	CONSTRAINT chk_free_sites_url_nonempty CHECK (length(trim(site_url)) > 0),
	CONSTRAINT chk_free_sites_hex_format CHECK (hex_share_id ~ '^[a-zA-Z0-9]{12}$')
);

-- 2) Prevent duplicate site entries for the same user
--    (same owner cannot add the same URL twice)
CREATE UNIQUE INDEX IF NOT EXISTS idx_free_sites_user_url_unique
	ON free_sites (user_id, site_url);

-- 3) Fast lookups for "my dashboards" and drill-down by share id
CREATE INDEX IF NOT EXISTS idx_free_sites_user_id_created_at
	ON free_sites (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_free_sites_hex_share_id
	ON free_sites (hex_share_id);

-- 4) Keep updated_at fresh on updates
CREATE OR REPLACE FUNCTION set_free_sites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_free_sites_updated_at ON free_sites;
CREATE TRIGGER trg_free_sites_updated_at
BEFORE UPDATE ON free_sites
FOR EACH ROW
EXECUTE FUNCTION set_free_sites_updated_at();

COMMIT;

-- --------------------------------------------------------------
-- Query/insert reference for backend usage
-- --------------------------------------------------------------
-- List sites for current logged-in user:
-- SELECT id, user_id, site_name, site_url, hex_share_id, created_at
-- FROM free_sites
-- WHERE user_id = :current_user_id
--   AND is_active = TRUE
-- ORDER BY created_at DESC;

-- Insert from /sites/new (authenticated):
-- INSERT INTO free_sites (user_id, site_name, site_url, hex_share_id)
-- VALUES (:current_user_id, :site_name, :site_url, :hex_share_id)
-- RETURNING *;
