"""
gRPC server for the Web Analytics API.

Runs an async gRPC server (grpc.aio) alongside FastAPI. The service
implementations reuse the existing business logic in services/ and
processing/ so gRPC and REST stay behaviorally identical.
"""

import logging
from typing import Optional

import grpc
from google.protobuf.json_format import MessageToDict

from grpc_generated import analytics_pb2, analytics_pb2_grpc
from processing.ultrafree import process_analytics
from services.free import log_free_event
from services.ultrafree import (
    create_ultrafree,
    get_site_tier,
    get_ultrafree,
    list_ultrafree,
    log_ultrafreeevent,
)

logger = logging.getLogger(__name__)


def _event_to_dict(event: analytics_pb2.EventData) -> dict:
    """Convert a protobuf EventData into a snake_case dict for the service layer."""
    return MessageToDict(event, preserving_proto_field_name=True)


def _site_to_proto(site: dict) -> analytics_pb2.Site:
    return analytics_pb2.Site(
        id=int(site.get("id") or 0),
        hex_share_id=site.get("hex_share_id", ""),
        name=site.get("name", ""),
        site_url=site.get("site_url", ""),
        created_at=site.get("created_at") or "",
    )


def _analytics_to_proto(data: dict) -> analytics_pb2.Analytics:
    return analytics_pb2.Analytics(
        site_hex=data.get("site_hex", ""),
        period_hours=int(data.get("period_hours", 0)),
        total_pageviews=int(data.get("total_pageviews", 0)),
        unique_visitors=int(data.get("unique_visitors", 0)),
        bounce_rate=int(data.get("bounce_rate", 0)),
        sessions=int(data.get("sessions", 0)),
        avg_pages_per_session=float(data.get("avg_pages_per_session", 0)),
        top_pages=[
            analytics_pb2.TopPage(path=p.get("path", ""), views=int(p.get("views", 0)))
            for p in data.get("top_pages", [])
        ],
        device_breakdown={k: int(v) for k, v in data.get("device_breakdown", {}).items()},
        mobile_percentage=int(data.get("mobile_percentage", 0)),
        desktop_percentage=int(data.get("desktop_percentage", 0)),
        daily_data=[
            analytics_pb2.DailyDataPoint(date=d.get("date", ""), views=int(d.get("views", 0)))
            for d in data.get("daily_data", [])
        ],
        generated_at=data.get("generated_at", ""),
    )


class AnalyticsServiceServicer(analytics_pb2_grpc.AnalyticsServiceServicer):
    """gRPC implementation of the AnalyticsService contract."""

    async def LogEvent(
        self,
        request: analytics_pb2.LogEventRequest,
        context: grpc.aio.ServicerContext,
    ) -> analytics_pb2.LogEventResponse:
        event = _event_to_dict(request.event)
        client_ip = request.client_ip or context.peer()

        if not event.get("site_hex"):
            await context.abort(grpc.StatusCode.INVALID_ARGUMENT, "Missing required field: site_hex")

        try:
            tier = get_site_tier(event.get("site_hex"))
        except Exception as exc:  # pragma: no cover - defensive
            logger.error("Error resolving site tier: %s", exc, exc_info=True)
            await context.abort(grpc.StatusCode.INTERNAL, "Error resolving site tier")
            return analytics_pb2.LogEventResponse()

        if tier == "free":
            result = log_free_event(event, client_ip)
        elif tier == "ultrafree":
            result = log_ultrafreeevent(event, client_ip)
        else:
            await context.abort(grpc.StatusCode.NOT_FOUND, "Site not found in either free or ultrafree")
            return analytics_pb2.LogEventResponse()

        return analytics_pb2.LogEventResponse(
            success=True,
            message="Event logged successfully",
            site_hex=event.get("site_hex", ""),
            event_id=int(result.get("id") or 0) if result else 0,
        )

    async def GetSite(
        self,
        request: analytics_pb2.GetSiteRequest,
        context: grpc.aio.ServicerContext,
    ) -> analytics_pb2.Site:
        try:
            site = get_ultrafree(request.hex_share_id)
        except Exception as exc:
            logger.error("Error fetching site: %s", exc, exc_info=True)
            await context.abort(grpc.StatusCode.INTERNAL, "Error fetching site")
            return analytics_pb2.Site()

        if not site:
            await context.abort(grpc.StatusCode.NOT_FOUND, "Site not found")
            return analytics_pb2.Site()

        return _site_to_proto(site)

    async def CreateSite(
        self,
        request: analytics_pb2.CreateSiteRequest,
        context: grpc.aio.ServicerContext,
    ) -> analytics_pb2.Site:
        try:
            site = create_ultrafree(
                site_name=request.site_name,
                site_url=request.site_url,
                hex_share_id=request.hex_share_id,
            )
        except ValueError as exc:
            await context.abort(grpc.StatusCode.INVALID_ARGUMENT, str(exc))
            return analytics_pb2.Site()
        except Exception as exc:
            logger.error("Error creating site: %s", exc, exc_info=True)
            await context.abort(grpc.StatusCode.INTERNAL, "Error creating site")
            return analytics_pb2.Site()

        return _site_to_proto(site)

    async def ListSites(
        self,
        request: analytics_pb2.ListSitesRequest,
        context: grpc.aio.ServicerContext,
    ) -> analytics_pb2.ListSitesResponse:
        limit = max(1, min(request.limit or 20, 100))
        offset = max(0, request.offset or 0)
        try:
            result = list_ultrafree(limit=limit, offset=offset)
        except Exception as exc:
            logger.error("Error listing sites: %s", exc, exc_info=True)
            await context.abort(grpc.StatusCode.INTERNAL, "Error listing sites")
            return analytics_pb2.ListSitesResponse()

        return analytics_pb2.ListSitesResponse(
            sites=[_site_to_proto(s) for s in result.get("data", [])],
            count=len(result.get("data", [])),
            total=int(result.get("total", 0)),
        )

    async def GetAnalytics(
        self,
        request: analytics_pb2.GetAnalyticsRequest,
        context: grpc.aio.ServicerContext,
    ) -> analytics_pb2.Analytics:
        hours = request.hours or 720
        try:
            data = process_analytics(site_hex=request.hex_share_id, hours=hours)
        except Exception as exc:
            logger.error("Error processing analytics: %s", exc, exc_info=True)
            await context.abort(grpc.StatusCode.INTERNAL, "Error processing analytics")
            return analytics_pb2.Analytics()

        return _analytics_to_proto(data)

    async def HealthCheck(
        self,
        request: analytics_pb2.HealthCheckRequest,
        context: grpc.aio.ServicerContext,
    ) -> analytics_pb2.HealthCheckResponse:
        return analytics_pb2.HealthCheckResponse(status="ok", service="web-analytics-grpc")


async def build_grpc_server(max_workers: int = 10) -> grpc.aio.Server:
    """Create a configured async gRPC server with the AnalyticsService registered."""
    server = grpc.aio.server()
    analytics_pb2_grpc.add_AnalyticsServiceServicer_to_server(AnalyticsServiceServicer(), server)
    return server


async def start_grpc_server(
    server: Optional[grpc.aio.Server] = None,
    port: int = 50051,
) -> grpc.aio.Server:
    """Start the gRPC server. Returns the running server for later shutdown."""
    if server is None:
        server = await build_grpc_server()
    server.add_insecure_port(f"0.0.0.0:{port}")
    await server.start()
    logger.info("gRPC server started on 0.0.0.0:%s", port)
    return server
