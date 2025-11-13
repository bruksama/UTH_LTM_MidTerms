# Web-Game "Vẽ và Đoán" (Draw & Guess)

Dự án Web-Game multiplayer real-time sử dụng WebSocket cho môn học Lập trình Mạng Socket.

## Tổng quan

Ứng dụng web cho phép người dùng tạo hoặc tham gia phòng chơi để chơi trò chơi "Vẽ và Đoán". Một người chơi sẽ vẽ một từ khóa bí mật, và những người chơi khác sẽ cố gắng đoán từ khóa đó qua chat. Các nét vẽ được đồng bộ hóa real-time đến tất cả người chơi.

## Công nghệ sử dụng

### Backend

- **Python 3.8+**
- **Flask** - Web framework
- **Flask-SocketIO** - WebSocket library (tương thích Socket.IO)
- **Flask-CORS** - Cross-origin resource sharing
- **python-dotenv** - Environment variables management
- **simple-websocket** - WebSocket support (threading mode)

### Frontend

- **HTML5 Canvas** - Drawing surface
- **Vanilla JavaScript** - Client-side logic
- **Socket.IO Client** - WebSocket client library
- **CSS3** - Styling

## Cấu trúc Dự án

```
UTH_LTM_MidTerms/
├── backend/                 # Server-side code
│   ├── src/
│   │   ├── app.py          # Flask app và Socket.IO server
│   │   ├── config/         # Configuration files
│   │   ├── models/         # Data models (Room, Player, Game)
│   │   ├── handlers/       # Event handlers
│   │   ├── utils/          # Utility functions
│   │   └── data/           # Data files (wordlist.json)
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
│
├── frontend/               # Client-side code
│   ├── index.html         # Main HTML file
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript modules
│   └── assets/            # Static assets
│
└── docs/                   # Documentation
    ├── API.md             # Socket API documentation
    ├── ARCHITECTURE.md    # Architecture details
    └── SETUP.md           # Setup instructions
```

## Cài đặt và Chạy

### Yêu cầu hệ thống

- Python 3.8 hoặc cao hơn
- pip (Python package manager)
- Trình duyệt web hiện đại (Chrome, Firefox, Safari)

### Backend Setup

1. **Tạo virtual environment (khuyến nghị):**

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

2. **Cài đặt dependencies:**

```bash
pip install -r requirements.txt
```

3. **Cấu hình environment variables:**

```bash
# Copy file .env.example thành .env
cp .env.example .env

# Chỉnh sửa .env nếu cần
# PORT=5000
# FLASK_ENV=development
# SECRET_KEY=your-secret-key-here
```

4. **Chạy server:**

```bash
python src/app.py
```

Server sẽ chạy tại `http://localhost:5000` (hoặc port được cấu hình trong .env)

### Frontend Setup

1. **Mở file `frontend/index.html` trong trình duyệt**

Hoặc sử dụng một web server đơn giản:

```bash
# Sử dụng Python HTTP server
cd frontend
python -m http.server 8000

# Hoặc sử dụng Node.js http-server
npx http-server -p 8000
```

2. **Truy cập:** `http://localhost:8000`

**Lưu ý:** Đảm bảo backend đang chạy và cập nhật URL server trong `frontend/js/socket/socketClient.js` nếu cần.

## Phân chia Nhiệm vụ (Team Members)

### Thành viên 1: Project Lead & Backend Architect

- ✅ Thiết kế kiến trúc tổng thể
- ✅ Định nghĩa Socket API (xem `docs/API.md`)
- ✅ Thiết lập Flask-SocketIO server
- ✅ Quản lý Git và code integration
- ✅ Setup connection management và basic room operations

### Thành viên 2: Backend Logic - Game State & Rooms

- ⚠️ Basic room management (create, join, leave) - Implemented in app.py, needs refactoring
- [ ] Implement `models/room.py` - Proper Room model
- [ ] Implement `models/player.py` - Proper Player model
- [ ] Implement `models/game.py` - Game state machine
- [ ] Refactor `handlers/room_handler.py` - Move logic from app.py
- [ ] Implement `handlers/game_handler.py` - Game logic (rounds, scoring, timer)
- [ ] Implement word selection từ `wordlist.json`
- [ ] Implement guess checking logic
- [ ] Implement scoring system
- [ ] Implement timer system

