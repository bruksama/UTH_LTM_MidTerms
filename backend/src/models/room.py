"""
Room Model
Manages game rooms and their players
"""
from datetime import datetime
from config.constants import (
    MAX_PLAYERS_PER_ROOM,
    MIN_PLAYERS_TO_START,
)

class Room:
    """
    Represents a game room
    
    Attributes:
        id (str): Unique room identifier
        players (list): List of player IDs in the room
        game_state (str): Current game state
        created_at (datetime): Room creation timestamp
    """
    def __init__(self, room_id, host_id):
        self.id = room_id
        self.host_id = host_id              # NEW: chủ phòng
        self.players = [host_id]            # Host vào trước
        self.current_game = None            # NEW: Game object
        self.game_state = 'waiting'         # waiting, playing, ended
        self.created_at = datetime.now()

        self.max_players = MAX_PLAYERS_PER_ROOM               # NEW: giới hạn tối đa
    
    def add_player(self, player_id):
        """Add a player to the room."""
        if len(self.players) >= self.max_players:
            return False

        if player_id not in self.players:
            self.players.append(player_id)
            return True

        return False
    
    def remove_player(self, player_id):
        """Remove a player from the room."""
        if player_id in self.players:
            self.players.remove(player_id)

            # Nếu host rời → chuyển quyền host cho người tiếp theo
            if player_id == self.host_id and self.players:
                self.host_id = self.players[0]

            return True

        return False
    def is_host(self, player_id):
        """Check if a player is the room host."""
        return player_id == self.host_id
    def has_player(self, player_id):
        """Check if player is in room."""
        return player_id in self.players

    def get_player_count(self):
        return len(self.players)
    
    def can_start_game(self, min_players=2):
        return self.get_player_count() >= min_players
    def set_game(self, game_obj):
        """Assign a game instance to this room."""
        self.current_game = game_obj
        self.game_state = "playing"

    def end_game(self):
        self.current_game = None
        self.game_state = "waiting"
    def to_dict(self, include_players=False):
        data = {
            'id': self.id,
            'host_id': self.host_id,
            'player_count': self.get_player_count(),
            'game_state': self.game_state,
            'created_at': self.created_at.isoformat()
        }

        if include_players:
            data['players'] = self.players

        return data
