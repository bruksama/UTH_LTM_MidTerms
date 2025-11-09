"""
Main Flask Application with Socket.IO
Entry point for the Draw & Guess game server
"""
import os
from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from dotenv import load_dotenv
import uuid

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# In-memory storage for rooms and games
# TODO: Move to proper data models (Thành viên 2)
rooms = {}
players = {}  # socket_id -> player_data

@app.route('/')
def index():
    """Health check endpoint"""
    return {'status': 'ok', 'message': 'Draw & Guess Server is running'}

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f"Client disconnected: {request.sid}")
    # TODO: Handle player leaving room (Thành viên 2)
    if request.sid in players:
        player = players[request.sid]
        room_id = player.get('room_id')
        if room_id and room_id in rooms:
            leave_room(room_id)
            del players[request.sid]
            # Notify other players
            socketio.emit('player_left', {
                'player_id': request.sid,
                'player_name': player.get('name')
            }, room=room_id)

@socketio.on('create_room')
def handle_create_room(data):
    """Handle room creation"""
    # TODO: Implement room creation logic (Thành viên 2)
    room_id = str(uuid.uuid4())[:6].upper()
    rooms[room_id] = {
        'id': room_id,
        'players': [],
        'game_state': 'waiting',
        'created_at': None
    }
    join_room(room_id)
    emit('room_created', {'room_id': room_id})

@socketio.on('join_room')
def handle_join_room(data):
    """Handle player joining a room"""
    # TODO: Implement join room logic (Thành viên 2)
    room_id = data.get('room_id')
    player_name = data.get('player_name', 'Anonymous')
    
    if room_id not in rooms:
        emit('error', {'message': 'Room not found'})
        return
    
    # Store player info
    players[request.sid] = {
        'id': request.sid,
        'name': player_name,
        'room_id': room_id,
        'score': 0
    }
    
    join_room(room_id)
    rooms[room_id]['players'].append({
        'id': request.sid,
        'name': player_name,
        'score': 0
    })
    
    # Notify all players in room
    socketio.emit('player_joined', {
        'player': {
            'id': request.sid,
            'name': player_name,
            'score': 0
        }
    }, room=room_id)
    
    emit('room_joined', {
        'room_id': room_id,
        'players': rooms[room_id]['players']
    })

@socketio.on('leave_room')
def handle_leave_room():
    """Handle player leaving a room"""
    # TODO: Implement leave room logic (Thành viên 2)
    if request.sid in players:
        player = players[request.sid]
        room_id = player.get('room_id')
        if room_id:
            leave_room(room_id)
            if room_id in rooms:
                rooms[room_id]['players'] = [
                    p for p in rooms[room_id]['players'] 
                    if p['id'] != request.sid
                ]
                socketio.emit('player_left', {
                    'player_id': request.sid,
                    'player_name': player.get('name')
                }, room=room_id)
            del players[request.sid]

# Drawing events
@socketio.on('drawing_start')
def handle_drawing_start(data):
    """Handle drawing start event"""
    # TODO: Broadcast to all players in room (Thành viên 3 & 4)
    if request.sid in players:
        room_id = players[request.sid].get('room_id')
        if room_id:
            socketio.emit('canvas_update', {
                'type': 'start',
                'x': data.get('x'),
                'y': data.get('y')
            }, room=room_id, include_self=False)

@socketio.on('drawing_move')
def handle_drawing_move(data):
    """Handle drawing move event"""
    if request.sid in players:
        room_id = players[request.sid].get('room_id')
        if room_id:
            socketio.emit('canvas_update', {
                'type': 'move',
                'x': data.get('x'),
                'y': data.get('y')
            }, room=room_id, include_self=False)

@socketio.on('drawing_end')
def handle_drawing_end(data):
    """Handle drawing end event"""
    if request.sid in players:
        room_id = players[request.sid].get('room_id')
        if room_id:
            socketio.emit('canvas_update', {
                'type': 'end'
            }, room=room_id, include_self=False)

@socketio.on('change_color')
def handle_change_color(data):
    """Handle color change event"""
    if request.sid in players:
        room_id = players[request.sid].get('room_id')
        if room_id:
            socketio.emit('canvas_update', {
                'type': 'color',
                'color': data.get('color')
            }, room=room_id, include_self=False)

@socketio.on('change_brush_size')
def handle_change_brush_size(data):
    """Handle brush size change event"""
    if request.sid in players:
        room_id = players[request.sid].get('room_id')
        if room_id:
            socketio.emit('canvas_update', {
                'type': 'brush_size',
                'size': data.get('size')
            }, room=room_id, include_self=False)

@socketio.on('clear_canvas')
def handle_clear_canvas():
    """Handle canvas clear event"""
    if request.sid in players:
        room_id = players[request.sid].get('room_id')
        if room_id:
            socketio.emit('canvas_update', {
                'type': 'clear'
            }, room=room_id, include_self=False)

@socketio.on('send_message')
def handle_send_message(data):
    """Handle chat/guess message"""
    # TODO: Implement guess checking logic (Thành viên 2)
    if request.sid in players:
        player = players[request.sid]
        room_id = player.get('room_id')
        message = data.get('message', '').strip()
        
        if room_id:
            # Broadcast message to all players
            socketio.emit('chat_message', {
                'player_name': player.get('name'),
                'message': message,
                'is_guess': False  # TODO: Check if correct guess
            }, room=room_id)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)

