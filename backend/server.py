import os
import sys
from pathlib import Path
from flask import Flask, send_from_directory

sys.path.insert(0, str(Path(__file__).resolve().parent))

from routes.notes import notes_bp
from routes.reminders import reminders_bp
from routes.calendar import calendar_bp
from routes.todos import todos_bp
from routes.routines import routines_bp
from routes.trackers import trackers_bp
from routes.chat import chat_bp

static_dir = os.environ.get("KODO_STATIC_DIR")

app = Flask(__name__)
app.register_blueprint(notes_bp)
app.register_blueprint(reminders_bp)
app.register_blueprint(calendar_bp)
app.register_blueprint(todos_bp)
app.register_blueprint(routines_bp)
app.register_blueprint(trackers_bp)
app.register_blueprint(chat_bp)

@app.route("/")
def index():
    if static_dir:
        return send_from_directory(static_dir, "index.html")
    return "Kodo API running — frontend not bundled"

@app.route("/assets/<path:filename>")
def assets(filename):
    if static_dir:
        return send_from_directory(Path(static_dir) / "assets", filename)
    return "", 404

@app.route("/<path:path>")
def spa_fallback(path):
    if path.startswith("api/"):
        return {"error": "Not found"}, 404
    if static_dir:
        return send_from_directory(static_dir, "index.html")
    return "", 404

if __name__ == "__main__":
    print("  Kodo API — http://localhost:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
