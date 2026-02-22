-- 1. Create sites table (unchanged)
CREATE TABLE ultrafree (
  id SERIAL PRIMARY KEY,
  hex_share_id VARCHAR(12) UNIQUE NOT NULL PRIMARY KEY,
  name VARCHAR(12) NOT NULL,
  site_url VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create partitioned raw_events (unchanged)
CREATE TABLE ultrafree_raw_events (
  id BIGSERIAL,
  site_hex VARCHAR(12) NOT NULL,
  event_time TIMESTAMPTZ DEFAULT NOW(),
  unique_cookie VARCHAR(64) NOT NULL,
  session_id VARCHAR(64) NOT NULL,
  page_path VARCHAR(255) NOT NULL,
  device_type VARCHAR(10) NOT NULL,
  is_bounce BOOLEAN DEFAULT FALSE,
  referrer VARCHAR(512),
  ip_hash VARCHAR(64),
  screen_res VARCHAR(20),
  PRIMARY KEY (id, event_time)
) PARTITION BY RANGE (event_time);

-- 3. Create partition
CREATE TABLE ultrafree_raw_events_2026_02 PARTITION OF ultrafree_raw_events
FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- 4. ADD FOREIGN KEY CONSTRAINT (this is what you need)
ALTER TABLE ultrafree_raw_events 
ADD CONSTRAINT fk_ultrafree_raw_events_site_hex 
FOREIGN KEY (site_hex) REFERENCES ultrafree(hex_share_id);
