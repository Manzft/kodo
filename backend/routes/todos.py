from flask import Blueprint, request, jsonify
from uuid import uuid4
from datetime import datetime, timezone

from storage import Storage

todos_bp = Blueprint("todos", __name__)
storage = Storage("todos.json")


def _data():
    d = storage.read()
    if isinstance(d, list):
        return {"topics": [], "items": []}
    return d


def _save(data):
    storage.write(data)


# -- Topics --

@todos_bp.route("/api/topics", methods=["GET"])
def list_topics():
    return jsonify(_data().get("topics", []))


@todos_bp.route("/api/topics", methods=["POST"])
def create_topic():
    data = request.get_json(silent=True) or {}
    d = _data()
    topic = {
        "id": str(uuid4()),
        "name": data.get("name", ""),
        "color": data.get("color", "#f26c8f"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    d.setdefault("topics", []).append(topic)
    _save(d)
    return jsonify(topic), 201


@todos_bp.route("/api/topics/<topic_id>", methods=["PUT"])
def update_topic(topic_id):
    data = request.get_json(silent=True) or {}
    d = _data()
    for t in d.get("topics", []):
        if t["id"] == topic_id:
            t["name"] = data.get("name", t["name"])
            t["color"] = data.get("color", t["color"])
            _save(d)
            return jsonify(t)
    return jsonify({"error": "Not found"}), 404


@todos_bp.route("/api/topics/<topic_id>", methods=["DELETE"])
def delete_topic(topic_id):
    d = _data()
    d["topics"] = [t for t in d.get("topics", []) if t["id"] != topic_id]
    d["items"] = [i for i in d.get("items", []) if i.get("topic_id") != topic_id]
    _save(d)
    return "", 204


# -- Items --

@todos_bp.route("/api/todos", methods=["GET"])
def list_items():
    topic_id = request.args.get("topic_id")
    d = _data()
    items = d.get("items", [])
    if topic_id:
        items = [i for i in items if i.get("topic_id") == topic_id]
    return jsonify(items)


@todos_bp.route("/api/todos", methods=["POST"])
def create_item():
    data = request.get_json(silent=True) or {}
    d = _data()
    item = {
        "id": str(uuid4()),
        "topic_id": data.get("topic_id"),
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "done": data.get("done", False),
        "due_date": data.get("due_date"),
        "priority": data.get("priority", "medium"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    d.setdefault("items", []).append(item)
    _save(d)
    return jsonify(item), 201


@todos_bp.route("/api/todos/<item_id>", methods=["PUT"])
def update_item(item_id):
    data = request.get_json(silent=True) or {}
    d = _data()
    for item in d.get("items", []):
        if item["id"] == item_id:
            for key in ("topic_id", "title", "description", "done", "due_date", "priority"):
                if key in data:
                    item[key] = data[key]
            _save(d)
            return jsonify(item)
    return jsonify({"error": "Not found"}), 404


@todos_bp.route("/api/todos/<item_id>", methods=["DELETE"])
def delete_item(item_id):
    d = _data()
    d["items"] = [i for i in d.get("items", []) if i["id"] != item_id]
    _save(d)
    return "", 204
