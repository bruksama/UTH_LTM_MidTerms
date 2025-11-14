"""
Room Handler
Manages room creation, joining, and leaving operations
"""
import uuid
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from models.room import Room
from models.player import Player
from storage import data_store


def create_room(host_id):
    """
    Create a new game room
    Args:
        host_id: socket_id của người tạo phòng (host)
    Returns:
        str: Room ID of created room
    """
    room_id = str(uuid.uuid4())[:6].upper()

    # Tạo Room với host_id
    room = Room(room_id, host_id)

    data_store.add_room(room)
    return room_id



def add_player_to_room(room_id, player_id, player_name):
    """
    Add a player to a room
    Args:
        room_id: Room identifier
        player_id: Player identifier (socket_id)
        player_name: Player display name
    Returns:
        tuple: (success: bool, error_message: str|None, room_data: dict|None)
    """
    # Validate room exists
    room = data_store.get_room(room_id)
    if not room:
        return False, 'Room not found', None
    
    # Create Player object
    player = Player(player_id, player_name, room_id)
    
    # Add player to storage
    data_store.add_player(player)
    
    # Add player to room
    room.add_player(player_id)
    
    # Get all players in room for response
    players_list = get_room_players(room_id)
    
    room_data = {
        'room_id': room_id,
        'players': players_list
    }
    
    return True, None, room_data


def remove_player_from_room(player_id):
    """
    Remove a player from their room
    Args:
        player_id: Player identifier
    Returns:
        tuple: (room_id: str|None, player_name: str|None)
    """
    # Get player
    player = data_store.get_player(player_id)
    if not player:
        return None, None
    
    room_id = player.room_id
    player_name = player.name
    
    # Get room
    room = data_store.get_room(room_id)
    if room:
        # Remove player from room
        room.remove_player(player_id)
        
        # Remove empty rooms
        if room.get_player_count() == 0:
            data_store.remove_room(room_id)
    
    # Remove player from storage
    data_store.remove_player(player_id)
    
    return room_id, player_name


def get_room_players(room_id):
    """
    Get all players in a room as dictionary list
    Args:
        room_id: Room identifier
    Returns:
        list: List of player dictionaries
    """
    players = data_store.get_players_in_room(room_id)
    return [player.to_dict() for player in players]


def get_room_data(room_id):
    """
    Get room data
    Args:
        room_id: Room identifier
    Returns:
        Room object or None
    """
    return data_store.get_room(room_id)

