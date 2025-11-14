# Backend Tests

Thư mục này chứa các test cases cho backend API.

## Cấu trúc

```
tests/
├── __init__.py           # Package marker
├── conftest.py          # Pytest configuration và fixtures
├── test_models.py       # Unit tests cho Player và Room models
├── test_storage.py      # Unit tests cho data store
├── test_handlers.py     # Unit tests cho handlers
├── test_manual.py       # Manual testing script
└── README.md           # File này
```

## Cài đặt

Cài đặt dependencies cho testing:

```bash
cd backend
pip install -r requirements.txt
```

## Chạy Tests

### 1. Unit Tests với Pytest

**Chạy tất cả tests:**
```bash
cd backend
pytest
```

**Chạy với output chi tiết:**
```bash
pytest -v
```

**Chạy test cụ thể:**
```bash
pytest tests/test_models.py
pytest tests/test_storage.py
pytest tests/test_handlers.py
```

**Chạy một test case cụ thể:**
```bash
pytest tests/test_models.py::TestPlayer::test_player_creation
```

**Chạy với coverage report:**
```bash
pytest --cov=src --cov-report=html
# Mở file htmlcov/index.html để xem report
```

**Chạy và dừng khi gặp lỗi đầu tiên:**
```bash
pytest -x
```

**Chạy với output đầy đủ (show print statements):**
```bash
pytest -s
```

### 2. Manual Testing Script

**Yêu cầu:** Backend phải đang chạy trên http://localhost:5000

**Chạy script:**
```bash
# Terminal 1: Start backend
cd backend
python src/app.py

# Terminal 2: Run test script
cd backend
python -m tests.test_manual
```

Script sẽ test:
- ✅ Connection
- ✅ Create room
- ✅ Join room
- ✅ Drawing events
- ✅ Drawing tools
- ✅ Canvas clear
- ✅ Chat messages
- ✅ Leave room
- ✅ Invalid room handling

## Test Coverage

### Models (test_models.py)
- Player creation, score, drawer status, to_dict
- Room creation, add/remove players, can_start_game, to_dict

### Storage (test_storage.py)
- Room CRUD operations
- Player CRUD operations
- Get players in room
- Storage isolation

### Handlers (test_handlers.py)
- Room handler: create, join, leave, get players
- Drawing handler: all drawing events
- Chat handler: message processing

## Kết quả Mong đợi

Tất cả tests nên pass:

```
======================== test session starts ========================
collected 50+ items

tests/test_models.py ................                          [ 32%]
tests/test_storage.py ...............                          [ 62%]
tests/test_handlers.py .......................                 [100%]

======================== 50+ passed in 0.5s ========================
```

## Debugging

### Nếu tests fail:

1. **Import errors:**
   ```bash
   # Kiểm tra Python path
   cd backend
   python -c "import sys; print(sys.path)"
   ```

2. **Storage không reset:**
   - Kiểm tra `conftest.py` fixture
   - Đảm bảo `reset_storage` fixture được áp dụng

3. **Backend không chạy (cho manual tests):**
   ```bash
   # Test backend connection
   curl http://localhost:5000/
   ```

## Thêm Tests Mới

### Tạo test mới:

```python
# tests/test_new_feature.py
import pytest

class TestNewFeature:
    def test_something(self):
        # Arrange
        # Act  
        # Assert
        assert True
```

### Best Practices:

1. **Naming:** Test functions bắt đầu với `test_`
2. **Structure:** Use AAA pattern (Arrange, Act, Assert)
3. **Isolation:** Mỗi test độc lập, không phụ thuộc tests khác
4. **Clear:** Test names mô tả rõ ràng
5. **Fast:** Unit tests nên chạy nhanh (<1s)

## CI/CD Integration

Để chạy tests trong CI/CD:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: |
    cd backend
    pip install -r requirements.txt
    pytest --cov=src --cov-report=xml
```

## Liên hệ

Nếu có vấn đề với tests, liên hệ team lead hoặc tạo issue trong repository.

