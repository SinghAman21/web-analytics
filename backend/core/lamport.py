"""
Lamport logical clock for event ordering in a distributed system.

Every ingesting process (backend replica) keeps a monotonic counter. When an
event arrives it is stamped with `(lamport_ts, process_id)`:

    lamport_ts  = max(local_counter, incoming_ts) + 1
    process_id  = unique id of this replica (tie-breaker for a total order)

Two events are ordered by comparing `(lamport_ts, process_id)` lexicographically.
This guarantees a deterministic total order across replicas without relying on
synchronized physical clocks. Physical `event_time` is retained for display;
`received_at` (server time) is used for date bucketing.
"""

import logging
import os
import socket
import threading
from typing import Optional

logger = logging.getLogger(__name__)


def _default_process_id() -> str:
    replica = os.getenv("REPLICA_ID")
    if replica:
        return replica
    return f"{socket.gethostname()}:{os.getpid()}"


class LamportClock:
    """Thread-safe Lamport logical clock with a fixed process identity."""

    def __init__(self, process_id: Optional[str] = None, initial: int = 0) -> None:
        self.process_id = process_id or _default_process_id()
        self._counter = max(0, int(initial))
        self._lock = threading.Lock()

    @property
    def value(self) -> int:
        with self._lock:
            return self._counter

    def tick(self, incoming_ts: int = 0) -> int:
        """Advance the clock past `incoming_ts` and return the new timestamp."""
        try:
            incoming = max(0, int(incoming_ts))
        except (TypeError, ValueError):
            incoming = 0
        with self._lock:
            self._counter = max(self._counter, incoming) + 1
            return self._counter

    def stamp(self, incoming_ts: int = 0) -> dict:
        """Return the (lamport_ts, process_id) tuple for an incoming event."""
        ts = self.tick(incoming_ts)
        return {"lamport_ts": ts, "process_id": self.process_id}


_clock: Optional[LamportClock] = None
_clock_lock = threading.Lock()


def get_clock() -> LamportClock:
    """Return the process-wide Lamport clock singleton."""
    global _clock
    if _clock is None:
        with _clock_lock:
            if _clock is None:
                _clock = LamportClock()
                logger.info("Lamport clock initialized (process_id=%s)", _clock.process_id)
    return _clock


def order_key(event: dict) -> tuple:
    """Sort key for events based on their Lamport tuple."""
    return (int(event.get("lamport_ts") or 0), str(event.get("process_id") or ""))
