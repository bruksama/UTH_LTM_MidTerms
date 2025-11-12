# backend/src/utils/word_list.py
import json
import os
import random

_WORDS = None

def _load_words():
    global _WORDS
    if _WORDS is None:
        base = os.path.dirname(os.path.dirname(__file__))  # .../src
        path = os.path.join(base, "data", "wordlist.json")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        # chấp nhận dạng {"words":[...]} hoặc mảng thuần
        _WORDS = data["words"] if isinstance(data, dict) and "words" in data else data
    return _WORDS

def get_random_word() -> str:
    words = _load_words()
    return random.choice(words)
