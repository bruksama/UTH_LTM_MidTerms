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
    )

    # Check đoán đúng
    is_correct = game.check_guess(text)

    if is_correct:
        # Cộng điểm nhưng KHÔNG được làm sập handler
        try:
            game_handler.calculate_scores(room_id, player_id)
        except Exception as e:
            print("[SCORE ERROR]", e)
    return room_id, message_data, is_correct
