-- 1. Create users table (linked to Clerk)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  username VARCHAR(100),
  image_url TEXT,
  role VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_signin_at TIMESTAMPTZ,
  -- Add indexes for common queries
  UNIQUE(clerk_user_id)
);

-- 2. Create index on clerk_user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. Create sessions table to track Clerk sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_session_id VARCHAR(255) UNIQUE,
  jwt_claims JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- 4. Create index for session lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_clerk_session_id ON user_sessions(clerk_session_id);

-- 6. Enable RLS (Row-Level Security) for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies Allow users to read their own data
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  USING (clerk_user_id = (current_setting('request.headers')::jsonb->>'x-clerk-user-id'));

-- 8. Create RLS policy to allow service role to manage all users
CREATE POLICY "Service role can manage all users"
  ON users
  USING (current_role = 'authenticated' OR current_role = 'service_role');