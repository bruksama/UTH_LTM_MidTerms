"""
Game Handler
Implement game logic (rounds, scoring, timer)
(Thành viên 2)
"""

import os
import sys

# Cho phép import từ src/*
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from storage import data_store
from models.game import Game
from utils.word_list import load_word_list  # ← DÙNG UTIL ĐÃ VIẾT

from config.constants import MIN_PLAYERS_TO_START

def start_game(room_id):
    room = data_store.get_room(room_id)
    if not room:
        return False, "Room not found"

    if len(room.players) < MIN_PLAYERS_TO_START:
        return False, f"Không đủ người chơi (tối thiểu {MIN_PLAYERS_TO_START})"


    game = Game(room_id)
    game.start_game(room.players)

    data_store.add_game(game)
    return True, None

def start_round(room_id):
    """Choose drawer, choose word, reset timer"""
    game = data_store.get_game(room_id)
    room = data_store.get_room(room_id)

    if not game or not room:
        return None

    # 🔹 Load word list từ utils/word_list.py
    word_list = load_word_list()
    if not word_list:
        # Không có từ nào → không start round
        return None

    # Game sẽ tự chọn drawer & word từ word_list
    result = game.start_round(room.players, word_list)

    data_store.add_game(game)
    return result  # {drawer_id, word}

def end_round(room_id):
    """Finish the round and return the word"""
    game = data_store.get_game(room_id)
    if not game:
        return None

    word = game.end_round()

    data_store.add_game(game)
    return word

def check_guess(room_id, player_id, guess):
    """Check if player's guess is correct"""
    game = data_store.get_game(room_id)
    if not game:
        return False
    is_correct = game.check_guess(guess)
    if not is_correct:
        return False

    
    calculate_scores(room_id, player_id)

    player = data_store.get_player(player_id)
    if player:
        try:
            player.mark_guessed()
            data_store.update_player(player)
        except AttributeError:
            pass

    return True

def calculate_scores(room_id, guesser_id):
    """Add points for drawer and guesser"""
    game = data_store.get_game(room_id)
    if not game:
        return False

    drawer_id = getattr(game, "current_drawer_id", None) or getattr(game, "drawer_id", None)
    if not drawer_id:
        return False

    drawer = data_store.get_player(drawer_id)
    guesser = data_store.get_player(guesser_id)
    if not drawer or not guesser:
        return False

    # Hàm này sẽ tự cộng điểm cho drawer & guesser
    game.calculate_scores(drawer, guesser)

    if drawer:
        data_store.update_player(drawer)
    if guesser:
        data_store.update_player(guesser)

    return True

def update_timer(room_id, seconds):
    """Update countdown timer"""
    game = data_store.get_game(room_id)
    if not game:
        return None

    game.timer = seconds
    data_store.add_game(game)

    return seconds
