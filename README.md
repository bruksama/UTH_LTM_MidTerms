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
- **eventlet** - Async networking library

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

### Thành viên 2: Backend Logic - Game State & Rooms

- [ ] Implement `models/room.py` - Room management
- [ ] Implement `models/player.py` - Player model
- [ ] Implement `models/game.py` - Game state machine
- [ ] Implement `handlers/room_handler.py` - Room logic
- [ ] Implement `handlers/game_handler.py` - Game logic (rounds, scoring, timer)
- [ ] Implement word selection từ `wordlist.json`
- [ ] Implement guess checking logic

### Thành viên 3: Frontend Lead & Canvas (Drawer)

- ✅ Hoàn thiện `js/canvas/drawerCanvas.js` - Drawing logic
- ✅ Implement drawing tools UI (color picker, brush size)
- [ ] Optimize drawing event emission (throttle/debounce)
- [ ] Handle touch events cho mobile devices

### Thành viên 4: Frontend - Socket Synchronization & UI

- ✅ Hoàn thiện `js/canvas/viewerCanvas.js` - Canvas sync
- ✅ Implement scoreboard updates real-time
- ✅ Implement timer display và countdown
- [ ] Implement word display cho drawer
- [ ] Handle game state transitions UI

### Thành viên 5: Frontend - Chat/Guessing Module & UX

- [ ] Hoàn thiện chat system với message history
- [ ] Implement guess validation và highlighting
- [ ] Implement notification system (join/leave, correct guess, etc.)
- [ ] Responsive design và CSS improvements
- [ ] UX enhancements và animations

## Tính năng chính

### Đã hoàn thành (Skeleton)

- ✅ Cấu trúc dự án và thư mục
- ✅ Flask-SocketIO server setup
- ✅ Frontend HTML/CSS/JS skeleton
- ✅ Socket client connection
- ✅ Basic Socket API events
- ✅ Canvas drawing structure
- ✅ UI components structure

### Cần hoàn thiện

- [ ] Room management logic đầy đủ
- [ ] Game state machine và round management
- [ ] Timer system
- [ ] Scoring system
- [ ] Word selection và guess checking
- [ ] Canvas synchronization hoàn chỉnh
- [ ] Chat system với guess detection
- [ ] Notification system
- [ ] Error handling và edge cases

## API Documentation

Xem chi tiết tại [`docs/API.md`](docs/API.md)

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
