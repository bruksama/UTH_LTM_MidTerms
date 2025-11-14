"""
Unit tests for handlers
"""
import pytest
from handlers import room_handler, drawing_handler, chat_handler
from storage import data_store
from models.player import Player


class TestRoomHandler:
    """Test cases for room_handler"""
    
    def test_create_room(self):
        """Test creating a new room"""
        room_id = room_handler.create_room()
        
        # Room ID should be 6 characters uppercase
        assert room_id is not None
        assert len(room_id) == 6
        assert room_id.isupper()
        assert room_id.isalnum()
        
        # Room should exist in storage
        room = data_store.get_room(room_id)
        assert room is not None
        assert room.id == room_id
    
    def test_create_multiple_rooms(self):
        """Test creating multiple rooms generates unique IDs"""
        room_ids = set()
        
        for _ in range(10):
            room_id = room_handler.create_room()
            room_ids.add(room_id)
        
        # All IDs should be unique
        assert len(room_ids) == 10
    
    def test_add_player_to_room(self):
        """Test adding a player to a room"""
        room_id = room_handler.create_room()
        
        success, error, room_data = room_handler.add_player_to_room(
            room_id, 'player_1', 'Test Player'
        )
        
        assert success == True
        assert error is None
        assert room_data is not None
        assert room_data['room_id'] == room_id
        assert len(room_data['players']) == 1
        assert room_data['players'][0]['name'] == 'Test Player'
        
        # Verify player exists in storage
        player = data_store.get_player('player_1')
        assert player is not None
        assert player.name == 'Test Player'
        assert player.room_id == room_id
    
    def test_add_multiple_players_to_room(self):
        """Test adding multiple players to same room"""
        room_id = room_handler.create_room()
        
        # Add first player
        success1, _, room_data1 = room_handler.add_player_to_room(
            room_id, 'p1', 'Player 1'
        )
        assert success1 == True
        assert len(room_data1['players']) == 1
        
        # Add second player
        success2, _, room_data2 = room_handler.add_player_to_room(
            room_id, 'p2', 'Player 2'
        )
        assert success2 == True
        assert len(room_data2['players']) == 2
        
        # Verify both players in room
        players = room_handler.get_room_players(room_id)
        assert len(players) == 2
    
    def test_add_player_to_invalid_room(self):
        """Test adding player to non-existent room"""
        success, error, room_data = room_handler.add_player_to_room(
            'INVALID', 'player_1', 'Test'
        )
        
        assert success == False
        assert error == 'Room not found'
        assert room_data is None
        
        # Player should not be created
        player = data_store.get_player('player_1')
        assert player is None
    
    def test_remove_player_from_room(self):
        """Test removing a player from room"""
        room_id = room_handler.create_room()
        room_handler.add_player_to_room(room_id, 'player_1', 'Test Player')
        
        # Remove player
        returned_room_id, player_name = room_handler.remove_player_from_room('player_1')
        
        assert returned_room_id == room_id
        assert player_name == 'Test Player'
        
        # Player should be removed from storage
        player = data_store.get_player('player_1')
        assert player is None
        
        # Room should still exist but empty
        room = data_store.get_room(room_id)
        assert room is None  # Room removed when empty
    
    def test_remove_player_keeps_room_if_not_empty(self):
        """Test that room is not deleted if players remain"""
        room_id = room_handler.create_room()
        room_handler.add_player_to_room(room_id, 'p1', 'Player 1')
        room_handler.add_player_to_room(room_id, 'p2', 'Player 2')
        
        # Remove one player
        room_handler.remove_player_from_room('p1')
        
        # Room should still exist
        room = data_store.get_room(room_id)
        assert room is not None
        assert room.get_player_count() == 1
    
    def test_remove_nonexistent_player(self):
        """Test removing a player that doesn't exist"""
        returned_room_id, player_name = room_handler.remove_player_from_room('nonexistent')
        
        assert returned_room_id is None
        assert player_name is None
    
    def test_get_room_players(self):
        """Test getting all players in a room"""
        room_id = room_handler.create_room()
        room_handler.add_player_to_room(room_id, 'p1', 'Player 1')
        room_handler.add_player_to_room(room_id, 'p2', 'Player 2')
        room_handler.add_player_to_room(room_id, 'p3', 'Player 3')
        
        players = room_handler.get_room_players(room_id)
        
        assert len(players) == 3
        assert all(isinstance(p, dict) for p in players)
        
        names = [p['name'] for p in players]
        assert 'Player 1' in names
        assert 'Player 2' in names
        assert 'Player 3' in names
    
    def test_get_room_data(self):
        """Test getting room data"""
        room_id = room_handler.create_room()
        
        room = room_handler.get_room_data(room_id)
        
        assert room is not None
        assert room.id == room_id


