# backend/src/models/player.py
from dataclasses import dataclass, field
from datetime import datetime
import uuid

@dataclass
class Player:
    player_id: str
    name: str
    score: int = 0
    is_drawer: bool = False
    joined_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    @staticmethod
    def create(name: str) -> "Player":
        return Player(player_id=str(uuid.uuid4()), name=name)

    def to_dict(self):
        return {
            "player_id": self.player_id,
            "name": self.name,
            "score": self.score,
            "is_drawer": self.is_drawer,
            "joined_at": self.joined_at,
        }
