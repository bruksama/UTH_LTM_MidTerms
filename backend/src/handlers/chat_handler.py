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
        'player_name': player.name,
        'message': sanitized_message,
        'is_guess': False  # TODO: Set to True when game logic checks guess
    }
    
    return room_id, message_data, is_correct_guess

