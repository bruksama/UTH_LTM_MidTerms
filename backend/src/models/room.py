"""
Room Model
"""

from typing import Dict
from .player import Player

class Room:
    def __init__(self, code: str, owner_id: str):
        self.code = code
        self.owner_id = owner_id
        # players: sid -> Player
        self.players: Dict[str, Player] = {}
        self.game_state = "waiting"

    # --- methods handler đang gọi ---
    def add_player(self, p: Player):
        self.players[p.id] = p

    def remove_player(self, sid: str):
        self.players.pop(sid, None)

    def has_player(self, sid: str) -> bool:
        return sid in self.players

    def list_players(self):
        return [p.to_dict() for p in self.players.values()]