class TestDrawingHandler:
    """Test cases for drawing_handler"""
    
    def setup_method(self):
        """Setup test data for each test"""
        # Create room and player
        self.room_id = room_handler.create_room()
        room_handler.add_player_to_room(self.room_id, 'player_1', 'Test')
    
    def test_broadcast_drawing_start(self):
        """Test broadcasting drawing start"""
        room_id, event_data = drawing_handler.broadcast_drawing_start(
            'player_1', 100, 200
        )
        
        assert room_id == self.room_id
        assert event_data is not None
        assert event_data['type'] == 'start'
        assert event_data['x'] == 100
        assert event_data['y'] == 200
    
    def test_broadcast_drawing_move(self):
        """Test broadcasting drawing move"""
        room_id, event_data = drawing_handler.broadcast_drawing_move(
            'player_1', 150, 250
        )
        
        assert room_id == self.room_id
        assert event_data['type'] == 'move'
        assert event_data['x'] == 150
        assert event_data['y'] == 250
    
    def test_broadcast_drawing_end(self):
        """Test broadcasting drawing end"""
        room_id, event_data = drawing_handler.broadcast_drawing_end('player_1')
        
        assert room_id == self.room_id
        assert event_data['type'] == 'end'
    
    def test_broadcast_color_change(self):
        """Test broadcasting color change"""
        room_id, event_data = drawing_handler.broadcast_color_change(
            'player_1', '#FF0000'
        )
        
        assert room_id == self.room_id
        assert event_data['type'] == 'color'
        assert event_data['color'] == '#FF0000'
    
    def test_broadcast_brush_size_change(self):
        """Test broadcasting brush size change"""
        room_id, event_data = drawing_handler.broadcast_brush_size_change(
            'player_1', 15
        )
        
        assert room_id == self.room_id
        assert event_data['type'] == 'brush_size'
        assert event_data['size'] == 15
    
    def test_broadcast_canvas_clear(self):
        """Test broadcasting canvas clear"""
        room_id, event_data = drawing_handler.broadcast_canvas_clear('player_1')
        
        assert room_id == self.room_id
        assert event_data['type'] == 'clear'
    
    def test_broadcast_with_invalid_player(self):
        """Test broadcasting with non-existent player"""
        room_id, event_data = drawing_handler.broadcast_drawing_start(
            'nonexistent', 100, 200
        )
        
        assert room_id is None
        assert event_data is None


class TestChatHandler:
    """Test cases for chat_handler"""
    
    def setup_method(self):
        """Setup test data for each test"""
        # Create room and player
        self.room_id = room_handler.create_room()
        room_handler.add_player_to_room(self.room_id, 'player_1', 'Test Player')
    
    def test_process_message(self):
        """Test processing a chat message"""
        room_id, message_data, is_correct = chat_handler.process_message(
            'player_1', 'Hello world!'
        )
        
        assert room_id == self.room_id
        assert message_data is not None
        assert message_data['player_name'] == 'Test Player'
        assert message_data['message'] == 'Hello world!'
        assert message_data['is_guess'] == False
        assert is_correct == False
    
    def test_process_message_with_whitespace(self):
        """Test message sanitization"""
        room_id, message_data, _ = chat_handler.process_message(
            'player_1', '  Hello!  '
        )
        
        assert message_data['message'] == 'Hello!'
    
    def test_process_empty_message(self):
        """Test processing empty message"""
        room_id, message_data, _ = chat_handler.process_message(
            'player_1', '   '
        )
        
        assert message_data['message'] == ''
    
    def test_process_message_invalid_player(self):
        """Test processing message from non-existent player"""
        room_id, message_data, is_correct = chat_handler.process_message(
            'nonexistent', 'Hello'
        )
        
        assert room_id is None
        assert message_data is None
        assert is_correct == False

