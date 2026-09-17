import json
import os
import sys
import logging

import grpc

try:
    import redis
except ImportError:
    redis = None

from grpc_generated import analytics_pb2, analytics_pb2_grpc
from google.protobuf.json_format import MessageToDict

logger = logging.getLogger(__name__)

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "10"))
BACKEND_SERVICE_ADDR = os.getenv("BACKEND_GRPC_ADDR", os.getenv("GRPC_ADDR", "localhost:50051"))

STALE_KEY_PREFIX = "stale:item:"
FRESH_KEY_PREFIX = "fresh:item:"
STALE_ANALYTICS_PREFIX = "stale:analytics:"
FRESH_ANALYTICS_PREFIX = "fresh:analytics:"


def get_redis():
    if redis is None:
        raise ImportError("redis package not installed")
    return redis.Redis(host=REDIS_HOST, port=REDIS_PORT, socket_connect_timeout=1, socket_timeout=1, decode_responses=False)


def fetch_from_backend(item_id):
    hex_id = str(item_id).strip()
    with grpc.insecure_channel(BACKEND_SERVICE_ADDR) as channel:
        stub = analytics_pb2_grpc.AnalyticsServiceStub(channel)
        response = stub.GetSite(analytics_pb2.GetSiteRequest(hex_share_id=hex_id), timeout=2)
        return {"item_id": response.hex_share_id or hex_id, "hex_share_id": response.hex_share_id, "name": response.name, "site_url": response.site_url, "id": int(response.id), "created_at": response.created_at, "data": response.name}


def fetch_analytics_from_backend(hex_share_id, hours=720):
    with grpc.insecure_channel(BACKEND_SERVICE_ADDR) as channel:
        stub = analytics_pb2_grpc.AnalyticsServiceStub(channel)
        response = stub.GetAnalytics(analytics_pb2.GetAnalyticsRequest(hex_share_id=str(hex_share_id), hours=int(hours)), timeout=2)
        return MessageToDict(response, preserving_proto_field_name=True)


def _get_with_cache(fresh_key, stale_key, fetch_fn):
    r = None
    try:
        r = get_redis()
        cached = r.get(fresh_key)
        if cached:
            print(f"[Gateway] CACHE HIT for {fresh_key}")
            return json.loads(cached), "cache-hit"
        print(f"[Gateway] CACHE MISS for {fresh_key} -- querying backend")
    except Exception as e:
        is_redis_err = False
        if redis is not None:
            try:
                is_redis_err = isinstance(e, redis.exceptions.RedisError)
            except Exception:
                pass
        if is_redis_err or "redis" in str(type(e)).lower() or e.__class__.__name__ in ("ConnectionError", "TimeoutError"):
            print(f"[Gateway] REDIS UNAVAILABLE ({e}) -- falling back to backend directly")
        else:
            print(f"[Gateway] REDIS UNAVAILABLE ({e}) -- falling back to backend directly")
        r = None

    try:
        data = fetch_fn()
        key_label = fresh_key.split(":")[-1] if ":" in fresh_key else fresh_key
        print(f"[Gateway] Fetched {key_label} from BACKEND")
        if r is not None:
            try:
                r.set(fresh_key, json.dumps(data), ex=CACHE_TTL_SECONDS)
                r.set(stale_key, json.dumps(data))
            except Exception:
                print("[Gateway] Redis write failed, continuing without caching this result")
        return data, "backend"
    except grpc.RpcError as e:
        code = e.code() if hasattr(e, "code") else "UNKNOWN"
        print(f"[Gateway] BACKEND UNAVAILABLE ({code}) -- checking for stale cache")
        if r is not None:
            try:
                stale = r.get(stale_key)
                if stale:
                    print(f"[Gateway] Serving STALE cached copy for {fresh_key}")
                    return json.loads(stale), "stale-fallback"
            except Exception:
                pass
        raise RuntimeError(f"Item {fresh_key} unavailable: both backend and cache failed") from e


def get_item(item_id):
    fresh_key = f"{FRESH_KEY_PREFIX}{item_id}"
    stale_key = f"{STALE_KEY_PREFIX}{item_id}"
    return _get_with_cache(fresh_key, stale_key, lambda: fetch_from_backend(item_id))


def get_site(hex_share_id):
    fresh_key = f"{FRESH_KEY_PREFIX}{hex_share_id}"
    stale_key = f"{STALE_KEY_PREFIX}{hex_share_id}"
    return _get_with_cache(fresh_key, stale_key, lambda: fetch_from_backend(hex_share_id))


def get_analytics(hex_share_id, hours=720):
    fresh_key = f"{FRESH_ANALYTICS_PREFIX}{hex_share_id}:{hours}"
    stale_key = f"{STALE_ANALYTICS_PREFIX}{hex_share_id}:{hours}"
    return _get_with_cache(fresh_key, stale_key, lambda: fetch_analytics_from_backend(hex_share_id, hours))


if __name__ == "__main__":
    item_id = sys.argv[1] if len(sys.argv) > 1 else "1"
    hours = int(sys.argv[2]) if len(sys.argv) > 2 else None
    try:
        if hours is not None:
            data, source = get_analytics(item_id, hours)
        else:
            data, source = get_item(item_id)
        print(f"\nResult (source={source}): {data}")
    except Exception as exc:
        print(f"ERROR: {exc}")
        sys.exit(1)
