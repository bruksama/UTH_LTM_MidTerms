"""
Game Handler
TODO: Implement game logic (rounds, scoring, timer)
(Thành viên 2)
"""

def start_game(room_id):
    """
    Start a new game in a room
    Args:
        room_id: Room identifier
    """
    # TODO: Implement game start logic
    pass

def start_round(room_id):
    """
    Start a new round in the game
    Args:
        room_id: Room identifier
    """
    # TODO: Implement round start logic
    # - Select random drawer
    # - Select random word
    # - Start timer
    pass

def end_round(room_id):
    """
    End the current round
    Args:
        room_id: Room identifier
    """
    # TODO: Implement round end logic
    # - Calculate scores
    # - Update game state
    pass

def check_guess(room_id, player_id, guess):
    """
    Check if a guess is correct
    Args:
        room_id: Room identifier
        player_id: Player identifier
        guess: Guessed word
    Returns: True if correct, False otherwise
    """
    # TODO: Implement guess checking
    # - Compare guess with current word (case-insensitive)
    # - Return True if correct
    pass

def calculate_scores(room_id, correct_guesser_id):
    """
    Calculate scores after a correct guess
    Args:
        room_id: Room identifier
        correct_guesser_id: ID of player who guessed correctly
    """
    # TODO: Implement score calculation
    # - Add points to correct guesser
    # - Add points to drawer
    pass

def update_timer(room_id, seconds):
    """
    Update the round timer
    Args:
        room_id: Room identifier
        seconds: Remaining seconds
    """
    # TODO: Implement timer update logic
    pass

