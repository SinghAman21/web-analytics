import json
import os
import logging
from typing import Any, Callable, Optional, Tuple

logger = logging.getLogger(__name__)

try:
    import redis
except ImportError:
    redis = None

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "10"))
FRESH_KEY_PREFIX = "fresh:item:"
STALE_KEY_PREFIX = "stale:item:"


def get_redis():
    if redis is None:
        raise ImportError("redis package not installed")
    return redis.Redis(host=REDIS_HOST, port=REDIS_PORT, socket_connect_timeout=1, socket_timeout=1, decode_responses=False)


def cache_get(fresh_key: str) -> Optional[dict]:
    try:
        r = get_redis()
        v = r.get(fresh_key)
        if v:
            return json.loads(v)
    except Exception:
        return None
    return None


def cache_set(fresh_key: str, stale_key: str, data: Any, ttl: int = CACHE_TTL_SECONDS) -> None:
    try:
        r = get_redis()
        r.set(fresh_key, json.dumps(data), ex=ttl)
        r.set(stale_key, json.dumps(data))
    except Exception:
        logger.warning("Redis write failed, continuing without caching")


def cached_fetch(fresh_key: str, stale_key: str, fetch_fn: Callable[[], Any], ttl: int = CACHE_TTL_SECONDS) -> Tuple[Any, str]:
    import grpc
    r = None
    try:
        r = get_redis()
        cached = r.get(fresh_key)
        if cached:
            logger.info("[Cache] HIT %s", fresh_key)
            return json.loads(cached), "cache-hit"
        logger.info("[Cache] MISS %s", fresh_key)
    except Exception as e:
        if redis is not None and isinstance(e, redis.exceptions.RedisError):
            logger.warning("[Cache] REDIS UNAVAILABLE %s", e)
        else:
            logger.warning("[Cache] REDIS UNAVAILABLE %s", e)
        r = None
    try:
        data = fetch_fn()
        if r is not None:
            try:
                r.set(fresh_key, json.dumps(data), ex=ttl)
                r.set(stale_key, json.dumps(data))
            except Exception:
                logger.warning("[Cache] Redis write failed")
        return data, "backend"
    except grpc.RpcError as e:
        logger.warning("[Cache] BACKEND UNAVAILABLE %s", e.code() if hasattr(e, "code") else e)
        if r is not None:
            try:
                stale = r.get(stale_key)
                if stale:
                    logger.info("[Cache] STALE fallback %s", stale_key)
                    return json.loads(stale), "stale-fallback"
            except Exception:
                pass
        raise
    except Exception as e:
        if "RpcError" in type(e).__name__ or "grpc" in str(type(e)).lower():
            if r is not None:
                try:
                    stale = r.get(stale_key)
                    if stale:
                        return json.loads(stale), "stale-fallback"
                except Exception:
                    pass
        raise
