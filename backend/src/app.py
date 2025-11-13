"""
Main Flask Application with Socket.IO
Entry point for the Draw & Guess game server
"""
import os
from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from dotenv import load_dotenv

# Import handlers
from handlers import room_handler, drawing_handler, chat_handler

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize SocketIO with threading mode
# Using threading mode instead of eventlet/gevent for better Python 3.12+ compatibility
# Threading mode is simpler and sufficient for this application scale
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

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
    
    # Remove player from room using handler
    room_id, player_name = room_handler.remove_player_from_room(request.sid)
    
    if room_id:
        leave_room(room_id)
        # Notify other players
        socketio.emit('player_left', {
            'player_id': request.sid,
            'player_name': player_name
        }, room=room_id)

@socketio.on('create_room')
def handle_create_room(data):
    """Handle room creation"""
    # Create room using handler
    room_id = room_handler.create_room()
    
    # Join the socket room
    join_room(room_id)
    
    # Emit success response
    emit('room_created', {'room_id': room_id})

@socketio.on('join_room')
def handle_join_room(data):
    """Handle player joining a room"""
    room_id = data.get('room_id')
    player_name = data.get('player_name', 'Anonymous')
    
    # Add player to room using handler
    success, error, room_data = room_handler.add_player_to_room(
        room_id, request.sid, player_name
    )
    
    if not success:
        emit('error', {'message': error})
        return
    
    # Join the socket room
    join_room(room_id)
    
    # Notify all players in room
    socketio.emit('player_joined', {
        'player': {
            'id': request.sid,
            'name': player_name,
            'score': 0
        }
    }, room=room_id)
    
    # Send room data to joining player
    emit('room_joined', room_data)

@socketio.on('leave_room')
def handle_leave_room():
    """Handle player leaving a room"""
    # Remove player from room using handler
    room_id, player_name = room_handler.remove_player_from_room(request.sid)
    
    if room_id:
        leave_room(room_id)
        # Notify other players
        socketio.emit('player_left', {
            'player_id': request.sid,
            'player_name': player_name
        }, room=room_id)

# Drawing events
@socketio.on('drawing_start')
def handle_drawing_start(data):
    """Handle drawing start event"""
    room_id, event_data = drawing_handler.broadcast_drawing_start(
        request.sid, data.get('x'), data.get('y')
    )
    
    if room_id:
        socketio.emit('canvas_update', event_data, room=room_id, include_self=False)

@socketio.on('drawing_move')
def handle_drawing_move(data):
    """Handle drawing move event"""
    room_id, event_data = drawing_handler.broadcast_drawing_move(
        request.sid, data.get('x'), data.get('y')
    )
    
    if room_id:
        socketio.emit('canvas_update', event_data, room=room_id, include_self=False)

@socketio.on('drawing_end')
def handle_drawing_end(data):
    """Handle drawing end event"""
    room_id, event_data = drawing_handler.broadcast_drawing_end(request.sid)
    
    if room_id:
        socketio.emit('canvas_update', event_data, room=room_id, include_self=False)

@socketio.on('change_color')
def handle_change_color(data):
    """Handle color change event"""
    room_id, event_data = drawing_handler.broadcast_color_change(
        request.sid, data.get('color')
    )
    
    if room_id:
        socketio.emit('canvas_update', event_data, room=room_id, include_self=False)

@socketio.on('change_brush_size')
def handle_change_brush_size(data):
    """Handle brush size change event"""
    room_id, event_data = drawing_handler.broadcast_brush_size_change(
        request.sid, data.get('size')
    )
    
    if room_id:
        socketio.emit('canvas_update', event_data, room=room_id, include_self=False)

@socketio.on('clear_canvas')
def handle_clear_canvas():
    """Handle canvas clear event"""
    room_id, event_data = drawing_handler.broadcast_canvas_clear(request.sid)
    
    if room_id:
        socketio.emit('canvas_update', event_data, room=room_id, include_self=False)

@socketio.on('send_message')
def handle_send_message(data):
    """Handle chat/guess message"""
    message = data.get('message', '')
    
    # Process message using handler
    room_id, message_data, is_correct_guess = chat_handler.process_message(
        request.sid, message
    )
    
    if room_id and message_data:
        # Broadcast message to all players in room
        socketio.emit('chat_message', message_data, room=room_id)
        
        # TODO: When game logic is implemented, handle correct guess here
        # if is_correct_guess:
        #     socketio.emit('correct_guess', {...}, room=room_id)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)

