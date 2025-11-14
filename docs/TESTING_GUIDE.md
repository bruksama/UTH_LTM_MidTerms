# Hướng dẫn Testing Backend

## Cấu trúc Tests

Đã tạo thư mục `tests/` với các file:

```
backend/tests/
├── __init__.py          # Package marker
├── conftest.py         # Pytest config (auto reset storage)
├── test_models.py      # Tests cho Player & Room models
├── test_storage.py     # Tests cho data store
├── test_handlers.py    # Tests cho room/drawing/chat handlers
├── test_manual.py      # Script test thủ công
└── README.md          # Hướng dẫn chi tiết
```

## Quick Start

### Bước 1: Setup Virtual Environment (venv)

**Tại sao cần venv?**
- Tránh xung đột dependencies giữa các projects
- Môi trường test sạch và isolated
- Best practice cho Python development

```bash
# Tạo venv (chỉ làm 1 lần)
cd backend
python -m venv venv

# Kích hoạt venv
# Windows (PowerShell)
venv\Scripts\Activate.ps1

# Windows (CMD)
venv\Scripts\activate.bat

# Linux/Mac
source venv/bin/activate

# Verify venv đang active (prompt sẽ có (venv) prefix)
# (venv) D:\...\backend>
```

### Bước 2: Cài đặt Dependencies

```bash
# Đảm bảo venv đã được activate (có (venv) prefix)
pip install -r requirements.txt
```

Điều này sẽ cài:
- `pytest` - Testing framework
- `pytest-cov` - Coverage reports
- `python-socketio[client]` - Socket.IO client cho manual tests

### Bước 3: Chạy Unit Tests

```bash
# Đảm bảo venv đã active và đang ở thư mục backend
# (venv) backend>

# Chạy tất cả tests
pytest

# Với output chi tiết
pytest -v

# Với coverage report
pytest --cov=src --cov-report=html
```

### Bước 4: Xem Coverage Report

Sau khi chạy với `--cov-report=html`:
```bash
# Mở file HTML trong browser
# Windows
start htmlcov/index.html

# Linux/Mac
open htmlcov/index.html
```

### Bước 5: Manual Testing

**Yêu cầu:** Backend phải đang chạy

```bash
# Terminal 1: Start backend
cd backend
venv\Scripts\Activate.ps1  # Activate venv
python src/app.py

# Terminal 2: Run manual test
cd backend
venv\Scripts\Activate.ps1  # Activate venv
python -m tests.test_manual
```

---

## Test Coverage

### Test Models (test_models.py)

Player Model:
- [PASS] Player creation với đầy đủ attributes
- [PASS] Add score (positive, negative)
- [PASS] Set drawer status
- [PASS] Convert to dictionary

Room Model:
- [PASS] Room creation
- [PASS] Add players (single, multiple, duplicates)
- [PASS] Remove players (existing, non-existing)
- [PASS] Get player count
- [PASS] Check can start game
- [PASS] Convert to dictionary

### Test Storage (test_storage.py)

Room Operations:
- [PASS] Add và get room
- [PASS] Remove room
- [PASS] Get all rooms
- [PASS] Handle non-existent rooms

Player Operations:
- [PASS] Add và get player
- [PASS] Remove player
- [PASS] Get all players
- [PASS] Get players in specific room
- [PASS] Storage isolation (rooms vs players)

### Test Handlers (test_handlers.py)

Room Handler:
- [PASS] Create room (unique 6-char IDs)
- [PASS] Add player to room
- [PASS] Add multiple players
- [PASS] Handle invalid room
- [PASS] Remove player from room
- [PASS] Room cleanup when empty
- [PASS] Get room players

Drawing Handler:
- [PASS] Broadcast drawing start
- [PASS] Broadcast drawing move
- [PASS] Broadcast drawing end
- [PASS] Broadcast color change
- [PASS] Broadcast brush size change
- [PASS] Broadcast canvas clear
- [PASS] Handle invalid player

Chat Handler:
- [PASS] Process message
- [PASS] Message sanitization (whitespace)
- [PASS] Empty message handling
- [PASS] Invalid player handling

---

## Chạy Tests Cụ thể

```bash
# Chỉ test models
pytest tests/test_models.py

# Chỉ test storage
pytest tests/test_storage.py

# Chỉ test handlers
pytest tests/test_handlers.py

# Test một class cụ thể
pytest tests/test_models.py::TestPlayer

# Test một function cụ thể
pytest tests/test_models.py::TestPlayer::test_player_creation

# Dừng khi gặp lỗi đầu tiên
pytest -x

# Show print statements
pytest -s

# Chạy parallel (nếu có pytest-xdist)
pytest -n auto
```

---

## Kết quả Mong đợi

Khi chạy `pytest`, bạn sẽ thấy:

