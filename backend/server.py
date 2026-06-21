from flask import Flask

from routes.notes import notes_bp
from routes.reminders import reminders_bp
from routes.calendar import calendar_bp
from routes.todos import todos_bp
from routes.routines import routines_bp
from routes.trackers import trackers_bp
from routes.chat import chat_bp

app = Flask(__name__)
app.register_blueprint(notes_bp)
app.register_blueprint(reminders_bp)
app.register_blueprint(calendar_bp)
app.register_blueprint(todos_bp)
app.register_blueprint(routines_bp)
app.register_blueprint(trackers_bp)
app.register_blueprint(chat_bp)

if __name__ == "__main__":
    print("  Kodo API — http://localhost:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
