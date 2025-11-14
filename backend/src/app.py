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
from handlers import room_handler, drawing_handler, chat_handler, game_handler
from storage import data_store

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize SocketIO with threading mode
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# ================== GAME TIMER & ROUND HELPERS ==================
ACTIVE_TIMERS = {}
ROUND_DURATION = 90  # giây / round


def _broadcast_round_started(room_id, round_info):
    """
    Gửi sự kiện round_started cho drawer và những người còn lại
    round_info: dict {drawer_id, word}
    """
    drawer_id = round_info.get("drawer_id")
    word = round_info.get("word")

    # Lấy tên người vẽ
    drawer_player = data_store.get_player(drawer_id)
    drawer_name = drawer_player.name if drawer_player else "Người chơi"

    # Payload cho người vẽ: có từ khóa + cờ is_drawer
    drawer_payload = {
        "is_drawer": True,
        "drawer_id": drawer_id,
        "word": word,
        "drawer_name": drawer_name,
        "seconds": ROUND_DURATION,
    }

    # Payload cho những người đoán: không có word
    guesser_payload = {
        "is_drawer": False,
        "drawer_id": drawer_id,
        "drawer_name": drawer_name,
        "seconds": ROUND_DURATION,
    }

    # Gửi riêng cho socket của drawer (sid là 1 room riêng)
    socketio.emit("round_started", drawer_payload, room=drawer_id)

    # Gửi cho cả phòng, trừ thằng drawer
    socketio.emit(
        "round_started",
        guesser_payload,
        room=room_id,
        skip_sid=drawer_id,
    )

def _start_round_timer(room_id, duration=ROUND_DURATION):
  """
  Chạy timer cho round hiện tại của room_id.
  Mỗi giây emit 'timer_update', hết giờ thì end_round + 'round_ended'.
  """
  # Nếu đã có timer đang chạy cho room này thì bỏ qua
  if ACTIVE_TIMERS.get(room_id):
      return

  ACTIVE_TIMERS[room_id] = True

  def _timer_task(rid, dur):
      remaining = dur
      while remaining >= 0:
          # Cập nhật timer trong game_state
          game_handler.update_timer(rid, remaining)

          # Broadcast cho tất cả client trong phòng
          socketio.emit("timer_update", {"seconds": remaining}, room=rid)

          if remaining == 0:
              break

          socketio.sleep(1)
          remaining -= 1

      # Hết giờ → end_round
      final_word = game_handler.end_round(rid)
      socketio.emit(
          "round_ended",
          {"word": final_word},
          room=rid,
      )

      ACTIVE_TIMERS.pop(rid, None)

  socketio.start_background_task(_timer_task, room_id, duration)
# ================== END HELPERS ==================


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
def handle_create_room(data=None):
    """Handle room creation"""
    host_id = request.sid
    print(f"create_room from {host_id}, data={data}")

    room_id = room_handler.create_room(host_id)

    # Host join luôn socket room
    join_room(room_id)

    emit('room_created', {'room_id': room_id})



@socketio.on('join_room')
def handle_join_room(data):
    """Handle player joining a room"""
    room_id = data.get('room_id')
    player_name = data.get('player_name', 'Anonymous')
    
    success, error, room_data = room_handler.add_player_to_room(
        room_id, request.sid, player_name
    )
    
    if not success:
        emit('error', {'message': error})
        return
    
    join_room(room_id)
    
    socketio.emit('player_joined', {
        'player': {
            'id': request.sid,
            'name': player_name,
            'score': 0
        }
    }, room=room_id)
    
    emit('room_joined', room_data)


@socketio.on('leave_room')
def handle_leave_room(data=None):
    """Handle player leaving a room"""
    room_id, player_name = room_handler.remove_player_from_room(request.sid)
    
    if room_id:
        leave_room(room_id)
        socketio.emit('player_left', {
            'player_id': request.sid,
            'player_name': player_name
        }, room=room_id)

# ============= GAME EVENTS =============
@socketio.on('start_game')
def handle_start_game(data):
    room_id = data.get('room_id')
    if not room_id:
        emit('error', {'message': 'room_id is required'})
        return

    success, error = game_handler.start_game(room_id)
    if not success:
        emit('error', {'message': error or 'Cannot start game'})
        return

    # Lấy danh sách players trong phòng cho scoreboard
    players = room_handler.get_room_players(room_id)

    # báo cho tất cả client trong phòng: game đã start
    socketio.emit(
        'game_started',
        {
            'room_id': room_id,
            'players': players,
            'seconds': ROUND_DURATION,   # 90 giây
        },
        room=room_id
    )

    round_info = game_handler.start_round(room_id)
    if not round_info:
        socketio.emit('error', {'message': 'Cannot start round'}, room=room_id)
        return

    _broadcast_round_started(room_id, round_info)
    _start_round_timer(room_id)

# ============= DRAWING EVENTS =============
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
def handle_clear_canvas(data=None):
    """Handle canvas clear event (drawer bấm nút xóa)"""

    sid = request.sid
    print("[clear_canvas] from sid:", sid, "data=", data)

    player = data_store.get_player(sid)
    if not player:
        print("[clear_canvas] player not found for sid", sid)
        return

    room_id = player.room_id
    if not room_id:
        print("[clear_canvas] player has no room", player.id)
        return

    print(f"[clear_canvas] broadcast to room {room_id} (player {player.name})")

    # 1) Gửi tín hiệu xóa canvas cho tất cả viewer trong phòng
    socketio.emit(
        "canvas_update",
        {
            "type": "clear",
            "player_id": player.id,
        },
        room=room_id,
    )

    # 2) Gửi event phụ cho UI (main.js đang nghe 'canvas_cleared')
    socketio.emit(
        "canvas_cleared",
        {
            "room_id": room_id,
            "player_id": player.id,
        },
        room=room_id,
    )




# ============= CHAT / GUESS EVENTS =============
@socketio.on('send_message')
def handle_send_message(data):
    """Handle chat/guess message"""
    message = data.get('message', '')
    
    room_id, message_data, is_correct_guess = chat_handler.process_message(
        request.sid, message
    )
    
    if room_id and message_data:
        socketio.emit('chat_message', message_data, room=room_id)
        # sau này có thể handle is_correct_guess ở đây
    # Nếu đoán đúng → đã được cộng điểm trong game_handler rồi
    if room_id and is_correct_guess:
        # Lấy lại danh sách player sau khi đã update score
        players = room_handler.get_room_players(room_id)

        # Lấy từ khóa hiện tại để thông báo
        game = data_store.get_game(room_id)
        current_word = game.current_word if game else None

        # Cập nhật bảng điểm cho tất cả client
        socketio.emit('scores_updated', {'players': players}, room=room_id)

        # Thông báo đoán đúng (FE đang lắng nghe 'correct_guess')
        socketio.emit(
            'correct_guess',
            {
                'player_id': request.sid,
                'player_name': message_data.get('player_name'),
                'word': current_word,
            },
            room=room_id,
        )

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
