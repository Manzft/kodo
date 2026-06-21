from flask import Blueprint, request, jsonify
from uuid import uuid4
from datetime import datetime, timezone

from storage import Storage

routines_bp = Blueprint("routines", __name__)
storage = Storage("routines.json")


def _data():
    d = storage.read()
    if isinstance(d, list):
        return {"routines": [], "sessions": []}
    return d


def _save(data):
    storage.write(data)


# -- Routines --

@routines_bp.route("/api/routines", methods=["GET"])
def list_routines():
    return jsonify(_data().get("routines", []))


@routines_bp.route("/api/routines", methods=["POST"])
def create_routine():
    data = request.get_json(silent=True) or {}
    d = _data()
    routine = {
        "id": str(uuid4()),
        "name": data.get("name", ""),
        "exercises": data.get("exercises", []),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    d.setdefault("routines", []).append(routine)
    _save(d)
    return jsonify(routine), 201


@routines_bp.route("/api/routines/<routine_id>", methods=["PUT"])
def update_routine(routine_id):
    data = request.get_json(silent=True) or {}
    d = _data()
    for r in d.get("routines", []):
        if r["id"] == routine_id:
            r["name"] = data.get("name", r["name"])
            r["exercises"] = data.get("exercises", r["exercises"])
            _save(d)
            return jsonify(r)
    return jsonify({"error": "Not found"}), 404


@routines_bp.route("/api/routines/<routine_id>", methods=["DELETE"])
def delete_routine(routine_id):
    d = _data()
    d["routines"] = [r for r in d.get("routines", []) if r["id"] != routine_id]
    _save(d)
    return "", 204


# -- Sessions --

@routines_bp.route("/api/sessions", methods=["GET"])
def list_sessions():
    routine_id = request.args.get("routine_id")
    d = _data()
    sessions = d.get("sessions", [])
    if routine_id:
        sessions = [s for s in sessions if s.get("routine_id") == routine_id]
    sessions.sort(key=lambda s: s.get("date", ""), reverse=True)
    return jsonify(sessions)


@routines_bp.route("/api/sessions", methods=["POST"])
def create_session():
    data = request.get_json(silent=True) or {}
    d = _data()
    session = {
        "id": str(uuid4()),
        "routine_id": data.get("routine_id"),
        "routine_name": data.get("routine_name", ""),
        "date": data.get("date", ""),
        "duration": data.get("duration"),
        "notes": data.get("notes", ""),
        "exercises": data.get("exercises", []),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    d.setdefault("sessions", []).append(session)
    _save(d)
    return jsonify(session), 201


@routines_bp.route("/api/sessions/<session_id>", methods=["DELETE"])
def delete_session(session_id):
    d = _data()
    d["sessions"] = [s for s in d.get("sessions", []) if s["id"] != session_id]
    _save(d)
    return "", 204
