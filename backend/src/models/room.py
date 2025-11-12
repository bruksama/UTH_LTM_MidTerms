# backend/src/models/room.py
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Optional, List
import uuid

from .player import Player

@dataclass
class Room:
    room_id: str
    owner_id: Optional[str] = None
    current_drawer_id: Optional[str] = None
    state: str = "waiting"  # waiting | playing
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    players: Dict[str, Player] = field(default_factory=dict)

    @staticmethod
    def create() -> "Room":
        return Room(room_id=str(uuid.uuid4()))

    def add_player(self, player: Player):
        self.players[player.player_id] = player
        if self.owner_id is None:
            self.owner_id = player.player_id

    def remove_player(self, player_id: str):
        if player_id in self.players:
            del self.players[player_id]
        if self.current_drawer_id == player_id:
            self.current_drawer_id = None
        if self.owner_id == player_id:
            # chuyển owner cho người còn lại nếu có
            self.owner_id = next(iter(self.players.keys()), None)

    def get_player_count(self) -> int:
        return len(self.players)

    def can_start_game(self, min_players: int = 2) -> bool:
        return self.get_player_count() >= min_players

    def list_players(self) -> List[dict]:
        return [p.to_dict() for p in self.players.values()]

    def to_dict(self):
        return {
            "room_id": self.room_id,
            "owner_id": self.owner_id,
            "current_drawer_id": self.current_drawer_id,
            "state": self.state,
            "created_at": self.created_at,
            "players": self.list_players(),
        }
