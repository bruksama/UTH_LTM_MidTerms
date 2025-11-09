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
        
    # TODO: Implement methods
    # - add_score(points)
    # - set_drawer(is_drawer)
    # - to_dict()

