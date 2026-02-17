from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import uvicorn

from routers import analytics, dashboard, public
# from core.database import supabase

# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - test Supabase connection
    try:
        # Test connection by querying sites table
        response = supabase.table("sites").select("id").limit(1).execute()
        print("✓ Connected to Supabase")
    except Exception as e:
        print(f"⚠️  Supabase connection warning: {e}")
    yield
    # Shutdown
    pass

# Initialize FastAPI app
app = FastAPI(
    title="Web Analytics API",
    description="Analytics API for website tracking and monitoring",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware stack
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app"]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",
        "https://*.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(public.router, prefix="/api/public", tags=["public"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "web-analytics-api"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Web Analytics API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
