"""
Data Store Module
Centralized in-memory storage for all game data
"""

# In-memory storage
rooms = {}  # room_id -> Room object
players = {}  # socket_id -> Player object
games = {}  # room_id -> Game object (for future use)


# Room operations
def get_room(room_id):
    """
    Get room by ID
    Args:
        room_id: Room identifier
    Returns:
        Room object or None
    """
    return rooms.get(room_id)


def add_room(room):
    """
    Add a room to storage
    Args:
        room: Room object
    """
    rooms[room.id] = room


def remove_room(room_id):
    """
    Remove a room from storage
    Args:
        room_id: Room identifier
    """
    if room_id in rooms:
        del rooms[room_id]


def get_all_rooms():
    """
    Get all rooms
    Returns:
        Dictionary of all rooms
    """
    return rooms


# Player operations
def get_player(player_id):
    """
    Get player by ID
    Args:
        player_id: Player identifier (socket_id)
    Returns:
        Player object or None
    """
    return players.get(player_id)


def add_player(player):
    """
    Add a player to storage
    Args:
        player: Player object
    """
    players[player.id] = player


def remove_player(player_id):
    """
    Remove a player from storage
    Args:
        player_id: Player identifier
    """
    if player_id in players:
        del players[player_id]


def get_all_players():
    """
    Get all players
    Returns:
        Dictionary of all players
    """
    return players


def get_players_in_room(room_id):
    """
    Get all players in a specific room
    Args:
        room_id: Room identifier
    Returns:
        List of Player objects
    """
    return [player for player in players.values() if player.room_id == room_id]


# Game operations (for future use)
def get_game(room_id):
    """
    Get game by room ID
    Args:
        room_id: Room identifier
    Returns:
        Game object or None
    """
    return games.get(room_id)


def add_game(game):
    """
    Add a game to storage
    Args:
        game: Game object
    """
    games[game.room_id] = game


def remove_game(room_id):
    """
    Remove a game from storage
    Args:
        room_id: Room identifier
    """
    if room_id in games:
        del games[room_id]

def update_player(player):
    return 
   