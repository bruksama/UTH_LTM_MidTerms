"""
Drawing Handler
Manages drawing-related events and broadcasts
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from storage import data_store


def get_player_room(player_id):
    """
    Helper function to get room_id for a player
    Args:
        player_id: Player identifier
    Returns:
        str: Room ID or None if player not found
    """
    player = data_store.get_player(player_id)
    if player:
        return player.room_id
    return None


def broadcast_drawing_start(player_id, x, y):
    """
    Prepare drawing start event data for broadcast
    Args:
        player_id: Player identifier
        x: X coordinate
        y: Y coordinate
    Returns:
        tuple: (room_id: str|None, event_data: dict|None)
    """
    room_id = get_player_room(player_id)
    if not room_id:
        return None, None
    
    event_data = {
        'type': 'start',
        'x': x,
        'y': y
    }
    
    return room_id, event_data


def broadcast_drawing_move(player_id, x, y):
    """
    Prepare drawing move event data for broadcast
    Args:
        player_id: Player identifier
        x: X coordinate
        y: Y coordinate
    Returns:
        tuple: (room_id: str|None, event_data: dict|None)
    """
    room_id = get_player_room(player_id)
    if not room_id:
        return None, None
    
    event_data = {
        'type': 'move',
        'x': x,
        'y': y
    }
    
    return room_id, event_data


def broadcast_drawing_end(player_id):
    """
    Prepare drawing end event data for broadcast
    Args:
        player_id: Player identifier
    Returns:
        tuple: (room_id: str|None, event_data: dict|None)
    """
    room_id = get_player_room(player_id)
    if not room_id:
        return None, None
    
    event_data = {
        'type': 'end'
    }
    
    return room_id, event_data


def broadcast_color_change(player_id, color):
    """
    Prepare color change event data for broadcast
    Args:
        player_id: Player identifier
        color: Hex color code
    Returns:
        tuple: (room_id: str|None, event_data: dict|None)
    """
    room_id = get_player_room(player_id)
    if not room_id:
        return None, None
    
    event_data = {
        'type': 'color',
        'color': color
    }
    
    return room_id, event_data


def broadcast_brush_size_change(player_id, size):
    """
    Prepare brush size change event data for broadcast
    Args:
        player_id: Player identifier
        size: Brush size in pixels
    Returns:
        tuple: (room_id: str|None, event_data: dict|None)
    """
    room_id = get_player_room(player_id)
    if not room_id:
        return None, None
    
    event_data = {
        'type': 'brush_size',
        'size': size
    }
    
    return room_id, event_data


def broadcast_canvas_clear(player_id):
    """
    Khi 1 player (thường là drawer) bấm xóa canvas
    Trả về (room_id, event_data) để app.py broadcast
    """
    player = data_store.get_player(player_id)
    if not player:
        return None, None

    room_id = player.room_id

    event_data = {
        "type": "clear",          # <<< QUAN TRỌNG: type cố định, ví dụ 'clear'
        "player_id": player_id,
        "room_id": room_id,
    }

    return room_id, event_data


