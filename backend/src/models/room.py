"""
Room Model
Manages game rooms and their players
"""
from datetime import datetime


class Room:
    """
    Represents a game room
    
    Attributes:
        id (str): Unique room identifier
        players (list): List of player IDs in the room
        game_state (str): Current game state
        created_at (datetime): Room creation timestamp
    """
    def __init__(self, room_id):
        self.id = room_id
        self.players = []  # List of player IDs
        self.game_state = 'waiting'  # waiting, playing, round_ended, game_ended
        self.created_at = datetime.now()
    
    def add_player(self, player_id):
        """
        Add a player to the room
        Args:
            player_id: Player identifier to add
        Returns:
            Boolean indicating success
        """
        if player_id not in self.players:
            self.players.append(player_id)
            return True
        return False
    
    def remove_player(self, player_id):
        """
        Remove a player from the room
        Args:
            player_id: Player identifier to remove
        Returns:
            Boolean indicating if player was removed
        """
        if player_id in self.players:
            self.players.remove(player_id)
            return True
        return False
    
    def get_player_count(self):
        """
        Get the number of players in the room
        Returns:
            Integer count of players
        """
        return len(self.players)
    
    def can_start_game(self, min_players=2):
        """
        Check if the room has enough players to start
        Args:
            min_players: Minimum number of players required
        Returns:
            Boolean indicating if game can start
        """
        return self.get_player_count() >= min_players
    
    def to_dict(self, include_players_data=False):
        """
        Convert room to dictionary for JSON serialization
        Args:
            include_players_data: If True, includes full player data (requires storage access)
        Returns:
            Dictionary with room data
        """
        data = {
            'id': self.id,
            'player_count': self.get_player_count(),
            'game_state': self.game_state,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if not include_players_data:
            data['players'] = self.players
        
        return data

