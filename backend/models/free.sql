-- 1. Create free_users table for session-based authentication
CREATE TABLE IF NOT EXISTS free_users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  auth_provider VARCHAR(32) NOT NULL DEFAULT 'local',
  google_sub VARCHAR(255) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  username VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_signin_at TIMESTAMPTZ
);

-- 2. Create indexes on free_users table
CREATE INDEX IF NOT EXISTS idx_free_users_email ON free_users(email);
CREATE INDEX IF NOT EXISTS idx_free_users_username ON free_users(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_free_users_google_sub_unique ON free_users(google_sub) WHERE google_sub IS NOT NULL;

-- Keep existing databases compatible with the new Google auth fields
ALTER TABLE IF EXISTS free_users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(32) NOT NULL DEFAULT 'local';
ALTER TABLE IF EXISTS free_users ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255);
ALTER TABLE IF EXISTS free_users ALTER COLUMN password_hash DROP NOT NULL;

-- 3. Create sessions table to track free user sessions (15-day expiry)
CREATE TABLE IF NOT EXISTS free_user_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES free_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 4. Create indexes for session lookups
CREATE INDEX IF NOT EXISTS idx_free_user_sessions_user_id ON free_user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_free_user_sessions_token ON free_user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_free_user_sessions_expires_at ON free_user_sessions(expires_at);