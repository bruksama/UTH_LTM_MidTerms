from flask_socketio import SocketIO, emit, join_room, leave_room
from typing import Dict
from src.models.room import Room
from src.models.player import Player


rooms: Dict[str, Room] = {}      # room_code -> Room
players: Dict[str, Player] = {}  # sid -> Player

def register_room_handlers(socketio: SocketIO):
    @socketio.on("create_room")
    def create_room(data):
        from flask import request
        name = (data or {}).get("name", "Host")
        code = (data or {}).get("code")
        sid = request.sid

        if not code:
            import uuid
            code = str(uuid.uuid4())[:6].upper()
        if code in rooms:
            return emit("error", {"message": "Room existed"})

        room = Room(code=code, owner_id=sid)
        host = Player(player_id=sid, name=name, room_id=code)
        room.add_player(host)
        rooms[code] = room
        players[sid] = host

        join_room(code)
        emit("room_created", {"room_id": code, "players": room.list_players()})
        socketio.emit("room_players", {"players": room.list_players()}, room=code)

    @socketio.on("join_room")
    def join_room_evt(data):
        from flask import request
        code = (data or {}).get("room_id")
        name = (data or {}).get("player_name", "Player")
        sid  = request.sid

        room = rooms.get(code)
        if not room:
            return emit("error", {"message": "Room not found"})

        if sid in room.players:
            return emit("room_joined", {"room_id": code, "players": room.list_players()})

        p = Player(player_id=sid, name=name, room_id=code)
        room.add_player(p)
        players[sid] = p
        join_room(code)

        emit("room_joined", {"room_id": code, "players": room.list_players()})
        socketio.emit("player_joined", {"player": p.to_dict()}, room=code)

    @socketio.on("leave_room")
    def leave_room_evt(data=None):
        from flask import request
        sid = request.sid
        p = players.get(sid)
        if not p:
            return
        code = p.room_id
        room = rooms.get(code)
        if room:
            room.remove_player(sid)
            socketio.emit("player_left", {"player_id": sid, "players": room.list_players()}, room=code)
            leave_room(code)
            if not room.players:
                rooms.pop(code, None)
        players.pop(sid, None)

    return rooms, players
