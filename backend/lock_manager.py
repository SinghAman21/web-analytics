"""
DC Lab Exp 5: Deadlock Simulation & Resolution over gRPC.

Central Lock Manager that serves AcquireLock / ReleaseLock RPCs.
Maintains a wait-for graph and optionally detects cycles to abort
the newer requester before a real deadlock forms.

Run modes:
    python lock_manager.py              # Simulation mode (no detection — deadlock hangs forever)
    python lock_manager.py detect       # Detection mode (cycle check → abort → retry)
"""

import sys
import threading
from concurrent import futures

import grpc

sys.stdout.reconfigure(line_buffering=True)

from grpc_generated import analytics_pb2, analytics_pb2_grpc

PORT = "localhost:60060"
RESOURCES = ["draft", "submission"]


class LockManager(analytics_pb2_grpc.LockServiceServicer):
    def __init__(self, detect: bool):
        self.detect = detect
        self.locks = {r: None for r in RESOURCES}       # resource_id -> holder_id
        self.wait_for = {}                               # holder_id -> resource_id (blocked on)
        self.cond = threading.Condition()
        self.lock = self.cond  # the condition's underlying lock

    # -- cycle detection --------------------------------------------------

    def _would_cycle(self, holder: int, resource: str) -> bool:
        """Walk the wait-for chain starting at the current owner of `resource`.
        If it eventually leads back to `holder`, granting this wait creates a cycle."""
        visited = set()
        current_resource = resource
        while True:
            owner = self.locks.get(current_resource)
            if owner is None or owner == holder:
                return owner == holder
            if owner in visited:
                return False
            visited.add(owner)
            current_resource = self.wait_for.get(owner)
            if current_resource is None:
                return False

    # -- RPC handlers -----------------------------------------------------

    def AcquireLock(self, request, context):
        resource = request.resource_id
        holder = request.holder_id

        with self.lock:
            if resource not in self.locks:
                return analytics_pb2.LockReply(granted=False, message="unknown resource")

            # Resource is free — grant immediately
            if self.locks[resource] is None:
                self.locks[resource] = holder
                print(f"[LockManager] Node-{holder} ACQUIRED '{resource}'")
                return analytics_pb2.LockReply(granted=True, message="granted")

            # Resource held by someone else
            if self.detect:
                if self._would_cycle(holder, resource):
                    owner = self.locks[resource]
                    print(f"[LockManager] DEADLOCK DETECTED: Node-{holder} -> "
                          f"'{resource}' (held by Node-{owner}) would close a cycle. "
                          f"Aborting Node-{holder}.")
                    return analytics_pb2.LockReply(
                        granted=False, message="deadlock-abort"
                    )

            # Block until resource becomes free
            owner = self.locks[resource]
            self.wait_for[holder] = resource
            print(f"[LockManager] Node-{holder} WAITING for '{resource}' "
                  f"(held by Node-{owner})")

            # Wait — lock is released during wait, re-acquired on notify
            self.cond.wait()

            # Woken up — assign the resource to this holder
            self.locks[resource] = holder
            self.wait_for.pop(holder, None)

        print(f"[LockManager] Node-{holder} ACQUIRED '{resource}' (after waiting)")
        return analytics_pb2.LockReply(granted=True, message="granted-after-wait")

    def ReleaseLock(self, request, context):
        resource = request.resource_id
        holder = request.holder_id

        with self.lock:
            if self.locks.get(resource) != holder:
                return analytics_pb2.LockReply(
                    granted=False, message="not holder"
                )
            self.locks[resource] = None
            print(f"[LockManager] Node-{holder} RELEASED '{resource}'")
            # Wake one waiter
            self.cond.notify()

        return analytics_pb2.LockReply(granted=True, message="released")


def main():
    detect = len(sys.argv) > 1 and sys.argv[1] == "detect"
    manager = LockManager(detect)

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    analytics_pb2_grpc.add_LockServiceServicer_to_server(manager, server)
    server.add_insecure_port(PORT)
    server.start()
    print(f"LockManager started on {PORT}  (deadlock detection = {detect})")
    server.wait_for_termination()


if __name__ == "__main__":
    main()
