from flask import Blueprint, request, jsonify
from uuid import uuid4
from datetime import datetime, timezone, date, timedelta

from storage import Storage

trackers_bp = Blueprint("trackers", __name__)
storage = Storage("trackers.json")


@trackers_bp.route("/api/trackers", methods=["GET"])
def list_trackers():
    return jsonify(storage.read())


@trackers_bp.route("/api/trackers", methods=["POST"])
def create_tracker():
    data = request.get_json(silent=True) or {}
    trackers = storage.read()
    t = {
        "id": str(uuid4()),
        "name": data.get("name", ""),
        "description": data.get("description", ""),
        "start_date": data.get("start_date", date.today().isoformat()),
        "target_days": data.get("target_days", 30),
        "entries": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    trackers.append(t)
    storage.write(trackers)
    return jsonify(t), 201


@trackers_bp.route("/api/trackers/<tracker_id>", methods=["PUT"])
def update_tracker(tracker_id):
    data = request.get_json(silent=True) or {}
    trackers = storage.read()
    for t in trackers:
        if t["id"] == tracker_id:
            t["name"] = data.get("name", t["name"])
            t["description"] = data.get("description", t["description"])
            t["start_date"] = data.get("start_date", t["start_date"])
            t["target_days"] = data.get("target_days", t["target_days"])
            storage.write(trackers)
            return jsonify(t)
    return jsonify({"error": "Not found"}), 404


@trackers_bp.route("/api/trackers/<tracker_id>", methods=["DELETE"])
def delete_tracker(tracker_id):
    trackers = storage.read()
    trackers = [t for t in trackers if t["id"] != tracker_id]
    storage.write(trackers)
    return "", 204


@trackers_bp.route("/api/trackers/<tracker_id>/toggle", methods=["POST"])
def toggle_entry(tracker_id):
    data = request.get_json(silent=True) or {}
    entry_date_str = data.get("date")
    if not entry_date_str:
        return jsonify({"error": "date required"}), 400
    trackers = storage.read()
    for t in trackers:
        if t["id"] == tracker_id:
            start = date.fromisoformat(t["start_date"])
            end = start + timedelta(days=t["target_days"] - 1)
            entry_date = date.fromisoformat(entry_date_str)
            if entry_date < start or entry_date > end:
                return jsonify({"error": "Date out of range"}), 400
            entries = t.setdefault("entries", [])
            existing = next((e for e in entries if e["date"] == entry_date_str), None)
            if existing:
                entries.remove(existing)
            else:
                entries.append({"date": entry_date_str, "value": True})
            storage.write(trackers)
            return jsonify(t)
    return jsonify({"error": "Not found"}), 404


@trackers_bp.route("/api/trackers/<tracker_id>/stats", methods=["GET"])
def get_stats(tracker_id):
    trackers = storage.read()
    for t in trackers:
        if t["id"] == tracker_id:
            entries = t.get("entries", [])
            entry_dates = {e["date"] for e in entries}
            start = date.fromisoformat(t["start_date"])
            today = date.today()
            end = start + timedelta(days=t["target_days"] - 1)
            actual_end = min(end, today)

            done = sum(
                1 for d in entry_dates
                if start <= date.fromisoformat(d) <= actual_end
            )

            streak = 0
            check = actual_end
            while check >= start:
                if check.isoformat() in entry_dates:
                    streak += 1
                    check -= timedelta(days=1)
                else:
                    break

            best_streak = 0
            current = 0
            check = start
            while check <= actual_end:
                if check.isoformat() in entry_dates:
                    current += 1
                    best_streak = max(best_streak, current)
                else:
                    current = 0
                check += timedelta(days=1)

            return jsonify({
                "done": done,
                "target": t["target_days"],
                "streak": streak,
                "best_streak": best_streak,
            })
    return jsonify({"error": "Not found"}), 404
