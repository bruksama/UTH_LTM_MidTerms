# Backend - Draw & Guess Server

## Cấu trúc

```
backend/
├── src/
│   ├── app.py              # Flask app và Socket.IO server (Entry point)
│   ├── config/
│   │   └── constants.py    # Game constants
│   ├── models/             # Data models (TODO: Thành viên 2)
│   │   ├── room.py
│   │   ├── player.py
│   │   └── game.py
│   ├── handlers/           # Event handlers (TODO: Thành viên 2)
│   │   ├── room_handler.py
│   │   └── game_handler.py
│   ├── utils/              # Utility functions
│   │   ├── word_list.py
│   │   └── validators.py
│   └── data/
│       └── wordlist.json   # Danh sách từ khóa
├── requirements.txt        # Python dependencies
└── .env.example           # Environment variables template
```

## Setup

1. **Tạo virtual environment:**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# hoặc
source venv/bin/activate  # Linux/Mac
```

2. **Cài đặt dependencies:**
```bash
pip install -r requirements.txt
```

3. **Cấu hình environment:**
```bash
cp .env.example .env
# Chỉnh sửa .env nếu cần
```

4. **Chạy server:**
```bash
python src/app.py
```

## Nhiệm vụ cho Thành viên 2

### Models (models/)
- [ ] Implement `Room` class với các methods:
  - `add_player(player)`
  - `remove_player(player_id)`
  - `can_start_game()`
  - `get_player_count()`

- [ ] Implement `Player` class với các methods:
  - `add_score(points)`
  - `set_drawer(is_drawer)`
  - `to_dict()`

- [ ] Implement `Game` class với game state machine:
  - `start_game(players)`
  - `start_round(players, word_list)`
  - `end_round()`
  - `select_drawer(players)`
  - `select_word(word_list)`
  - `check_guess(guess, word)`
  - `calculate_scores()`

### Handlers (handlers/)
- [ ] Implement `room_handler.py`:
  - Room creation logic
  - Join/leave room logic
  - Room retrieval

- [ ] Implement `game_handler.py`:
  - Game start logic
  - Round management
  - Timer management
  - Guess checking
  - Score calculation

### Utils (utils/)
- [ ] Hoàn thiện `word_list.py`:
  - Load word list từ JSON
  - Random word selection

- [ ] Hoàn thiện `validators.py`:
  - Input sanitization
  - Room ID validation
  - Player name validation

## Tích hợp với app.py

Sau khi implement các models và handlers, cần tích hợp vào `app.py`:

1. Import các models và handlers
2. Thay thế in-memory storage (`rooms`, `players`) bằng các models
3. Sử dụng handlers trong các socket event handlers
4. Implement timer system cho rounds
5. Implement guess checking logic

## Testing

Test các chức năng:
- Tạo và join room
- Game start khi đủ người chơi
- Round start với drawer selection
- Word selection và display
- Guess checking
- Score calculation
- Timer countdown
- Round end và next round

## Lưu ý

- Tất cả user input phải được sanitize qua `validators.sanitize_string()`
- Room IDs phải được validate qua `validators.validate_room_id()`
- Player names phải được validate qua `validators.validate_player_name()`
- Sử dụng constants từ `config/constants.py` thay vì hardcode values

