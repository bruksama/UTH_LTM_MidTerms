"""
Unit tests for storage/data_store
"""
import pytest
from storage import data_store
from models.room import Room
from models.player import Player


class TestDataStore:
    """Test cases for data store operations"""
    
    def test_add_and_get_room(self):
        """Test adding and retrieving a room"""
        room = Room('TEST01', 'host_123')
        data_store.add_room(room)
        
        retrieved = data_store.get_room('TEST01')
        assert retrieved is not None
        assert retrieved.id == 'TEST01'
        assert retrieved.host_id == 'host_123'
        assert retrieved == room
    
    def test_get_nonexistent_room(self):
        """Test getting a room that doesn't exist"""
        result = data_store.get_room('NONEXIST')
        assert result is None
    
    def test_remove_room(self):
        """Test removing a room"""
        room = Room('TEST01', 'host_123')
        data_store.add_room(room)
        
        # Verify room exists
        assert data_store.get_room('TEST01') is not None
        
        # Remove room
        data_store.remove_room('TEST01')
        
        # Verify room is gone
        assert data_store.get_room('TEST01') is None
    
    def test_remove_nonexistent_room(self):
        """Test removing a room that doesn't exist (should not error)"""
        # Should not raise exception
        data_store.remove_room('NONEXIST')
    
    def test_get_all_rooms(self):
        """Test getting all rooms"""
        room1 = Room('ROOM01', 'host_1')
        room2 = Room('ROOM02', 'host_2')
        room3 = Room('ROOM03', 'host_3')
        
        data_store.add_room(room1)
        data_store.add_room(room2)
        data_store.add_room(room3)
        
        all_rooms = data_store.get_all_rooms()
        assert len(all_rooms) == 3
        assert 'ROOM01' in all_rooms
        assert 'ROOM02' in all_rooms
        assert 'ROOM03' in all_rooms
    
    def test_add_and_get_player(self):
        """Test adding and retrieving a player"""
        player = Player('player_1', 'Test Player', 'ROOM01')
        data_store.add_player(player)
        
        retrieved = data_store.get_player('player_1')
        assert retrieved is not None
        assert retrieved.id == 'player_1'
        assert retrieved.name == 'Test Player'
        assert retrieved == player
    
    def test_get_nonexistent_player(self):
        """Test getting a player that doesn't exist"""
        result = data_store.get_player('nonexistent')
        assert result is None
    
    def test_remove_player(self):
        """Test removing a player"""
        player = Player('player_1', 'Test', 'ROOM01')
        data_store.add_player(player)
        
        # Verify player exists
        assert data_store.get_player('player_1') is not None
        
        # Remove player
        data_store.remove_player('player_1')
        
        # Verify player is gone
        assert data_store.get_player('player_1') is None
    
    def test_get_all_players(self):
        """Test getting all players"""
        player1 = Player('p1', 'Player 1', 'ROOM01')
        player2 = Player('p2', 'Player 2', 'ROOM01')
        player3 = Player('p3', 'Player 3', 'ROOM02')
        
        data_store.add_player(player1)
        data_store.add_player(player2)
        data_store.add_player(player3)
        
        all_players = data_store.get_all_players()
        assert len(all_players) == 3
    
    def test_get_players_in_room(self):
        """Test getting all players in a specific room"""
        player1 = Player('p1', 'Player 1', 'ROOM01')
        player2 = Player('p2', 'Player 2', 'ROOM01')
        player3 = Player('p3', 'Player 3', 'ROOM02')
        player4 = Player('p4', 'Player 4', 'ROOM01')
        
        data_store.add_player(player1)
        data_store.add_player(player2)
        data_store.add_player(player3)
        data_store.add_player(player4)
        
        # Get players in ROOM01
        players_room1 = data_store.get_players_in_room('ROOM01')
        assert len(players_room1) == 3
        player_ids = [p.id for p in players_room1]
        assert 'p1' in player_ids
        assert 'p2' in player_ids
        assert 'p4' in player_ids
        assert 'p3' not in player_ids
        
        # Get players in ROOM02
        players_room2 = data_store.get_players_in_room('ROOM02')
        assert len(players_room2) == 1
        assert players_room2[0].id == 'p3'
        
        # Get players in non-existent room
        players_empty = data_store.get_players_in_room('NONEXIST')
        assert len(players_empty) == 0
    
    def test_storage_isolation(self):
        """Test that rooms and players storage are separate"""
        room = Room('ROOM01', 'host_123')
        player = Player('player_1', 'Test', 'ROOM01')
        
        data_store.add_room(room)
        data_store.add_player(player)
        
        # Both should exist independently
        assert data_store.get_room('ROOM01') is not None
        assert data_store.get_player('player_1') is not None
        
        # Removing room shouldn't remove player
        data_store.remove_room('ROOM01')
        assert data_store.get_room('ROOM01') is None
        assert data_store.get_player('player_1') is not None

