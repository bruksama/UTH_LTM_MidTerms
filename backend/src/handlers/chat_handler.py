"""
Chat Handler
Xử lý chat & đoán từ khóa
"""

import os
import sys

# === FIX PATH ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
sys.path.insert(0, PROJECT_ROOT)

# === Imports chuẩn ===
from storage import data_store
from models.game import Game
from handlers import game_handler  # FIX IMPORT

def process_message(player_id: str, message: str):
    """
    Xử lý chat + đoán từ khóa
    Returns:
        (room_id, message_data, is_correct_guess)
    """
    player = data_store.get_player(player_id)
    if not player:
        return None, None, False

    room_id = player.room_id
    text = (message or "").strip()
    if not text:
        return room_id, None, False

    # Chat bình thường
    message_data = {
        "player_id": player.id,
        "player_name": player.name,
        "message": text,
        "is_system": False,
    }

    # Lấy game của phòng
    game = data_store.get_game(room_id)
    if not game:
        return room_id, message_data, False

    # Debug đoán từ
    print(
        "[GUESS DEBUG]",
        "room:", room_id,
        "| player:", player.name,
        "| guess:", repr(text),
        "| current_word:", repr(game.current_word),
        "| state:", getattr(game, "state", None),
        "| timer:", getattr(game, "timer", None),
    )

    if getattr(game, "state", None) != "playing":
        return room_id, message_data, False
    drawer_id = getattr(game, "drawer_id", None) or getattr(
        game, "current_drawer_id", None
    )
    if player_id == drawer_id:
        # người vẽ chat từ khoá vẫn chỉ là chat thường
        return room_id, message_data, False
    is_correct = game_handler.check_guess(room_id, player_id, text)

    return room_id, message_data, bool(is_correct)

