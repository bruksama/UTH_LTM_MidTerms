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
    
    def to_dict(self):
        """
        Convert player to dictionary for JSON serialization
        Returns:
            Dictionary with player data
        """
        return {
            'id': self.id,
            'name': self.name,
            'score': self.score,
            'is_drawer': self.is_drawer
        }

