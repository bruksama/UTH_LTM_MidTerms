# Hướng dẫn Setup Dự án

## Yêu cầu Hệ thống

### Backend
- Python 3.8 hoặc cao hơn
- pip (Python package manager)
- Git (để clone repository)

### Frontend
- Trình duyệt web hiện đại:
  - Google Chrome (khuyến nghị)
  - Mozilla Firefox
  - Safari
  - Microsoft Edge

## Cài đặt Backend

### Bước 1: Clone Repository

```bash
git clone <repository-url>
cd UTH_LTM_MidTerms
```

### Bước 2: Tạo Virtual Environment

**Windows:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### Bước 3: Cài đặt Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Bước 4: Cấu hình Environment Variables

```bash
# Copy file .env.example
cp .env.example .env

# Chỉnh sửa .env (tùy chọn)
# PORT=5000
# FLASK_ENV=development
# SECRET_KEY=your-secret-key-change-in-production
```

### Bước 5: Chạy Server

```bash
python src/app.py
```

Server sẽ chạy tại `http://localhost:5000`

**Kiểm tra:** Mở trình duyệt và truy cập `http://localhost:5000` (sẽ hiển thị lỗi 404 hoặc trang chủ nếu đã setup route)

## Cài đặt Frontend

### Option 1: Mở trực tiếp trong trình duyệt

1. Mở file `frontend/index.html` trong trình duyệt
2. **Lưu ý:** Có thể gặp lỗi CORS khi load Socket.IO từ CDN

### Option 2: Sử dụng HTTP Server (Khuyến nghị)

**Sử dụng Python:**

```bash
cd frontend
python -m http.server 8000
```

**Sử dụng Node.js http-server:**

```bash
npm install -g http-server
cd frontend
http-server -p 8000
```

**Sử dụng PHP:**

```bash
cd frontend
php -S localhost:8000
```

### Option 3: Sử dụng Flask để serve static files

Backend đã có route để serve frontend (nếu cần), chỉ cần đặt frontend files trong thư mục `static` và `templates`.

## Cấu hình CORS

Nếu frontend và backend chạy trên các port khác nhau, đảm bảo CORS đã được enable trong `backend/src/app.py`:

```python
CORS(app, resources={r"/*": {"origins": "*"}})
```

## Kiểm tra Kết nối

1. Mở Developer Console trong trình duyệt (F12)
2. Kiểm tra không có lỗi JavaScript
3. Kiểm tra Socket.IO đã kết nối thành công
4. Thử tạo phòng và tham gia phòng

## Troubleshooting

### Lỗi: "Module not found"

**Giải pháp:**
```bash
# Đảm bảo virtual environment đã được activate
# Kiểm tra lại việc cài đặt dependencies
pip install -r requirements.txt
```

### Lỗi: "Port already in use"

**Giải pháp:**
- Thay đổi port trong `.env` file
- Hoặc kill process đang sử dụng port đó:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:5000 | xargs kill
  ```

### Lỗi: "Socket.IO connection failed"

**Giải pháp:**
1. Kiểm tra backend đang chạy
2. Kiểm tra URL trong `frontend/js/socket/socketClient.js`
3. Kiểm tra CORS settings
4. Kiểm tra firewall không chặn port

### Lỗi: "Canvas không hoạt động"

**Giải pháp:**
1. Kiểm tra console có lỗi JavaScript không
2. Kiểm tra canvas element có tồn tại trong DOM
3. Kiểm tra các file JS đã được load đúng thứ tự

## Development Tips

### Hot Reload

Để tự động reload khi code thay đổi:

**Backend (sử dụng Flask debug mode):**
- Đã enable trong `app.py` với `debug=True`

**Frontend:**
- Sử dụng Live Server extension trong VS Code
- Hoặc sử dụng `browser-sync`:
  ```bash
  npm install -g browser-sync
  browser-sync start --server frontend --files "frontend/**/*"
  ```

### Debugging

1. **Backend:** Sử dụng `print()` statements hoặc Python debugger
2. **Frontend:** Sử dụng `console.log()` và browser DevTools
3. **Socket Events:** Log tất cả events trong `socketClient.js`

## Next Steps

Sau khi setup thành công:

1. Đọc `docs/API.md` để hiểu Socket API
2. Đọc `docs/ARCHITECTURE.md` để hiểu kiến trúc hệ thống
3. Xem `README.md` để biết phân chia nhiệm vụ
4. Bắt đầu implement các tính năng theo phân công

## Liên hệ

Nếu gặp vấn đề trong quá trình setup, liên hệ Project Lead hoặc tạo issue trong repository.

