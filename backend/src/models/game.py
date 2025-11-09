"""
Game Model - Game State Machine
TODO: Implement Game class for managing game state and rounds
(Thành viên 2)
"""

class Game:
    """
    Manages game state and rounds
    
    Attributes:
        room_id (str): Associated room ID
        current_round (int): Current round number
        state (str): Current game state
        current_word (str): Current word to guess
        drawer_id (str): ID of current drawer
        timer (int): Remaining seconds in current round
    """
    def __init__(self, room_id):
        self.room_id = room_id
        self.current_round = 0
        self.state = 'waiting'  # waiting, playing, round_ended, game_ended
        self.current_word = None
        self.drawer_id = None
        self.timer = 0
        
    # TODO: Implement methods
    # - start_game(players)
    # - start_round(players, word_list)
    # - end_round()
    # - select_drawer(players)
    # - select_word(word_list)
    # - check_guess(guess, word)
    # - calculate_scores()

