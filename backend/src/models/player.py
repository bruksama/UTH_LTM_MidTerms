"""
Player Model
TODO: Implement Player class
(Thành viên 2)
"""

class Player:
    """
    Represents a player in the game
    
    Attributes:
        id (str): Unique player identifier (socket_id)
        name (str): Player display name
        score (int): Player's current score
        room_id (str): ID of the room player is in
        is_drawer (bool): Whether player is currently drawing
    """
    def __init__(self, player_id, name, room_id):
        self.id = player_id
        self.name = name
        self.score = 0
        self.room_id = room_id

        self.is_drawer = False
        self.guessed_correctly = False   # NEW: dùng trong check_guess
        self.connected = True            # NEW: offline/online tracking
    
    def add_score(self, points):
        """
        Add points to player's score
        Args:
            points: Number of points to add
        """
        self.score += points
    
    def set_drawer(self, is_drawer):
        """
        Set whether player is currently drawing
        Args:
            is_drawer: Boolean indicating drawer status
        """
        self.is_drawer = is_drawer
    def mark_guessed(self):
        """Mark the player as having guessed correctly."""
        self.guessed_correctly = True
    def reset_round_state(self):
        """Reset state at the start of each round."""
        self.guessed_correctly = False
        self.is_drawer = False

    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'score': self.score,
            'is_drawer': self.is_drawer,
            'guessed_correctly': self.guessed_correctly,
            'connected': self.connected
        }

