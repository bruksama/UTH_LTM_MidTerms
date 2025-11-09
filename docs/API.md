# Socket API Documentation

Tài liệu này mô tả đầy đủ các sự kiện Socket.IO được sử dụng trong ứng dụng Web-Game "Vẽ và Đoán".

## Tổng quan

Ứng dụng sử dụng Flask-SocketIO (tương thích với Socket.IO protocol) để giao tiếp real-time giữa Client và Server.

## Client → Server Events

### `create_room`
Tạo một phòng chơi mới.

**Payload:**
```json
{
  "player_name": "string"  // Tên người chơi (tùy chọn)
}
```

**Response:** `room_created`

---

### `join_room`
Tham gia một phòng chơi hiện có.

**Payload:**
```json
{
  "room_id": "string",      // Mã phòng (6 ký tự)
  "player_name": "string"   // Tên người chơi
}
```

**Response:** `room_joined`

---

### `leave_room`
Rời khỏi phòng chơi hiện tại.

**Payload:** Không có

**Response:** Không có (server sẽ emit `player_left` cho các người chơi khác)

---

### `drawing_start`
Bắt đầu vẽ một nét vẽ mới.

**Payload:**
```json
{
  "x": number,  // Tọa độ X trên canvas
  "y": number   // Tọa độ Y trên canvas
}
```

**Response:** Server sẽ broadcast `canvas_update` với type `start` đến tất cả người chơi khác trong phòng.

---

### `drawing_move`
Di chuyển khi đang vẽ (nét vẽ đang được vẽ).

**Payload:**
```json
{
  "x": number,  // Tọa độ X mới
  "y": number   // Tọa độ Y mới
}
```

**Response:** Server sẽ broadcast `canvas_update` với type `move` đến tất cả người chơi khác trong phòng.

---

### `drawing_end`
Kết thúc nét vẽ hiện tại.

**Payload:** Không có

**Response:** Server sẽ broadcast `canvas_update` với type `end` đến tất cả người chơi khác trong phòng.

---

### `change_color`
Thay đổi màu sắc của nét vẽ.

**Payload:**
```json
{
  "color": "string"  // Mã màu hex (ví dụ: "#FF0000")
}
```

**Response:** Server sẽ broadcast `canvas_update` với type `color` đến tất cả người chơi khác trong phòng.

---

### `change_brush_size`
Thay đổi kích thước nét vẽ.

**Payload:**
```json
{
  "size": number  // Kích thước nét vẽ (3-20)
}
```

**Response:** Server sẽ broadcast `canvas_update` với type `brush_size` đến tất cả người chơi khác trong phòng.

---

### `clear_canvas`
Xóa toàn bộ nội dung trên canvas.

**Payload:** Không có

**Response:** Server sẽ broadcast `canvas_update` với type `clear` đến tất cả người chơi khác trong phòng.

---

### `send_message`
Gửi tin nhắn chat hoặc đoán từ khóa.

**Payload:**
```json
{
  "message": "string"  // Nội dung tin nhắn
}
```

**Response:** 
- Nếu là đoán đúng: `correct_guess`
- Nếu là tin nhắn thường: `chat_message`

---

## Server → Client Events

### `connected`
Xác nhận kết nối thành công với server.

**Payload:**
```json
{
  "message": "Connected to server"
}
```

---

### `room_created`
Phòng chơi đã được tạo thành công.

**Payload:**
```json
{
  "room_id": "string"  // Mã phòng được tạo
}
```

---

### `room_joined`
Đã tham gia phòng thành công.

**Payload:**
```json
{
  "room_id": "string",
  "players": [
    {
      "id": "string",      // Socket ID của người chơi
      "name": "string",    // Tên người chơi
      "score": number      // Điểm số hiện tại
    }
  ]
}
```

---

### `player_joined`
Một người chơi mới đã tham gia phòng.

**Payload:**
```json
{
  "player": {
    "id": "string",
    "name": "string",
    "score": number
  }
}
```

---

### `player_left`
Một người chơi đã rời phòng.

**Payload:**
```json
{
  "player_id": "string",
  "player_name": "string"
}
```

---

### `game_started`
Trò chơi đã bắt đầu.

**Payload:**
```json
{
  "room_id": "string",
  "round_number": number,
  "players": [
    {
      "id": "string",
      "name": "string",
      "score": number
    }
  ]
}
```

---

### `round_started`
Một vòng chơi mới đã bắt đầu.

**Payload:**
```json
{
  "round_number": number,
  "drawer_id": "string",
  "drawer_name": "string",
  "word": "string",        // Chỉ gửi cho người vẽ
  "is_drawer": boolean     // true nếu client này là người vẽ
}
```

