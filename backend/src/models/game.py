# backend/src/models/game.py
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional, Set

def utcnow_iso():
    return datetime.utcnow().isoformat() + "Z"

@dataclass
class Game:
    room_id: str
    round_no: int = 0
    current_word: Optional[str] = None
    round_deadline: Optional[datetime] = None
    guessed_players: Set[str] = field(default_factory=set)  # player_id đã đoán đúng

    def start_round(self, word: str, duration_sec: int):
        self.round_no += 1
        self.current_word = word
        self.guessed_players.clear()
        self.round_deadline = datetime.utcnow() + timedelta(seconds=duration_sec)

    def end_round(self):
        self.current_word = None
        self.round_deadline = None
        self.guessed_players.clear()

    def is_round_active(self) -> bool:
        return self.current_word is not None and self.round_deadline is not None

    def deadline_iso(self) -> Optional[str]:
        return self.round_deadline.isoformat() + "Z" if self.round_deadline else None

    def to_public_dict(self):
        # Trả dữ liệu không lộ từ bí mật
        return {
            "room_id": self.room_id,
            "round_no": self.round_no,
            "deadline": self.deadline_iso(),
        }
