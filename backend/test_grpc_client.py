"""
Standalone gRPC client smoke test for the AnalyticsService.

Usage (with the backend running):
    python test_grpc_client.py
"""

import argparse
import sys

import grpc

from grpc_generated import analytics_pb2, analytics_pb2_grpc


def run(host: str, port: int) -> None:
    channel = grpc.insecure_channel(f"{host}:{port}")
    stub = analytics_pb2_grpc.AnalyticsServiceStub(channel)

    print("== HealthCheck ==")
    health = stub.HealthCheck(analytics_pb2.HealthCheckRequest(service="analytics"))
    print(" ", health.status, health.service)

    print("== ListSites ==")
    sites = stub.ListSites(analytics_pb2.ListSitesRequest(limit=5, offset=0))
    print(f"  total={sites.total} returned={sites.count}")
    for site in sites.sites:
        print(f"  - {site.hex_share_id} | {site.name} | {site.site_url}")

    if sites.sites:
        first_hex = sites.sites[0].hex_share_id
        print(f"== GetSite({first_hex}) ==")
        site = stub.GetSite(analytics_pb2.GetSiteRequest(hex_share_id=first_hex))
        print(" ", site.name, site.site_url)

        print(f"== GetAnalytics({first_hex}) ==")
        analytics = stub.GetAnalytics(
            analytics_pb2.GetAnalyticsRequest(hex_share_id=first_hex, hours=720)
        )
        print(
            f"  pageviews={analytics.total_pageviews} "
            f"visitors={analytics.unique_visitors} "
            f"sessions={analytics.sessions}"
        )

    print("== LogEvent (synthetic) ==")
    event = analytics_pb2.LogEventRequest(
        event=analytics_pb2.EventData(
            site_hex="unknown00000x",
            unique_cookie="grpc-test-cookie",
            session_id="grpc-test-session",
            page_path="/grpc-smoke",
            device_type="desktop",
            event_type="page_view",
        )
    )
    try:
        resp = stub.LogEvent(event)
        print(f"  success={resp.success} message={resp.message}")
    except grpc.RpcError as exc:
        print(f"  expected error: {exc.code()} {exc.details()}")

    channel.close()
    print("gRPC client smoke test passed.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test the Web Analytics gRPC service")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=50051)
    args = parser.parse_args()
    try:
        run(args.host, args.port)
    except grpc.RpcError as exc:
        print(f"gRPC call failed: {exc.code()} {exc.details()}", file=sys.stderr)
        sys.exit(1)
