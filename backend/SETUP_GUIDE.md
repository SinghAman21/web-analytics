# Setup Guide: Session-Based Authentication with Supabase

This guide walks through integrating your FastAPI backend with **Supabase** (database) using **session-based authentication**.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Backend Environment Configuration](#backend-environment-configuration)
4. [Database Migration](#database-migration)
5. [Authentication Endpoints](#authentication-endpoints)
6. [Testing the Integration](#testing-the-integration)
7. [Session Management](#session-management)

---

## Prerequisites

Before starting, ensure you have:

- **Python 3.9+** installed
- **pip** or **uv** for package management
- A **Supabase account** (https://supabase.com) — sign up free
- **curl** or **Postman** for testing APIs
- Your FastAPI backend running (see main.py)

---

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in:
   - **Project name**: `web-analytics`
   - **Password**: Generate a strong password (save it!)
   - **Region**: Pick the one closest to your users
4. Click **Create new project** — wait 2-3 minutes for setup

### Step 2: Get API Keys

1. Once project is created, go to **Settings → API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **Service Role Secret** → `SUPABASE_KEY` (use the full "secret" key, not "anon")
3. **⚠️ Important**: Service Role Secret is sensitive — keep it in `.env` only, never commit

### Step 3: Create Database Tables

1. Go to **SQL Editor** in Supabase dashboard
2. Run the SQL from the [SQL Schema](#sql-schema) section below
3. Verify tables exist in **Table Editor**

### SQL Schema

Copy and paste this entire block into Supabase SQL Editor:

```sql
-- 1. Create users table for session-based authentication
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  username VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_signin_at TIMESTAMPTZ
);

-- 2. Create indexes on users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 3. Create sessions table to track user sessions (15-day expiry)
CREATE TABLE IF NOT EXISTS user_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 4. Create indexes for session lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
```

---

## Backend Environment Configuration

### Step 1: Create `.env` File

In the `backend/` directory, create a `.env` file:

```bash
cd backend/
touch .env
```

### Step 2: Add Environment Variables

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Service Role Secret
SUPABASE_TIMEOUT_SECONDS=8

# Session Configuration
# Sessions expire in 15 days by default
# ENV=production
ENV=local
PORT=8000
```

Replace `your-project` and the key with your actual values from Supabase dashboard.

### Step 3: Verify Dependencies

Check that `requirements.txt` includes:

```plaintext
fastapi==0.129.0
supabase==2.28.0
pydantic==2.12.5
python-dotenv==1.2.1
```

---

## Database Migration

### Step 1: Run the SQL Schema

Execute the SQL schema from **Supabase → SQL Editor** to create the required tables.

### Step 2: Verify Tables

Check **Supabase → Table Editor** to ensure:
- `users` table exists with email, password_hash, name fields
- `user_sessions` table exists with session_token and expires_at

---

## Authentication Endpoints

The backend provides the following authentication endpoints:

### 1. Register (POST /api/auth/register)

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "authenticated": true,
  "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2026-05-06T10:30:00"
  }
}
```

### 2. Login (POST /api/auth/login)

Authenticate with email and password. Session expires in 15 days.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "authenticated": true,
  "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2026-05-06T10:30:00"
  }
}
```

### 3. Get Current User (GET /api/auth/me)

Get the profile of the currently authenticated user.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "authenticated": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2026-05-06T10:30:00"
  }
}
```

### 4. Logout (POST /api/auth/logout)

Invalidate a session token.

**Request:**
```json
{
  "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Session Management

### Session Expiry

Sessions automatically expire after **15 days** of inactivity. When you:

- **Login**: A new 15-day session is created
- **Use an authenticated endpoint**: The session expiry resets to 15 days from now
- **Don't use the session for 15 days**: The session expires and must login again

### Password Security

Passwords are hashed using **PBKDF2** with 100,000 iterations and a 32-byte salt for security.

---

## Testing the Integration

### Test 1: Register a New User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "testpass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Test 2: Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "testpass123"
  }'
```

Save the `session_token` from the response.

### Test 3: Get Current User

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <session_token>"
```

### Test 4: Logout

```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "session_token": "<session_token>"
  }'
```

---

## Troubleshooting

### Issue: "User with this email already exists"

The email is already registered. Try with a different email or use the login endpoint.

### Issue: "Invalid email or password"

Check that the email and password are correct. Note that passwords are case-sensitive.

### Issue: "Invalid or expired session token"

The session has expired (15 days) or the token is invalid. User must login again to get a new token.

### Issue: Database connection error

Verify that:
1. `SUPABASE_URL` and `SUPABASE_KEY` are correct in `.env`
2. Supabase tables are created from the SQL schema
3. The backend can reach Supabase (check network/firewall)

```python
from core.config import supabase
from models.schemas import SignedInUser
from datetime import datetime

def upsert_user(user: SignedInUser) -> dict:
    """
    Create or update a user from Clerk token claims.
    Called on every /api/auth/me request.
    """
    try:
        response = supabase.table("users").upsert(
            {
                "clerk_user_id": user.clerk_user_id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username,
                "image_url": user.image_url,
                "role": user.role,
                "updated_at": datetime.utcnow().isoformat(),
                "last_signin_at": datetime.utcnow().isoformat(),
            },
            on_conflict="clerk_user_id",
        ).execute()
        
        return response.data[0] if response.data else {}
    except Exception as e:
        print(f"Error upserting user: {str(e)}")
        raise
```

### Step 2: Update Auth Endpoint

Modify `backend/routers/free.py` to upsert on sign-in:

```python
from fastapi import APIRouter, Depends
from core.auth import get_current_clerk_user
from models.schemas import SignedInUser, SignedInUserResponse
from services.users import upsert_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.get("/me", response_model=SignedInUserResponse)
async def get_signed_in_user(current_user: SignedInUser = Depends(get_current_clerk_user)):
    # Upsert user to Supabase on every sign-in
    upsert_user(current_user)
    
    return {
        "authenticated": True,
        "data": current_user,
    }
```

---

## Testing the Integration

### Test 1: Verify Supabase Connection

```bash
cd backend/
python -c "from core.config import supabase; print('✓ Supabase connected')"
```

**Expected output:**
```
✓ Supabase client initialized successfully
✓ Supabase connected
```

### Test 2: Test JWT Token Decoding

1. Get a test token from your frontend (logged-in user)
2. Use curl to test the auth endpoint:

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <YOUR_CLERK_SESSION_TOKEN>"
```

**Expected response:**
```json
{
  "authenticated": true,
  "data": {
    "clerk_user_id": "user_abc123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "image_url": "https://...",
    "role": null,
    "claims": {
      "iss": "https://cute-frog-42.clerk.accounts.com",
      "aud": null,
      "azp": null,
      "org_id": null,
      "org_slug": null
    }
  }
}
```

### Test 3: Check Supabase User Table

1. Go to Supabase dashboard → **Table Editor**
2. Click **users** table
3. Verify a new row was inserted after calling `/api/auth/me`

---

## Frontend Integration

### Step 1: Ensure Clerk Provider is Set Up

In `frontend/app/layout.tsx`:

```tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
```

### Step 2: Get Clerk Session Token

In any frontend component, use Clerk's `useAuth()`:

```tsx
'use client';

import { useAuth } from '@clerk/nextjs';

export function MyComponent() {
  const { getToken, userId } = useAuth();
  
  const fetchUserData = async () => {
    const token = await getToken();
    
    const response = await fetch('http://localhost:8000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const user = await response.json();
    console.log('Signed-in user:', user.data);
  };
  
  return <button onClick={fetchUserData}>Get User</button>;
}
```

### Step 3: Call Backend Auth Endpoint

The frontend can now:

1. Get Clerk session token via `getToken()`
2. Call `GET /api/auth/me` with the token
3. Receive normalized `SignedInUser` data
4. Backend automatically upserts user to Supabase

---

## Troubleshooting

### Issue: "Missing Clerk configuration"

**Solution:**
- Verify `.env` has `CLERK_JWKS_URL` or `CLERK_ISSUER`
- Check Clerk dashboard → **Settings → API** for correct URLs
- Restart backend: `uvicorn main:app --reload`

### Issue: "Invalid or expired Clerk token"

**Causes & fixes:**
1. **Token expired**: Clerk tokens last ~1 hour; frontend must refresh via `getToken()`
2. **Wrong endpoint**: Ensure JWKS URL matches your Clerk application
3. **Issuer mismatch**: Verify `CLERK_ISSUER` matches token's `iss` claim

**Debug:**
```bash
# Decode token (no verification) to check claims
python -c "import jwt; print(jwt.decode('<TOKEN>', options={'verify_signature': False}))"
```

### Issue: "Supabase connection failed"

**Solution:**
- Verify `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- Test connection: `python -c "from core.config import supabase; print(supabase.table('users').select('*').execute())"`
- Check firewall/VPN not blocking Supabase

### Issue: User not appearing in Supabase

**Solution:**
1. Confirm `/api/auth/me` endpoint was called and returned 200
2. Check Supabase **Table Editor → users** table
3. If empty, verify `upsert_user()` was called in the endpoint
4. Check backend logs for errors

---

## Environment Variables Reference

| Variable | Type | Required | Example | Notes |
|----------|------|----------|---------|-------|
| `SUPABASE_URL` | String | Yes | `https://abc.supabase.co` | From Supabase Settings → API |
| `SUPABASE_KEY` | String | Yes | `eyJhbGc...` | Use **Service Role Secret**, not Anon |
| `CLERK_SECRET_KEY` | String | Yes | `sk_test_abc123` | From Clerk Settings → API Keys |
| `CLERK_JWKS_URL` | String | Yes* | `https://cute-frog-42.clerk.accounts.com/.well-known/jwks.json` | Or use `CLERK_ISSUER` |
| `CLERK_ISSUER` | String | Yes* | `https://cute-frog-42.clerk.accounts.com` | Alternative to `CLERK_JWKS_URL` |
| `CLERK_AUDIENCE` | String | No | `myapp` | Only if enforcing audience claim |

\* = Either `CLERK_JWKS_URL` or `CLERK_ISSUER` required, not both

---

## Next Steps

1. **Create user profile endpoints**: `GET /api/auth/profile`, `PUT /api/auth/profile`
2. **Link sites to users**: Update ultrafree creation to include `user_id`
3. **Add authorization**: Protect routes based on `clerk_user_id`
4. **Implement billing**: Track subscription tied to user in Supabase
5. **Add webhooks**: Use Clerk webhooks to sync user deletions

---

## Quick Checklist

- [ ] Supabase project created
- [ ] Supabase API keys in `.env`
- [ ] Database schema created in Supabase
- [ ] Clerk application created
- [ ] Clerk API keys in `.env`
- [ ] JWKS/Issuer URL verified in `.env`
- [ ] Backend dependencies installed (`pip install pyjwt`)
- [ ] Backend running (`uvicorn main:app --reload`)
- [ ] Test endpoint: `curl http://localhost:8000/api/auth/me -H "Authorization: Bearer ..."`
- [ ] User appears in Supabase after test
- [ ] Frontend has `ClerkProvider` set up
- [ ] Frontend can call `getToken()` and hit `/api/auth/me`

---

## Support

For issues:

- **Supabase**: https://supabase.com/docs
- **Clerk**: https://clerk.com/docs
- **FastAPI**: https://fastapi.tiangolo.com
- **JWT**: https://jwt.io (to decode tokens)
