import os

import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.gzip import GZipMiddleware

from models.schemas import ErrorResponse, HealthResponse, RootResponse
from routers.free import router as auth_router
from routers.ultrafree import router as ultrafree_router
from routers.free_analytics import router as free_analytics_router

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
        "name": "Free Analytics",
        "description": "Authentication-required analytics endpoints for authenticated free-tier sites.",
    },
    {
        "name": "Auth",
        "description": "User authentication endpoints for login, registration, and session management. Sessions expire in 15 days.",
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
    allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app", "*.ngrok-free.app", "*.ngrok-free.dev"],
)
frontend_origin = os.getenv("FRONTEND_URL", "https://pulsev0.vercel.app")
allowed_origins = list({
	frontend_origin,
	"http://localhost:3000",
	"http://127.0.0.1:3000",
})
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def public_ingest_cors_middleware(request: Request, call_next):
    """
    Allow public tracker ingestion from any origin without credentials.
    Keep stricter allowlist CORS for all other endpoints.
    """
    if request.url.path == "/api/ping":
        cors_headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
            "Access-Control-Max-Age": "86400",
        }

        if request.method == "OPTIONS":
            return Response(status_code=204, headers=cors_headers)

        response = await call_next(request)
        for header, value in cors_headers.items():
            response.headers[header] = value
        return response

    return await call_next(request)

app.include_router(ultrafree_router)
app.include_router(auth_router)
app.include_router(free_analytics_router)

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
#     "screen_res": "1920x1080"
#   }'
# uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# uvicorn main:app 
# uvicorn app.main:app --reload 
# --host