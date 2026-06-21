from flask import Blueprint, request, jsonify
from uuid import uuid4
from datetime import datetime, timezone, date

from storage import Storage

reminders_bp = Blueprint("reminders", __name__)
storage = Storage("reminders.json")


@reminders_bp.route("/api/reminders", methods=["GET"])
def list_reminders():
    return jsonify(storage.read())


@reminders_bp.route("/api/reminders", methods=["POST"])
def create_reminder():
    data = request.get_json(silent=True) or {}
    reminders = storage.read()
    reminder = {
        "id": str(uuid4()),
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "time": data.get("time", "12:00"),
        "days": data.get("days", [0, 1, 2, 3, 4, 5, 6]),
        "active": data.get("active", True),
        "one_shot": data.get("one_shot", False),
        "fired_dates": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    reminders.append(reminder)
    storage.write(reminders)
    return jsonify(reminder), 201


@reminders_bp.route("/api/reminders/<reminder_id>", methods=["PUT"])
def update_reminder(reminder_id):
    data = request.get_json(silent=True) or {}
    reminders = storage.read()
    for r in reminders:
        if r["id"] == reminder_id:
            for key in ("title", "description", "time", "days", "active", "one_shot"):
                if key in data:
                    r[key] = data[key]
            storage.write(reminders)
            return jsonify(r)
    return jsonify({"error": "Not found"}), 404


@reminders_bp.route("/api/reminders/<reminder_id>", methods=["DELETE"])
def delete_reminder(reminder_id):
    reminders = storage.read()
    reminders = [r for r in reminders if r["id"] != reminder_id]
    storage.write(reminders)
    return "", 204


@reminders_bp.route("/api/reminders/check", methods=["GET"])
def check_reminders():
    reminders = storage.read()
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    current_day = now.weekday()
    today = date.today().isoformat()

    due = []
    for r in reminders:
        if not r.get("active", True):
            continue
        if current_day not in r.get("days", []):
            continue
        if r.get("time") != current_time:
            continue
        if r.get("one_shot") and today in r.get("fired_dates", []):
            continue
        due.append(r)

    return jsonify(due)


@reminders_bp.route("/api/reminders/<reminder_id>/fire", methods=["POST"])
def fire_reminder(reminder_id):
    reminders = storage.read()
    today = date.today().isoformat()
    for r in reminders:
        if r["id"] == reminder_id:
            fired = r.get("fired_dates", [])
            if today not in fired:
                fired.append(today)
            r["fired_dates"] = fired
            if r.get("one_shot"):
                r["active"] = False
            storage.write(reminders)
            return jsonify(r)
    return jsonify({"error": "Not found"}), 404
