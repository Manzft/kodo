from flask import Blueprint, request, jsonify
from uuid import uuid4
from datetime import datetime, timezone

from storage import Storage

notes_bp = Blueprint("notes", __name__)
storage = Storage("notes.json")


@notes_bp.route("/api/notes", methods=["GET"])
def list_notes():
    return jsonify(storage.read())


@notes_bp.route("/api/notes", methods=["POST"])
def create_note():
    data = request.get_json(silent=True) or {}
    notes = storage.read()
    note = {
        "id": str(uuid4()),
        "title": data.get("title", ""),
        "content": data.get("content", ""),
        "category": data.get("category"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    notes.append(note)
    storage.write(notes)
    return jsonify(note), 201


@notes_bp.route("/api/notes/<note_id>", methods=["PUT"])
def update_note(note_id):
    data = request.get_json(silent=True) or {}
    notes = storage.read()
    for note in notes:
        if note["id"] == note_id:
            note["title"] = data.get("title", note["title"])
            note["content"] = data.get("content", note["content"])
            note["category"] = data.get("category", note.get("category"))
            note["updated_at"] = datetime.now(timezone.utc).isoformat()
            storage.write(notes)
            return jsonify(note)
    return jsonify({"error": "Not found"}), 404


@notes_bp.route("/api/notes/<note_id>", methods=["DELETE"])
def delete_note(note_id):
    notes = storage.read()
    notes = [n for n in notes if n["id"] != note_id]
    storage.write(notes)
    return "", 204
