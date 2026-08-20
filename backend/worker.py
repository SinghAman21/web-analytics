"""
DC Lab Exp 5: Deadlock Simulation & Resolution — Worker Processes.

Two workers (AutoSave and FinalSubmit) compete for two shared resources
(draft and submission) in opposite order, creating a classic circular wait.

Run in separate terminals (cd into backend/, venv activated):
    python worker.py autosave      # Node-1: acquires draft → submission
    python worker.py finalsubmit   # Node-2: acquires submission → draft

The lock_manager.py must be running first:
    python lock_manager.py              # simulation mode (both hang)
    python lock_manager.py detect       # detection mode (both complete)
"""

import socket
import sys
import threading
import time

import grpc

sys.stdout.reconfigure(line_buffering=True)

from grpc_generated import analytics_pb2, analytics_pb2_grpc

LOCK_MANAGER_ADDR = "localhost:60060"
BARRIER_HOST = "localhost"
BARRIER_PORT = 60061
BARRIER_TIMEOUT = 15
MAX_RETRIES = 5


def acquire(stub, node_id, resource, timestamp):
    return stub.AcquireLock(
        analytics_pb2.LockRequest(
            resource_id=resource, holder_id=node_id, timestamp=timestamp
        )
    )


def release(stub, node_id, resource, timestamp):
    return stub.ReleaseLock(
        analytics_pb2.LockRequest(
            resource_id=resource, holder_id=node_id, timestamp=timestamp
        )
    )


_barrier_server = None


def _start_barrier_server():
    global _barrier_server
    ready = threading.Event()
    clients = []

    server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_sock.bind((BARRIER_HOST, BARRIER_PORT))
    server_sock.listen(2)
    server_sock.settimeout(BARRIER_TIMEOUT)
    _barrier_server = server_sock

    def accept_loop():
        try:
            for _ in range(2):
                conn, _ = server_sock.accept()
                clients.append(conn)
        except socket.timeout:
            pass
        for conn in clients:
            try:
                conn.sendall(b"go")
                conn.close()
            except OSError:
                pass
        ready.set()

    t = threading.Thread(target=accept_loop, daemon=True)
    t.start()
    return ready


def barrier_client(node_id):
    deadline = time.time() + BARRIER_TIMEOUT
    while time.time() < deadline:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((BARRIER_HOST, BARRIER_PORT))
            sock.recv(2)
            sock.close()
            return
        except ConnectionRefusedError:
            time.sleep(0.05)
            continue
    print(f"Node-{node_id}: barrier timed out, proceeding anyway")


def run(node_id, first_resource, second_resource):
    with grpc.insecure_channel(LOCK_MANAGER_ADDR) as channel:
        stub = analytics_pb2_grpc.LockServiceStub(channel)
        ts = 0

        for retry in range(MAX_RETRIES):
            held = []
            aborted = False

            for r1, r2 in [(first_resource, second_resource),
                            (second_resource, first_resource)]:
                ts += 1
                reply = acquire(stub, node_id, r1, ts)
                status = "granted" if reply.granted else reply.message
                print(f"Node-{node_id}: '{r1}' -> granted={reply.granted} ({status})")

                if not reply.granted:
                    aborted = True
                    break

                held.append(r1)

                ts += 1
                reply = acquire(stub, node_id, r2, ts)
                status = "granted" if reply.granted else reply.message
                print(f"Node-{node_id}: '{r2}' -> granted={reply.granted} ({status})")

                if not reply.granted:
                    aborted = True
                    break

                held.append(r2)

                # Both acquired — release and finish
                for res in reversed(held):
                    ts += 1
                    release(stub, node_id, res, ts)
                    print(f"Node-{node_id}: released '{res}'")
                print(f"Node-{node_id}: DONE")
                return

            # Abort path — release all held locks
            if aborted:
                print(f"Node-{node_id}: ABORTED -- releasing held locks and retrying")
                for res in reversed(held):
                    ts += 1
                    release(stub, node_id, res, ts)
                    print(f"Node-{node_id}: released '{res}'")
                # Swap order for next retry
                first_resource, second_resource = second_resource, first_resource
                time.sleep(0.1)
            else:
                return

        print(f"Node-{node_id}: FAILED after {MAX_RETRIES} retries")


def main():
    role = sys.argv[1].lower() if len(sys.argv) > 1 else "autosave"
    if role == "autosave":
        node_id = 1
        first, second = "draft", "submission"
    else:
        node_id = 2
        first, second = "submission", "draft"

    time.sleep(1)

    ready = None
    if node_id == 1:
        ready = _start_barrier_server()

    print(f"Node-{node_id} ({role}): starting — acquiring '{first}' then '{second}'")
    barrier_client(node_id)

    if ready is not None:
        ready.wait(timeout=BARRIER_TIMEOUT)

    run(node_id, first, second)


if __name__ == "__main__":
    main()
