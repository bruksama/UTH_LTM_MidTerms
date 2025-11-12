# backend/src/app.py (chỉ phần liên quan Room)
from flask import Flask, request
from flask_socketio import SocketIO, emit
from .handlers import room_handler
from src.handlers import game_handler

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")  # hoặc cấu hình CORS theo README

@socketio.on("start_game")
def on_start_game():
    game_handler.handle_start_game(socketio, request.sid)

@socketio.on("connect")
def on_connect():
    emit("connected", {"sid": request.sid})

@socketio.on("disconnect")
def on_disconnect():
    room_handler.handle_disconnect(socketio, request.sid)

@socketio.on("create_room")
def on_create_room(data):
    room_handler.handle_create_room(socketio, request.sid, data)

@socketio.on("join_room")
def on_join_room(data):
    room_handler.handle_join_room(socketio, request.sid, data)

@socketio.on("leave_room")
def on_leave_room():
    room_handler.handle_leave_room(socketio, request.sid)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