### Thành viên 3: Frontend Lead & Canvas (Drawer)

- ✅ Hoàn thiện `js/canvas/drawerCanvas.js` - Drawing logic
- ✅ Implement drawing tools UI (color picker, brush size)
- ✅ Optimize drawing event emission (throttle/debounce)
- ✅ Handle touch events cho mobile devices
- ✅ Enable/disable canvas based on drawer role

### Thành viên 4: Frontend - Socket Synchronization & UI

- ✅ Hoàn thiện `js/canvas/viewerCanvas.js` - Canvas sync với event queue
- ✅ Implement scoreboard updates real-time
- ✅ Implement timer display và countdown
- ✅ Implement word display cho drawer
- ✅ Handle game state transitions UI
- ✅ Room UI (create/join functionality)
- ✅ Player list display

### Thành viên 5: Frontend - Chat/Guessing Module & UX

- ✅ Hoàn thiện chat system với message history
- ✅ Implement notification system (toast notifications)
- ✅ Handle player join/leave events
- ⚠️ Guess validation - UI ready, waiting for backend logic
- [ ] Responsive design và CSS improvements
- [ ] UX enhancements và animations
- [ ] Mobile optimization

## Tính năng chính

### ✅ Đã hoàn thành (~60% tổng thể)

#### Backend (40% complete)
- ✅ Flask-SocketIO server với threading mode
- ✅ Socket connection management (connect/disconnect)
- ✅ Basic room operations (create, join, leave)
- ✅ Drawing events broadcast (start, move, end, color, brush size, clear)
- ✅ Chat message broadcast
- ✅ Player list synchronization
- ✅ CORS configuration
- ✅ Environment configuration

#### Frontend (95% complete)
- ✅ Socket.IO client connection với auto-reconnect
- ✅ Room creation và join UI
- ✅ Canvas drawing system (DrawerCanvas)
  - Drawing tools với throttle optimization
  - Color picker (8 colors)
  - Brush size control (3-20px)
  - Clear canvas
  - Touch support cho mobile
- ✅ Canvas viewing system (ViewerCanvas)
  - Real-time drawing synchronization
  - Event queue với batching
  - Smooth rendering
- ✅ Chat system đầy đủ
  - Send/receive messages
  - Chat history
  - System messages
  - Timestamp display
- ✅ Scoreboard component
  - Player ranking
  - Score display
  - Drawer indicator
  - Animated score updates
- ✅ Notification system (toast)
- ✅ Game UI state management
- ✅ Utility functions (sanitize, throttle, debounce)
- ✅ Complete HTML/CSS structure

### ⚠️ Đang phát triển

- ⚠️ Room management refactoring (cần move logic vào handlers)
- ⚠️ Data models (Room, Player, Game) - defined nhưng chưa được sử dụng

### ❌ Cần hoàn thiện (Game Logic - 0% complete)

Các tính năng này đã có UI frontend ready, chỉ cần backend implement:

- [ ] **Start game logic** - Khởi tạo game session
- [ ] **Round management** - Bắt đầu/kết thúc vòng chơi
- [ ] **Drawer selection** - Chọn người vẽ mỗi round
- [ ] **Word selection** - Chọn từ khóa từ wordlist.json
- [ ] **Timer system** - Countdown timer cho mỗi round
- [ ] **Guess checking** - So sánh đoán với từ khóa
- [ ] **Scoring system** - Tính điểm cho người đoán và người vẽ
- [ ] **Round results** - Hiển thị kết quả sau mỗi round
- [ ] **Game end condition** - Kết thúc game sau N rounds
- [ ] **Word hints** - Hiển thị gợi ý (số chữ cái)

