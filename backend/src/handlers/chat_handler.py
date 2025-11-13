"""
Chat Handler
Manages chat messages and guess processing
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from storage import data_store


def process_message(player_id, message):
    """
    Process chat message
    Args:
        player_id: Player identifier
        message: Message text
    Returns:
        tuple: (room_id: str|None, message_data: dict|None, is_correct_guess: bool)
    
    Note: is_correct_guess is always False for now
    TODO: Will integrate with game_handler.check_guess() when game logic is implemented
    """
    # Get player
    player = data_store.get_player(player_id)
    if not player:
        return None, None, False
    
    room_id = player.room_id
    
    # Sanitize message (strip whitespace)
    sanitized_message = message.strip()
    
    # TODO: Future enhancement - check if message is a correct guess
    # This will be implemented when game logic is added
    # For now, all messages are treated as regular chat
    is_correct_guess = False
    
    # Prepare message data for broadcast
    message_data = {
        'player_name': player.name,
        'message': sanitized_message,
        'is_guess': False  # TODO: Set to True when game logic checks guess
    }
    
    return room_id, message_data, is_correct_guess

