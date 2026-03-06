#!/usr/bin/env python3
"""
Test script to verify Supabase connection and API functionality.
"""

import sys
import os
from dotenv import load_dotenv

load_dotenv()

print("=" * 60)
print("SUPABASE CONNECTION TEST")
print("=" * 60)

# Check environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print(f"\n1. Environment Variables:")
print(f"   SUPABASE_URL: {SUPABASE_URL}")
print(f"   SUPABASE_KEY length: {len(SUPABASE_KEY) if SUPABASE_KEY else 0} chars")
print(f"   SUPABASE_KEY: {SUPABASE_KEY[:20]}..." if SUPABASE_KEY else "   SUPABASE_KEY: NOT SET")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("\n❌ ERROR: Missing Supabase credentials in .env")
    sys.exit(1)

if len(SUPABASE_KEY) < 50:
    print(f"\n⚠️  WARNING: SUPABASE_KEY seems too short ({len(SUPABASE_KEY)} chars)")
    print("   It should be at least 100+ characters")
    print("   Get the Service Role Secret from Supabase Dashboard → Settings → API")

# Try to initialize Supabase client
print(f"\n2. Initializing Supabase Client:")
try:
    from supabase import create_client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("   ✓ Client initialized successfully")
except Exception as e:
    print(f"   ❌ Error: {e}")
    sys.exit(1)

# Try to test connection with a simple query
print(f"\n3. Testing Database Connection:")
try:
    response = supabase.table("ultrafree").select("id").limit(1).execute()
    print(f"   ✓ Successfully queried 'ultrafree' table")
    print(f"   Response count: {len(response.data) if response.data else 0}")
except Exception as e:
    print(f"   ❌ Error querying 'ultrafree' table: {e}")
    print(f"   Make sure the table exists in your Supabase database")

try:
    response = supabase.table("ultrafree_raw_events").select("id").limit(1).execute()
    print(f"   ✓ Successfully queried 'ultrafree_raw_events' table")
    print(f"   Response count: {len(response.data) if response.data else 0}")
except Exception as e:
    print(f"   ❌ Error querying 'ultrafree_raw_events' table: {e}")
    print(f"   Make sure the table exists in your Supabase database")

# Try to insert test data
print(f"\n4. Testing INSERT (Create):")
try:
    test_hex = "test123456ab"
    response = supabase.table("ultrafree").insert({
        "hex_share_id": test_hex,
        "name": "Test Site",
        "site_url": "https://example.com"
    }).execute()
    
    if response.data:
        print(f"   ✓ Successfully inserted test site: {response.data[0]}")
        test_id = response.data[0]['id']
        
        # Try to fetch it back
        print(f"\n5. Testing SELECT (Read):")
        response = supabase.table("ultrafree").select("*").eq("hex_share_id", test_hex).execute()
        if response.data:
            print(f"   ✓ Successfully retrieved site: {response.data[0]}")
        else:
            print(f"   ❌ Could not retrieve inserted site")
        
        # Clean up
        print(f"\n6. Cleaning up test data:")
        response = supabase.table("ultrafree").delete().eq("hex_share_id", test_hex).execute()
        print(f"   ✓ Deleted test site")
    else:
        print(f"   ❌ Insert returned no data")
        
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
