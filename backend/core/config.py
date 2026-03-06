import os
from supabase import create_client, Client
from supabase.lib.client_options import SyncClientOptions
from dotenv import load_dotenv

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "Missing Supabase credentials. Ensure SUPABASE_URL and SUPABASE_KEY are set in .env"
    )

# Validate keys are reasonable length
if len(SUPABASE_KEY) < 50:
    print(f"⚠️  WARNING: SUPABASE_KEY seems too short ({len(SUPABASE_KEY)} chars)")
    print("Please get the full Service Role Secret from Supabase Dashboard → Settings → API")

# Initialize Supabase client
try:
    timeout_seconds = int(os.getenv("SUPABASE_TIMEOUT_SECONDS", "8"))
    options = SyncClientOptions(
        postgrest_client_timeout=timeout_seconds,
        storage_client_timeout=timeout_seconds,
        function_client_timeout=timeout_seconds,
    )
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY, options=options)
    print("✓ Supabase client initialized successfully")
except Exception as e:
    print(f"❌ Error initializing Supabase client: {e}")
    raise