**Ghi chú:** Frontend đã implement UI và event handlers cho tất cả tính năng trên. Khi backend emit các events tương ứng (`game_started`, `round_started`, `correct_guess`, `round_ended`, etc.), frontend sẽ hoạt động ngay lập tức.

## Tình trạng API Implementation

### Socket Events đã hoạt động

**Client → Server:**
- ✅ `create_room` - Tạo phòng mới
- ✅ `join_room` - Tham gia phòng
- ✅ `leave_room` - Rời phòng
- ✅ `drawing_start` - Bắt đầu vẽ
- ✅ `drawing_move` - Di chuyển khi vẽ
- ✅ `drawing_end` - Kết thúc vẽ
- ✅ `change_color` - Đổi màu
- ✅ `change_brush_size` - Đổi cỡ bút
- ✅ `clear_canvas` - Xóa canvas
- ✅ `send_message` - Gửi tin nhắn chat

**Server → Client:**
- ✅ `connected` - Xác nhận kết nối
- ✅ `room_created` - Phòng đã tạo
- ✅ `room_joined` - Đã join phòng
- ✅ `player_joined` - Người chơi mới join
- ✅ `player_left` - Người chơi rời đi
- ✅ `canvas_update` - Cập nhật vẽ
- ✅ `chat_message` - Tin nhắn chat
- ✅ `error` - Thông báo lỗi

### Socket Events chờ backend implement

Frontend đã sẵn sàng nhận các events sau:
- ⏳ `game_started` - Game bắt đầu
- ⏳ `round_started` - Round mới bắt đầu (với word cho drawer)
- ⏳ `round_ended` - Round kết thúc (với scores)
- ⏳ `game_ended` - Game kết thúc
- ⏳ `timer_update` - Cập nhật thời gian còn lại
- ⏳ `correct_guess` - Ai đó đoán đúng
- ⏳ `scores_updated` - Cập nhật điểm số
- ⏳ `drawer_changed` - Người vẽ thay đổi

Xem chi tiết đầy đủ tại [`docs/API.md`](docs/API.md)

## Cấu hình Game

Các hằng số game có thể được chỉnh sửa trong `backend/src/config/constants.py`:

- `ROUND_TIMER_SECONDS`: Thời gian mỗi vòng (mặc định: 90 giây)
- `MIN_PLAYERS_TO_START`: Số người chơi tối thiểu để bắt đầu (mặc định: 2)
- `SCORE_CORRECT_GUESS`: Điểm khi đoán đúng (mặc định: 100)
- `SCORE_DRAWER_WHEN_GUESSED`: Điểm cho người vẽ khi có người đoán đúng (mặc định: 50)

## Phát triển

### Git Workflow

1. **Main branch:** Code production-ready
2. **Develop branch:** Integration branch cho các tính năng
3. **Feature branches:** `feature/[feature-name]` cho từng tính năng mới

### Commit Convention

- `feat:` Thêm tính năng mới
- `fix:` Sửa lỗi
- `docs:` Cập nhật tài liệu
- `style:` Formatting, không ảnh hưởng logic
- `refactor:` Refactor code
- `test:` Thêm/sửa tests

## Troubleshooting

### Backend không khởi động

- Kiểm tra Python version: `python --version` (cần >= 3.8)
- Kiểm tra virtual environment đã được activate
- Kiểm tra dependencies đã được cài đặt: `pip list`
- Kiểm tra port 5000 có đang được sử dụng không

### Frontend không kết nối được với backend

- Kiểm tra backend đang chạy tại đúng port
- Kiểm tra CORS settings trong `backend/src/app.py`
- Kiểm tra URL trong `frontend/js/socket/socketClient.js`
- Mở Developer Console để xem lỗi

### Canvas không hiển thị

- Kiểm tra canvas element trong HTML
- Kiểm tra JavaScript console cho lỗi
- Đảm bảo các file JS đã được load đúng thứ tự

## License

Dự án này được tạo cho mục đích giáo dục trong môn học Lập trình Mạng Socket.

## Liên hệ

Nếu có câu hỏi hoặc vấn đề, vui lòng liên hệ Project Lead hoặc tạo issue trong repository.
