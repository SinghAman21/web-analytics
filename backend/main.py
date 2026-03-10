import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.gzip import GZipMiddleware

from models.schemas import ErrorResponse, HealthResponse, RootResponse
from routers.ultrafree import router as ultrafree_router


def _parse_cors_origins() -> list[str]:
    """Return explicit CORS origins from env or sane defaults."""
    raw = os.getenv(
        "CORS_ALLOW_ORIGINS",
        "https://useraman.me,https://www.useraman.me,http://localhost:3000",
    )
    return [origin.strip() for origin in raw.split(",") if origin.strip()]

TAGS_METADATA = [
    {
        "name": "System",
        "description": "Operational endpoints for uptime and API discovery.",
    },
    {
        "name": "Ultrafree",
        "description": "Public site creation, event ingestion, and analytics endpoints.",
    },
    {
        "name": "public",
        "description": "Tracker script distribution endpoints for client-side integration.",
    },
]

# Initialize FastAPI app
app = FastAPI(
    title="Web Analytics API",
    description="API for website event tracking, public site setup, and analytics reporting.",
    version="1.0.0",
    openapi_tags=TAGS_METADATA,
)

# Middleware stack
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app"]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(ultrafree_router)

# Health check endpoint
@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Health check",
    description="Simple liveness endpoint used by monitors and load balancers.",
    responses={500: {"model": ErrorResponse, "description": "Unexpected server error"}},
)
async def health_check():
    return {
        "status": "ok",
        "service": "web-analytics-api",
    }

# Root endpoint
@app.get(
    "/",
    response_model=RootResponse,
    tags=["System"],
    summary="API root",
    description="Returns basic service metadata and the Swagger docs path.",
)
async def root():
    return {
        "message": "Web Analytics API",
        "version": "1.0.0",
        "docs": "/docs",
    }

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
#     "referrer": "google.com",
#     "screen_res": "1920x1080"
#   }'
# uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# uvicorn main:app 
# uvicorn app.main:app --reload 
# --host