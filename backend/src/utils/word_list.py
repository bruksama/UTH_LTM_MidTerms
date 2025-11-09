"""
Word List Utility
TODO: Implement word list management
(Thành viên 2)
"""
import json
import os
import random

def load_word_list():
    """
    Load word list from JSON file
    Returns: List of words
    """
    # Load from backend/src/data/wordlist.json
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, '..', 'data', 'wordlist.json')
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            words = json.load(f)
        return words
    except FileNotFoundError:
        return []

def get_random_word():
    """
    Get a random word from the word list
    Returns: Random word string
    """
    # TODO: Implement random word selection
    words = load_word_list()
    if words:
        return random.choice(words)
    return None

