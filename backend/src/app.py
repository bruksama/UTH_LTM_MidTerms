"""
Main Flask Application with Socket.IO
Entry point for the Draw & Guess game server
"""
import os
from flask import Flask, request
from flask_socketio import SocketIO, emit, leave_room
from flask_cors import CORS
from dotenv import load_dotenv

# packages nội bộ
from src.handlers.room_handler import register_room_handlers

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Đăng ký các event về phòng (create/join/leave) và lấy chung rooms, players
rooms, players = register_room_handlers(socketio)

@app.route("/")
def index():
    return {'status': 'ok', 'message': 'Draw & Guess Server is running'}

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    print(f"Client disconnected: {sid}")
    # Dọn dẹp nếu user đang ở trong phòng
    p = players.get(sid)
    if not p:
        return
    code = p.room_id
    room = rooms.get(code)
    if room:
        room.remove_player(sid)
        socketio.emit("player_left", {
            "player_id": sid,
            "players": room.list_players()
        }, room=code)
        leave_room(code)
        if not room.players:
            rooms.pop(code, None)
    players.pop(sid, None)

# ---------------- Drawing / Chat events (xài dict players từ handler) --------------
@socketio.on('drawing_start')
def handle_drawing_start(data):
    p = players.get(request.sid)
    if not p: return
    socketio.emit('canvas_update', {
        'type': 'start',
        'x': (data or {}).get('x'),
        'y': (data or {}).get('y')
    }, room=p.room_id, include_self=False)

@socketio.on('drawing_move')
def handle_drawing_move(data):
    p = players.get(request.sid)
    if not p: return
    socketio.emit('canvas_update', {
        'type': 'move',
        'x': (data or {}).get('x'),
        'y': (data or {}).get('y')
    }, room=p.room_id, include_self=False)

@socketio.on('drawing_end')
def handle_drawing_end(data=None):
    p = players.get(request.sid)
    if not p: return
    socketio.emit('canvas_update', {'type': 'end'}, room=p.room_id, include_self=False)

@socketio.on('change_color')
def handle_change_color(data):
    p = players.get(request.sid)
    if not p: return
    socketio.emit('canvas_update', {
        'type': 'color',
        'color': (data or {}).get('color')
    }, room=p.room_id, include_self=False)

@socketio.on('change_brush_size')
def handle_change_brush_size(data):
    p = players.get(request.sid)
    if not p: return
    socketio.emit('canvas_update', {
        'type': 'brush_size',
        'size': (data or {}).get('size')
    }, room=p.room_id, include_self=False)

@socketio.on('clear_canvas')
def handle_clear_canvas():
    p = players.get(request.sid)
    if not p: return
    socketio.emit('canvas_update', {'type': 'clear'}, room=p.room_id, include_self=False)

@socketio.on('send_message')
def handle_send_message(data):
    p = players.get(request.sid)
    if not p: return
    msg = (data or {}).get('message', '').strip()
    socketio.emit('chat_message', {
        'player_name': p.name,
        'message': msg,
        'is_guess': False
    }, room=p.room_id)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
