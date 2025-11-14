"""
Manual Testing Script
Script để test backend thủ công với Socket.IO client

Chạy: python -m tests.test_manual
"""
import socketio
import time

# Global variables
sio = socketio.Client()
room_id = None
test_results = {
    'passed': 0,
    'failed': 0,
    'total': 0
}

# Event handlers
@sio.on('connected')
def on_connected(data):
    log_success('Connected', data)

@sio.on('room_created')
def on_room_created(data):
    global room_id
    room_id = data['room_id']
    log_success('Room created', f"Room ID: {room_id}")
    
@sio.on('room_joined')
def on_room_joined(data):
    log_success('Room joined', f"Players: {len(data['players'])}")

@sio.on('player_joined')
def on_player_joined(data):
    log_success('Player joined', data['player']['name'])

@sio.on('player_left')
def on_player_left(data):
    log_success('Player left', data['player_name'])

@sio.on('canvas_update')
def on_canvas_update(data):
    log_success('Canvas update', data['type'])

@sio.on('chat_message')
def on_chat_message(data):
    log_success('Chat message', f"{data['player_name']}: {data['message']}")

@sio.on('error')
def on_error(data):
    log_error('Server error', data['message'])

def log_success(test_name, details=''):
    """Log successful test"""
    test_results['passed'] += 1
    test_results['total'] += 1
    print(f"PASS: {test_name} - {details}")

def log_error(test_name, details=''):
    """Log failed test"""
    test_results['failed'] += 1
    test_results['total'] += 1
    print(f"FAIL: {test_name} - {details}")

def test_connection():
    """Test 1: Connection"""
    print('\n--- Test 1: Connection ---')
    try:
        sio.connect('http://localhost:5000')
        time.sleep(0.5)
        return True
    except Exception as e:
        log_error('Connection failed', str(e))
        return False

def test_create_room():
    """Test 2: Create Room"""
    print('\n--- Test 2: Create Room ---')
    sio.emit('create_room', {})
    time.sleep(0.5)
    
    if room_id:
        return True
    else:
        log_error('Room creation', 'No room_id received')
        return False

def test_join_room():
    """Test 3: Join Room"""
    print('\n--- Test 3: Join Room ---')
    sio.emit('join_room', {
        'room_id': room_id,
        'player_name': 'Test Player'
    })
    time.sleep(0.5)

def test_drawing_events():
    """Test 4: Drawing Events"""
    print('\n--- Test 4: Drawing Events ---')
    
    # Drawing start
    sio.emit('drawing_start', {'x': 100, 'y': 100})
    time.sleep(0.1)
    
    # Drawing moves
    for i in range(5):
        sio.emit('drawing_move', {'x': 100 + i*10, 'y': 100 + i*10})
        time.sleep(0.05)
    
    # Drawing end
    sio.emit('drawing_end', {})
    time.sleep(0.2)

def test_drawing_tools():
    """Test 5: Drawing Tools"""
    print('\n--- Test 5: Drawing Tools ---')
    
    # Color changes
    colors = ['#FF0000', '#00FF00', '#0000FF']
    for color in colors:
        sio.emit('change_color', {'color': color})
        time.sleep(0.1)
    
    # Brush sizes
    sizes = [3, 10, 20]
    for size in sizes:
        sio.emit('change_brush_size', {'size': size})
        time.sleep(0.1)

def test_canvas_clear():
    """Test 6: Canvas Clear"""
    print('\n--- Test 6: Canvas Clear ---')
    sio.emit('clear_canvas', {})
    time.sleep(0.2)

def test_chat():
    """Test 7: Chat"""
    print('\n--- Test 7: Chat Messages ---')
    messages = [
        'Hello!',
        'Test message 1',
        'Test message 2',
        'Test message 3'
    ]
    for msg in messages:
        sio.emit('send_message', {'message': msg})
        time.sleep(0.2)

def test_leave_room():
    """Test 8: Leave Room"""
    print('\n--- Test 8: Leave Room ---')
    sio.emit('leave_room', {})
    time.sleep(0.5)

def test_invalid_room():
    """Test 9: Invalid Room"""
    print('\n--- Test 9: Join Invalid Room ---')
    sio.emit('join_room', {
        'room_id': 'INVALID', # Thay thế bằng room_id hợp lệ
        'player_name': 'Test'
    })
    time.sleep(0.5)

def disconnect():
    """Disconnect from server"""
    print('\n--- Disconnecting ---')
    sio.disconnect()
    time.sleep(0.5)

def print_summary():
    """Print test summary"""
    print('\n' + '='*50)
    print('TEST SUMMARY')
    print('='*50)
    print(f"Total Tests: {test_results['total']}")
    print(f"Passed: {test_results['passed']}")
    print(f"Failed: {test_results['failed']}")
    
    if test_results['total'] > 0:
        success_rate = (test_results['passed'] / test_results['total']) * 100
        print(f"Success Rate: {success_rate:.1f}%")
    
    print('='*50 + '\n')

def main():
    """Main test runner"""
    print('\n' + '='*50)
    print('BACKEND MANUAL TESTING')
    print('='*50)
    print('Make sure backend is running on http://localhost:5000')
    print('='*50)
    
    try:
        if not test_connection():
            return
        
        if not test_create_room():
            return
        
        test_join_room()
        test_drawing_events()
        test_drawing_tools()
        test_canvas_clear()
        test_chat()
        test_leave_room()
        test_invalid_room()
        
    except KeyboardInterrupt:
        print('\n\nTest interrupted by user')
    except Exception as e:
        print(f'\nUnexpected error: {e}')
    finally:
        disconnect()
        print_summary()

if __name__ == '__main__':
    main()

