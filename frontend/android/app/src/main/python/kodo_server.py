import os
import sys
import threading
import time
import socket

_BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _BASE)

os.environ["KODO_STATIC_DIR"] = os.path.join(_BASE, "static")
os.environ["KODO_DATA_DIR"] = os.path.join(
    os.environ.get("KODO_DATA_DIR", _BASE), "data"
)


def _wait_port(port, timeout=10):
    start = time.time()
    while time.time() - start < timeout:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.5)
            s.connect(("127.0.0.1", port))
            s.close()
            return True
        except:
            time.sleep(0.2)
    return False


def start():
    def _run():
        from backend.server import app
        app.run(host="127.0.0.1", port=5000, debug=False)

    t = threading.Thread(target=_run, daemon=True)
    t.start()
    _wait_port(5000)
