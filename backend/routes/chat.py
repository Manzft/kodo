from flask import Blueprint, request, jsonify
import requests as http

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/api/chat/models", methods=["POST"])
def list_models():
    data = request.get_json(silent=True) or {}
    api_key = data.get("api_key")
    base_url = data.get("base_url", "https://api.openai.com/v1").rstrip("/")
    if not api_key:
        return jsonify({"error": "API key required"}), 400
    try:
        resp = http.get(
            f"{base_url}/models",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=15,
        )
        resp.raise_for_status()
        models = resp.json().get("data", [])
        return jsonify({
            "models": [{"id": m["id"]} for m in models]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chat_bp.route("/api/chat/send", methods=["POST"])
def send_message():
    data = request.get_json(silent=True) or {}
    api_key = data.get("api_key")
    base_url = data.get("base_url", "https://api.openai.com/v1").rstrip("/")
    model = data.get("model")
    messages = data.get("messages", [])

    if not api_key or not model or not messages:
        return jsonify({"error": "api_key, model and messages required"}), 400

    try:
        resp = http.post(
            f"{base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={"model": model, "messages": messages},
            timeout=60,
        )
        resp.raise_for_status()
        result = resp.json()
        choice = result["choices"][0]
        return jsonify({
            "message": {
                "role": "assistant",
                "content": choice["message"]["content"],
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
