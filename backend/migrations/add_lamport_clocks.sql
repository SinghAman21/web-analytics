-- Lamport logical clock columns for distributed event ordering.
-- Additive migration; safe to run on existing tables.
-- Ordering key: (site_hex, lamport_ts, process_id).

-- Ultrafree raw events
ALTER TABLE ultrafree_raw_events
    ADD COLUMN IF NOT EXISTS lamport_ts bigint NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS process_id text,
    ADD COLUMN IF NOT EXISTS received_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_ultrafree_raw_events_site_lamport
    ON ultrafree_raw_events (site_hex, lamport_ts);

-- Free-tier raw events
ALTER TABLE free_sites_raw_event
    ADD COLUMN IF NOT EXISTS lamport_ts bigint NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS process_id text,
    ADD COLUMN IF NOT EXISTS received_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_free_raw_event_site_lamport
    ON free_sites_raw_event (site_hex, lamport_ts);
