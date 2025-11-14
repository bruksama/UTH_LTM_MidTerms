"""
Pytest configuration and fixtures
"""
import sys
import os

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

import pytest
from storage import data_store

@pytest.fixture(autouse=True)
def reset_storage():
    """
    Automatically reset storage before each test
    This ensures tests don't interfere with each other
    """
    data_store.rooms.clear()
    data_store.players.clear()
    data_store.games.clear()
    yield
    # Cleanup after test
    data_store.rooms.clear()
    data_store.players.clear()
    data_store.games.clear()

