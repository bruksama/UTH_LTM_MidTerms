# backend/src/handlers/game_handler.py
from typing import Dict, Optional
from flask_socketio import emit

from ..config.constants import ROUND_TIMER_SECONDS, MIN_PLAYERS_TO_START
from ..models.game import Game
from ..models.room import Room
from ..models.player import Player
from ..utils.word_list import get_random_word

# Tái dùng state của room_handler (Ngày 1)
from .room_handler import ROOMS, SID_PLAYER, PLAYER_ROOM

# Quản lý game theo room_id
GAMES: Dict[str, Game] = {}  # room_id -> Game

def _find_sid_by_player_id(player_id: str) -> Optional[str]:
    for sid, p in SID_PLAYER.items():
        if p.player_id == player_id:
            return sid
    return None

def _set_drawer(room: Room, drawer_id: str):
    # reset cờ
    for p in room.players.values():
        p.is_drawer = False
    room.current_drawer_id = drawer_id
    if drawer_id in room.players:
        room.players[drawer_id].is_drawer = True

def _pick_first_drawer(room: Room) -> Optional[str]:
    # đơn giản: người đầu tiên trong phòng
    return next(iter(room.players.keys()), None)

def handle_start_game(sio, sid):
    # Xác định room hiện tại từ sid
    room_id = PLAYER_ROOM.get(sid)
    if not room_id:
        emit("error", {"message": "You are not in any room"}, to=sid)
        return

    room = ROOMS.get(room_id)
    if not room:
        emit("error", {"message": "Room not found"}, to=sid)
        return

    if not room.can_start_game(MIN_PLAYERS_TO_START):
        emit("error", {"message": f"Need at least {MIN_PLAYERS_TO_START} players to start"}, to=sid)
        return

    # Chọn drawer
    drawer_id = room.current_drawer_id or _pick_first_drawer(room)
    if not drawer_id:
        emit("error", {"message": "No players in room"}, to=sid)
        return
    _set_drawer(room, drawer_id)

    # Khởi tạo/ lấy game của phòng
    game = GAMES.get(room.room_id) or Game(room_id=room.room_id)
    GAMES[room.room_id] = game

    # Chọn từ & đặt deadline
    secret = get_random_word()
    game.start_round(secret, ROUND_TIMER_SECONDS)
    room.state = "playing"

    # Emit cho cả phòng (không lộ từ)
    emit("round_started", {
        "room_id": room.room_id,
        "game": game.to_public_dict(),
        "drawer_id": drawer_id,
        "players": [p.to_dict() for p in room.players.values()],
    }, room=room.room_id)

    # Gửi từ bí mật riêng cho drawer
    drawer_sid = _find_sid_by_player_id(drawer_id)
    if drawer_sid:
        emit("secret_word", {"word": secret}, to=drawer_sid)
