import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("⚠️  Warning: Missing Supabase credentials. Some features may not work.")
    print("Please ensure SUPABASE_URL and SUPABASE_KEY are set in .env")
    # Create dummy client to prevent errors
    SUPABASE_URL = SUPABASE_URL or "https://dummy.supabase.co"
    SUPABASE_KEY = SUPABASE_KEY or "dummy-key"

# Initialize Supabase client
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✓ Supabase client initialized")
except Exception as e:
    print(f"⚠️  Error initializing Supabase client: {e}")
    supabase = None

