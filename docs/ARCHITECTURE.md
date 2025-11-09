# Kiến trúc Hệ thống

## Tổng quan

Hệ thống "Vẽ và Đoán" được xây dựng theo mô hình Client-Server với giao tiếp real-time qua WebSocket.

## Kiến trúc Tổng thể

```
┌─────────────┐         WebSocket          ┌─────────────┐
│   Client    │ ◄─────────────────────────► │   Server    │
│  (Browser)  │      (Socket.IO Protocol)   │  (Flask)    │
└─────────────┘                              └─────────────┘
      │                                              │
      │                                              │
      ▼                                              ▼
┌─────────────┐                              ┌─────────────┐
│   Canvas    │                              │ Game State  │
│   Drawing   │                              │ Management  │
└─────────────┘                              └─────────────┘
```

## Backend Architecture

### Components

1. **Flask Application (`app.py`)**
   - Entry point của server
   - Khởi tạo Flask app và SocketIO
   - Đăng ký các route và socket event handlers

2. **Models (`models/`)**
   - `room.py`: Quản lý phòng chơi và danh sách người chơi
   - `player.py`: Thông tin người chơi (ID, name, score)
   - `game.py`: Game state machine và logic vòng chơi

3. **Handlers (`handlers/`)**
   - `room_handler.py`: Xử lý tạo/tham gia/rời phòng
   - `game_handler.py`: Xử lý logic game (rounds, scoring, timer)
   - `socket_handler.py`: Đăng ký và routing socket events

4. **Utils (`utils/`)**
   - `word_list.py`: Quản lý danh sách từ khóa
   - `validators.py`: Validate và sanitize input

5. **Config (`config/`)**
   - `constants.py`: Các hằng số game (timer, scoring, etc.)

### Data Flow - Backend

```
Socket Event → Handler → Model Update → Broadcast to Room
```

## Frontend Architecture

### Components

1. **Socket Client (`js/socket/socketClient.js`)**
   - Wrapper cho Socket.IO client
   - Quản lý connection và event handling

2. **Canvas Components (`js/canvas/`)**
   - `drawerCanvas.js`: Logic vẽ cho người vẽ
   - `viewerCanvas.js`: Logic hiển thị cho người xem

3. **UI Components (`js/ui/`)**
   - `roomUI.js`: Quản lý UI phòng chơi
   - `gameUI.js`: Quản lý UI trạng thái game
   - `scoreboard.js`: Hiển thị bảng điểm
   - `chat.js`: Hệ thống chat và đoán
   - `notifications.js`: Thông báo

4. **Utils (`js/utils/helpers.js`)**
   - Các hàm utility (sanitize, format, etc.)

### Data Flow - Frontend

```
User Action → UI Component → Socket Emit → Server
                                 ↓
Server Event ← Socket Listen ← UI Update ← Canvas Update
```

## Game State Machine

```
WAITING → PLAYING → ROUND_ENDED → PLAYING (next round) → GAME_ENDED
   ↑                                                           │
   └───────────────────────────────────────────────────────────┘
```

### States

1. **WAITING**: Đang chờ đủ người chơi
2. **PLAYING**: Đang trong vòng chơi
3. **ROUND_ENDED**: Vòng chơi kết thúc (hiển thị điểm)
4. **GAME_ENDED**: Trò chơi kết thúc

## Room Management

### Room Structure

```python
Room {
    id: string (6 characters)
    players: [Player]
    game_state: string
    current_round: Round
    created_at: timestamp
}
```

### Player Structure

```python
Player {
    id: string (socket_id)
    name: string
    score: number
    is_drawer: boolean
    room_id: string
}
```

## Drawing Synchronization

### Flow

1. **Drawer** vẽ trên canvas → Capture mouse/touch events
2. Emit `drawing_start`, `drawing_move`, `drawing_end` events
3. **Server** nhận events và broadcast đến tất cả players khác trong room
4. **Viewers** nhận `canvas_update` events và render lên canvas của họ

### Optimization

- Throttle `drawing_move` events để giảm network traffic
- Batch multiple move events nếu cần
- Compress drawing data nếu payload lớn

## Scoring System

### Rules

1. **Correct Guess**: +100 điểm cho người đoán đúng
2. **Drawer Bonus**: +50 điểm cho người vẽ khi có người đoán đúng
3. **Time Bonus**: Có thể thêm điểm thưởng dựa trên thời gian còn lại

### Score Calculation

```
Player Score = Base Score + Round Bonuses
```

## Security Considerations

1. **Input Sanitization**
   - Tất cả user input phải được sanitize để tránh XSS
   - Validate room IDs và player names

2. **Rate Limiting**
   - Giới hạn số lượng events từ mỗi client
   - Prevent spam trong chat

3. **Room Access Control**
   - Validate room ID trước khi join
   - Prevent unauthorized access

## Scalability

### Current Limitations

- In-memory storage (rooms và players)
- Single server instance
- No persistence layer

### Future Improvements

1. **Database Integration**
   - Lưu trữ rooms và game history
   - User accounts và statistics

2. **Redis for State Management**
   - Shared state giữa multiple server instances
   - Pub/Sub cho real-time updates

3. **Load Balancing**
   - Multiple server instances
   - Sticky sessions cho Socket.IO

4. **Caching**
   - Cache word lists
   - Cache player statistics

## Performance Optimization

1. **Frontend**
   - Debounce/throttle drawing events
   - Lazy load components
   - Minimize DOM manipulations

2. **Backend**
   - Efficient room lookup (hash map)
   - Batch broadcasts khi có thể
   - Connection pooling

3. **Network**
   - Compress payload nếu lớn
   - Use binary protocol nếu cần
   - Optimize Socket.IO transport

## Error Handling

### Client-side

- Retry connection nếu disconnect
- Show user-friendly error messages
- Graceful degradation

### Server-side

- Validate all inputs
- Handle disconnections gracefully
- Log errors for debugging
- Return meaningful error messages

## Testing Strategy

1. **Unit Tests**
   - Test models và handlers riêng lẻ
   - Test utility functions

2. **Integration Tests**
   - Test socket events end-to-end
   - Test game flow

3. **Manual Testing**
   - Test với multiple clients
   - Test edge cases (disconnect, etc.)

