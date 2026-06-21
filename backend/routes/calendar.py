from flask import Blueprint, request, jsonify
from uuid import uuid4
from datetime import datetime, timezone

from storage import Storage

calendar_bp = Blueprint("calendar", __name__)
storage = Storage("calendar.json")


@calendar_bp.route("/api/calendar", methods=["GET"])
def list_events():
    year = request.args.get("year")
    month = request.args.get("month")
    events = storage.read()
    if year and month:
        year, month = int(year), int(month)
        events = [e for e in events if e["date"].startswith(f"{year:04d}-{month:02d}")]
    return jsonify(events)


@calendar_bp.route("/api/calendar", methods=["POST"])
def create_event():
    data = request.get_json(silent=True) or {}
    events = storage.read()
    event = {
        "id": str(uuid4()),
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "date": data.get("date", ""),
        "start_time": data.get("start_time"),
        "end_time": data.get("end_time"),
        "all_day": data.get("all_day", False),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    events.append(event)
    storage.write(events)
    return jsonify(event), 201


@calendar_bp.route("/api/calendar/<event_id>", methods=["PUT"])
def update_event(event_id):
    data = request.get_json(silent=True) or {}
    events = storage.read()
    for e in events:
        if e["id"] == event_id:
            for key in ("title", "description", "date", "start_time", "end_time", "all_day"):
                if key in data:
                    e[key] = data[key]
            storage.write(events)
            return jsonify(e)
    return jsonify({"error": "Not found"}), 404


@calendar_bp.route("/api/calendar/<event_id>", methods=["DELETE"])
def delete_event(event_id):
    events = storage.read()
    events = [e for e in events if e["id"] != event_id]
    storage.write(events)
    return "", 204
