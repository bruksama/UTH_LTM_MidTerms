"""
Room Model
TODO: Implement Room class for managing game rooms
(Thành viên 2)
"""

class Room:
    """
    Represents a game room
    
    Attributes:
        id (str): Unique room identifier
        players (list): List of players in the room
        game_state (str): Current game state
        created_at (datetime): Room creation timestamp
    """
    def __init__(self, room_id):
        self.id = room_id
        self.players = []
        self.game_state = 'waiting'
        self.created_at = None
        
    # TODO: Implement methods
    # - add_player(player)
    # - remove_player(player_id)
    # - can_start_game()
    # - get_player_count()

