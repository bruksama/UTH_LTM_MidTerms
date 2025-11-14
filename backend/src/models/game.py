"""
Game Model - Game State Machine
TODO: Implement Game class for managing game state and rounds
(Thành viên 2)
"""
import random

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
        self.state = "waiting"
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

    def start_game(self, players):
        """
        Start game with list of player IDs
        """
        if len(players) < 2:
            return False

        self.current_round = 1
        self.state = "playing"
        return True
    def start_round(self, players, word_list):
        """
        Start a new round
        """
        if not players:
            return None

        # select drawer
        self.drawer_id = self.select_drawer(players)

        # pick word
        self.current_word = self.select_word(word_list)

        # set timer
        self.timer = 90  # default

        self.state = "playing"
        return {
            "drawer_id": self.drawer_id,
            "word": self.current_word
        }
    def end_round(self):
        """
        End the current round
        """
        self.state = "round_ended"
        return self.current_word
    def select_drawer(self, players):
        """
        Select random drawer from players
        """
        return random.choice(players) if players else None
    def select_word(self, word_list):
        """
        Select random word from wordlist
        """
        if not word_list:
            return None
        return random.choice(word_list)
    def check_guess(self, guess: str) -> bool:
        """
        So sánh guess với current_word (case-insensitive)
        """
        if not self.current_word:
            return False

        return guess.strip().lower() == self.current_word.strip().lower()
    
    def calculate_scores(self, drawer: "Player", guesser: "Player"):
        """
        Calculate scores:
        - Guesser gets points
        - Drawer gets points for each correct guess
        """
        GUESSER_POINTS = 10
        DRAWER_POINTS = 5

        if guesser:
            guesser.add_score(GUESSER_POINTS)
        if drawer:
            drawer.add_score(DRAWER_POINTS)