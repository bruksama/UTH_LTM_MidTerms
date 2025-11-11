"""
Player Model
"""

class Player:
    """
    Represents a player in the game
    """
    def __init__(self, player_id: str, name: str, room_id: str):
        self.id = player_id
        self.name = name
        self.score = 0
        self.room_id = room_id
        self.is_drawer = False

    # --- methods cần dùng ngay ---
    def add_score(self, points: int):
        self.score += int(points)

    def set_drawer(self, is_drawer: bool):
        self.is_drawer = bool(is_drawer)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "score": self.score,
            "room_id": self.room_id,
            "is_drawer": self.is_drawer,
        }