```
======================== test session starts ========================
platform win32 -- Python 3.x.x, pytest-7.4.3
collected 50+ items

tests/test_models.py ................                          [ 32%]
tests/test_storage.py ...............                          [ 62%]
tests/test_handlers.py .......................                 [100%]

======================== 50+ passed in 0.5s ========================
```

---

## Manual Testing Output

Khi chạy `python -m tests.test_manual`:

```
==================================================
BACKEND MANUAL TESTING
==================================================
Make sure backend is running on http://localhost:5000
==================================================

--- Test 1: Connection ---
PASS: Connected - {'message': 'Connected to server'}

--- Test 2: Create Room ---
PASS: Room created - Room ID: ABC123

--- Test 3: Join Room ---
PASS: Room joined - Players: 1

--- Test 4: Drawing Events ---
PASS: Canvas update - start
PASS: Canvas update - move
PASS: Canvas update - end

--- Test 5: Drawing Tools ---
PASS: Canvas update - color
PASS: Canvas update - brush_size

--- Test 6: Canvas Clear ---
PASS: Canvas update - clear

--- Test 7: Chat Messages ---
PASS: Chat message - Test Player: Hello!

--- Test 8: Leave Room ---
PASS: Player left - Test Player

==================================================
TEST SUMMARY
==================================================
Total Tests: 15
Passed: 15
Failed: 0
Success Rate: 100.0%
==================================================
```

---

## Troubleshooting

### Lỗi: venv chưa được activate

```bash
# Kiểm tra xem venv có đang active không
# Prompt sẽ có (venv) prefix nếu active: (venv) backend>

# Nếu chưa active, activate venv:
# Windows PowerShell
venv\Scripts\Activate.ps1

# Windows CMD
venv\Scripts\activate.bat

# Linux/Mac
source venv/bin/activate
```

### Lỗi: ModuleNotFoundError

```bash
# Activate venv trước
venv\Scripts\Activate.ps1

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy tests
pytest
```

### Lỗi: Connection refused (Manual Test)

```bash
# Đảm bảo backend đang chạy
cd backend
python src/app.py

# Trong terminal khác
python -m tests.test_manual
```

### Tests không pass

```bash
# Chạy với output chi tiết
pytest -v -s

# Xem error đầy đủ
pytest --tb=long
```

### Coverage thấp

```bash
# Xem chi tiết coverage
pytest --cov=src --cov-report=term-missing

# HTML report với highlighting
pytest --cov=src --cov-report=html
```

---

## Tiếp theo

### Thêm Tests Mới

Tạo file mới trong `tests/`:

```python
# tests/test_new_feature.py
import pytest

class TestNewFeature:
    """Test cases for new feature"""
    
    def test_something(self):
        # Arrange
        expected = True
        
        # Act
        result = some_function()
        
        # Assert
        assert result == expected
```

### Integration Tests

Để test toàn bộ flow end-to-end với Socket.IO:

```python
# tests/test_integration.py
import socketio
import pytest
import time

@pytest.fixture
def socket_client():
    sio = socketio.Client()
    sio.connect('http://localhost:5000')
    yield sio
    sio.disconnect()

def test_complete_flow(socket_client):
    # Test complete user journey
    pass
```

### Load Testing

Sử dụng Locust:

```bash
pip install locust
locust -f locustfile.py
```

---

## Testing Checklist

### Before Commit
- [ ] Activate venv: `venv\Scripts\Activate.ps1`
- [ ] `pytest` - All tests pass
- [ ] `pytest --cov=src` - Coverage > 80%
- [ ] `python -m tests.test_manual` - Manual tests pass
- [ ] No linter errors

### Before Deploy
- [ ] All unit tests pass
- [ ] Manual testing complete
- [ ] Load testing (if needed)
- [ ] Integration tests pass

### Thoát venv khi xong việc
```bash
deactivate
```

---

## Tài liệu Tham khảo

- [Pytest Documentation](https://docs.pytest.org/)
- [Coverage.py](https://coverage.readthedocs.io/)
- [Python Socket.IO Client](https://python-socketio.readthedocs.io/)

---

## Best Practices

1. **Always use venv** - Môi trường isolated, tránh xung đột
2. **Write tests first** (TDD) khi thêm features mới
3. **Keep tests fast** - Unit tests nên < 1s
4. **Test edge cases** - Empty data, invalid input, etc.
5. **Use fixtures** - Reuse setup code
6. **Clear test names** - Mô tả rõ ràng test gì
7. **One assertion per test** - Hoặc nhóm assertions liên quan
8. **Don't test framework** - Chỉ test code của bạn
9. **Mock external dependencies** - Database, APIs, etc.

---

Tổng kết:
- [DONE] 50+ unit tests
- [DONE] Coverage tools setup
- [DONE] Manual testing script
- [DONE] Documentation đầy đủ
- [DONE] Ready for CI/CD integration

Happy Testing!

