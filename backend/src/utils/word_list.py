import json, random
from pathlib import Path
from typing import List

def load_word_list(path: str) -> List[str]:
    p = Path(path)
    with p.open("r", encoding="utf-8") as f:
        words = json.load(f)
    return [w.strip() for w in words if isinstance(w, str) and w.strip()]

def pick_random(words: List[str]) -> str:
    if not words:
        raise RuntimeError("word list empty")
    return random.choice(words)