**Lưu ý:** Trường `word` chỉ được gửi cho người chơi được chỉ định làm người vẽ.

---

### `canvas_update`
Cập nhật canvas từ người vẽ.

**Payload:**
```json
{
  "type": "string",  // "start" | "move" | "end" | "color" | "brush_size" | "clear"
  "x": number,       // Tọa độ X (cho type "start" và "move")
  "y": number,       // Tọa độ Y (cho type "start" và "move")
  "color": "string", // Mã màu (cho type "color")
  "size": number     // Kích thước nét (cho type "brush_size")
}
```

**Các loại type:**
- `start`: Bắt đầu nét vẽ mới (có x, y)
- `move`: Di chuyển khi vẽ (có x, y)
- `end`: Kết thúc nét vẽ
- `color`: Thay đổi màu (có color)
- `brush_size`: Thay đổi kích thước nét (có size)
- `clear`: Xóa toàn bộ canvas

---

### `chat_message`
Tin nhắn chat mới từ một người chơi.

**Payload:**
```json
{
  "player_name": "string",
  "message": "string",
  "is_guess": boolean  // true nếu đây là một lần đoán (sai)
}
```

---

### `correct_guess`
Một người chơi đã đoán đúng từ khóa.

**Payload:**
```json
{
  "player_name": "string",
  "word": "string",      // Từ khóa đã được đoán đúng
  "score": number        // Điểm được cộng
}
```

Sau khi emit event này, server sẽ emit `round_ended`.

---

### `round_ended`
Vòng chơi đã kết thúc.

**Payload:**
```json
{
  "word": "string",      // Từ khóa được tiết lộ
  "scores": [
    {
      "player_id": "string",
      "player_name": "string",
      "score": number,
      "points_earned": number  // Điểm kiếm được trong vòng này
    }
  ]
}
```

---

### `game_state_update`
Cập nhật trạng thái game tổng thể.

**Payload:**
```json
{
  "state": "string",  // "waiting" | "playing" | "round_ended" | "game_ended"
  "data": {}          // Dữ liệu bổ sung tùy thuộc vào state
}
```

---

### `timer_update`
Cập nhật thời gian còn lại của vòng chơi.

**Payload:**
```json
{
  "seconds": number  // Số giây còn lại
}
```

---

### `error`
Lỗi từ server.

**Payload:**
```json
{
  "message": "string"  // Thông báo lỗi
}
```

---

## Ví dụ sử dụng

### Tạo phòng và tham gia

```javascript
// Tạo phòng
socket.emit('create_room', { player_name: 'Người chơi 1' });

// Lắng nghe phản hồi
socket.on('room_created', (data) => {
  console.log('Room ID:', data.room_id);
  // Tự động join phòng vừa tạo
  socket.emit('join_room', {
    room_id: data.room_id,
    player_name: 'Người chơi 1'
  });
});
```

### Vẽ trên canvas

```javascript
// Bắt đầu vẽ
socket.emit('drawing_start', { x: 100, y: 100 });

// Di chuyển khi vẽ
socket.emit('drawing_move', { x: 150, y: 120 });

// Kết thúc vẽ
socket.emit('drawing_end', {});

// Thay đổi màu
socket.emit('change_color', { color: '#FF0000' });

// Xóa canvas
socket.emit('clear_canvas', {});
```

### Gửi tin nhắn và đoán

```javascript
// Gửi tin nhắn
socket.emit('send_message', { message: 'Xin chào!' });

// Đoán từ khóa
socket.emit('send_message', { message: 'con mèo' });
```

### Nhận cập nhật canvas

```javascript
socket.on('canvas_update', (data) => {
  switch(data.type) {
    case 'start':
      // Bắt đầu vẽ tại (data.x, data.y)
      break;
    case 'move':
      // Vẽ đến (data.x, data.y)
      break;
    case 'end':
      // Kết thúc nét vẽ
      break;
    case 'color':
      // Thay đổi màu thành data.color
      break;
    case 'brush_size':
      // Thay đổi kích thước thành data.size
      break;
    case 'clear':
      // Xóa toàn bộ canvas
      break;
  }
});
```

---

## Lưu ý

1. Tất cả các payload phải được sanitize để tránh XSS attacks.
2. Server sẽ tự động validate các giá trị đầu vào.
3. Các event liên quan đến canvas chỉ được xử lý khi người chơi là người vẽ.
4. Từ khóa chỉ được gửi cho người vẽ trong event `round_started`.
5. Server sẽ tự động quản lý timer và emit `timer_update` mỗi giây.

