"""
Input Validators and Sanitizers
TODO: Implement input validation and sanitization
(Thành viên 2)
"""
import re
import html

def sanitize_string(input_str):
    """
    Sanitize string input to prevent XSS attacks
    Args:
        input_str: Input string
    Returns: Sanitized string
    """
    if not input_str:
        return ''
    # Escape HTML entities
    sanitized = html.escape(str(input_str))
    # Remove any remaining script tags
    sanitized = re.sub(r'<script[^>]*>.*?</script>', '', sanitized, flags=re.IGNORECASE | re.DOTALL)
    return sanitized.strip()

def validate_room_id(room_id):
    """
    Validate room ID format
    Args:
        room_id: Room ID to validate
    Returns: True if valid, False otherwise
    """
    if not room_id:
        return False
    # Room ID should be 6 alphanumeric characters
    return bool(re.match(r'^[A-Z0-9]{6}$', str(room_id).upper()))

def validate_player_name(name):
    """
    Validate player name
    Args:
        name: Player name to validate
    Returns: True if valid, False otherwise
    """
    if not name:
        return False
    # Name should be 1-20 characters, alphanumeric and spaces
    name = str(name).strip()
    return 1 <= len(name) <= 20 and bool(re.match(r'^[a-zA-Z0-9\s\u00C0-\u1EF9]+$', name))

