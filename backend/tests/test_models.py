"""
Unit tests for models (Player and Room)
"""
import pytest
from models.player import Player
from models.room import Room


class TestPlayer:
    """Test cases for Player model"""
    
    def test_player_creation(self):
        """Test creating a new player"""
        player = Player('player_123', 'Test Player', 'room_001')
        
        assert player.id == 'player_123'
        assert player.name == 'Test Player'
        assert player.room_id == 'room_001'
        assert player.score == 0
        assert player.is_drawer == False
    
    def test_player_add_score(self):
        """Test adding score to player"""
        player = Player('player_123', 'Test', 'room_001')
        
        player.add_score(100)
        assert player.score == 100
        
        player.add_score(50)
        assert player.score == 150
        
        # Negative scores
        player.add_score(-30)
        assert player.score == 120
    
    def test_player_set_drawer(self):
        """Test setting drawer status"""
        player = Player('player_123', 'Test', 'room_001')
        
        assert player.is_drawer == False
        
        player.set_drawer(True)
        assert player.is_drawer == True
        
        player.set_drawer(False)
        assert player.is_drawer == False
    
    def test_player_to_dict(self):
        """Test converting player to dictionary"""
        player = Player('player_123', 'Test Player', 'room_001')
        player.add_score(100)
        player.set_drawer(True)
        
        data = player.to_dict()
        
        assert isinstance(data, dict)
        assert data['id'] == 'player_123'
        assert data['name'] == 'Test Player'
        assert data['score'] == 100
        assert data['is_drawer'] == True


class TestRoom:
    """Test cases for Room model"""
    
    def test_room_creation(self):
        """Test creating a new room"""
        room = Room('ROOM01', 'host_123')
        
        assert room.id == 'ROOM01'
        assert room.host_id == 'host_123'
        assert room.game_state == 'waiting'
        assert room.get_player_count() == 1  # Host is auto-added
        assert len(room.players) == 1
        assert 'host_123' in room.players
        assert room.created_at is not None
    
    def test_room_add_player(self):
        """Test adding players to room"""
        room = Room('ROOM01', 'host_123')
        
        # Room already has host (1 player)
        assert room.get_player_count() == 1
        
        # Add first additional player
        success = room.add_player('player_1')
        assert success == True
        assert room.get_player_count() == 2
        assert 'player_1' in room.players
        
        # Add second additional player
        success = room.add_player('player_2')
        assert success == True
        assert room.get_player_count() == 3
        
        # Try adding duplicate player
        success = room.add_player('player_1')
        assert success == False
        assert room.get_player_count() == 3
    
    def test_room_remove_player(self):
        """Test removing players from room"""
        room = Room('ROOM01', 'host_123')
        room.add_player('player_1')
        room.add_player('player_2')
        room.add_player('player_3')
        
        # Room now has 4 players (host + 3 added)
        assert room.get_player_count() == 4
        
        # Remove existing player
        removed = room.remove_player('player_2')
        assert removed == True
        assert room.get_player_count() == 3
        assert 'player_2' not in room.players
        
        # Try removing non-existent player
        removed = room.remove_player('player_999')
        assert removed == False
        assert room.get_player_count() == 3
    
    def test_room_get_player_count(self):
        """Test getting player count"""
        room = Room('ROOM01', 'host_123')
        
        # Starts with 1 (host)
        assert room.get_player_count() == 1
        
        room.add_player('player_1')
        assert room.get_player_count() == 2
        
        room.add_player('player_2')
        room.add_player('player_3')
        assert room.get_player_count() == 4
        
        room.remove_player('player_1')
        assert room.get_player_count() == 3
    
    def test_room_can_start_game(self):
        """Test checking if game can start"""
        room = Room('ROOM01', 'host_123')
        
        # Starts with 1 player (host), minimum is 2
        assert room.can_start_game() == False
        
        room.add_player('player_1')
        # Now has 2 players
        assert room.can_start_game() == True
        
        room.add_player('player_2')
        # Now has 3 players
        assert room.can_start_game() == True
        
        # Custom minimum
        assert room.can_start_game(min_players=4) == False
        
        room.add_player('player_3')
        # Now has 4 players
        assert room.can_start_game(min_players=4) == True
    
    def test_room_to_dict(self):
        """Test converting room to dictionary"""
        room = Room('ROOM01', 'host_123')
        room.add_player('player_1')
        room.add_player('player_2')
        
        # Test without players list
        data = room.to_dict(include_players=False)
        
        assert isinstance(data, dict)
        assert data['id'] == 'ROOM01'
        assert data['host_id'] == 'host_123'
        assert data['player_count'] == 3  # host + 2 added
        assert data['game_state'] == 'waiting'
        assert 'created_at' in data
        assert 'players' not in data
        
        # Test with players list
        data_with_players = room.to_dict(include_players=True)
        assert 'players' in data_with_players
        assert len(data_with_players['players']) == 3
        assert 'host_123' in data_with_players['players']

