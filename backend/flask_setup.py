from flask import Flask
from flask_socketio import SocketIO
import eventlet


# Monkeypatch to try to make websocket emit reach client
eventlet.monkey_patch()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
