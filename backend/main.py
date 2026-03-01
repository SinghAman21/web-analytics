from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.gzip import GZipMiddleware
import uvicorn
import os

# from routers import analytics, dashboard, public, tracker
from routers.ultrafree import router as ultrafree_router

# Initialize FastAPI app
app = FastAPI(
    title="Web Analytics API",
    description="Analytics API for website tracking and monitoring",
    version="1.0.0"
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
        "https://pulsev0.vercel.app",
        # "https://*.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# app.include_router(tracker.router, prefix="/public", tags=["tracker"])
# app.include_router(public.router, prefix="/api/public", tags=["public"])
# app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
# app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

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


# Include the ultrafree router
app.include_router(ultrafree_router)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))  # Fallback to 8000 locally
    reload=os.getenv("ENV") != "production"  # Or similar logic
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=reload,
        log_level="info"
    )

# curl -X POST http://localhost:8000/api/ultrafreeevents   -H "Content-Type: application/json"   -d '{
#     "site_hex": "rfr3mknj2grl",
#     "unique_cookie": "user-uuid",
#     "session_id": "session-uuid",
#     "page_path": "/home",
#     "device_type": "desktop",
#     "is_bounce": false,
#     "referrer": "google.com",
#     "screen_res": "1920x1080"
#   }'
# uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# uvicorn main:app 
# uvicorn app.main:app --reload 
# --host