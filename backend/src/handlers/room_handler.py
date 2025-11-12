# backend/src/handlers/room_handler.py
from flask_socketio import emit, join_room, leave_room
from typing import Dict

from ..models.room import Room
from ..models.player import Player

# state tạm thời trong memory (sau có thể tách RoomManager)
ROOMS: Dict[str, Room] = {}     # room_id -> Room
PLAYER_ROOM: Dict[str, str] = {}  # sid -> room_id
SID_PLAYER: Dict[str, Player] = {}  # sid -> Player

def _room_info_payload(room: Room):
    return {"room": room.to_dict()}

def handle_create_room(sio, sid, data):
    # data: { "player_name": "Tuan" }
    name = (data or {}).get("player_name", f"Player-{sid[:5]}")
    room = Room.create()
    player = Player.create(name=name)

    # cập nhật state
    room.add_player(player)
    ROOMS[room.room_id] = room
    PLAYER_ROOM[sid] = room.room_id
    SID_PLAYER[sid] = player

    join_room(room.room_id, sid=sid)

    emit("room_created", {"room_id": room.room_id, "player": player.to_dict()}, to=sid)
    emit("room_info", _room_info_payload(room), room=room.room_id)

def handle_join_room(sio, sid, data):
    # data: { "room_id": "...", "player_name": "Trang" }
    room_id = (data or {}).get("room_id")
    name = (data or {}).get("player_name", f"Player-{sid[:5]}")

    room = ROOMS.get(room_id)
    if not room:
        emit("error", {"message": "Room not found"}, to=sid)
        return

    player = Player.create(name=name)
    room.add_player(player)

    PLAYER_ROOM[sid] = room.room_id
    SID_PLAYER[sid] = player
    join_room(room.room_id, sid=sid)

    emit("room_joined", {"room_id": room.room_id, "player": player.to_dict()}, to=sid)
    emit("player_joined", {"player": player.to_dict()}, room=room.room_id, include_self=False)
    emit("room_info", _room_info_payload(room), room=room.room_id)

def handle_leave_room(sio, sid):
    room_id = PLAYER_ROOM.get(sid)
    player = SID_PLAYER.get(sid)
    if not room_id or not player:
        return

    room = ROOMS.get(room_id)
    if room:
        room.remove_player(player.player_id)
        emit("player_left", {"player_id": player.player_id}, room=room.room_id)
        emit("room_info", _room_info_payload(room), room=room.room_id)

        # nếu phòng trống thì xóa
        if room.get_player_count() == 0:
            del ROOMS[room.room_id]

    # dọn map
    leave_room(room_id, sid=sid)
    PLAYER_ROOM.pop(sid, None)
    SID_PLAYER.pop(sid, None)

def handle_disconnect(sio, sid):
    # rời phòng khi mất kết nối
    handle_leave_room(sio, sid)
