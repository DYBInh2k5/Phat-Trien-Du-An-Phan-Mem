# Báo cáo: Triển khai Phân quyền Phạm vi Dữ liệu cho GVCN

**Ngày thực hiện:** 2025  
**Phạm vi:** Backend Node.js/Express — Dự án HTQLLH  

---

## 1. Nguyên nhân gốc rễ của lỗ hổng bảo mật

### Vấn đề schema (gvcn_name string vs FK)

Bảng `school_classes` chỉ lưu tên GVCN dưới dạng chuỗi thuần (`gvcn_name VARCHAR(100)`), không liên kết trực tiếp với bảng `users`. Điều này dẫn đến:

- Middleware `resolveGvcnClass` cũ phải tra cứu bằng `user.full_name` → `ClassRepository.findByGvcnName(full_name)`.
- Dữ liệu trong `users.full_name` = `'Lê Minh Châu (GVCN 10A1)'`, trong khi `school_classes.gvcn_name` = `'Lê Minh Châu'` — không khớp chính xác.
- Nếu không tìm được lớp, middleware cũ trả về `req.gvcnClassName = null`, tương đương "không hạn chế" — **cực kỳ nguy hiểm**: GVCN chưa phân công sẽ được xem toàn bộ học sinh.
- Phụ thuộc vào `full_name` (dữ liệu có thể thay đổi, không unique) để xác định phân công là cơ chế không bền vững.

---

## 2. Lỗi nghiêm trọng phát hiện: Broken CREATE TABLE Syntax trong `db.js`

Ai đó đã cố gắng thêm `homeroom_teacher_id` bằng cách nhúng câu `ALTER TABLE` vào bên trong khối `CREATE TABLE IF NOT EXISTS school_classes`, tạo ra SQL hoàn toàn không hợp lệ:

```sql
-- TRƯỚC (không hợp lệ - sẽ crash server khi khởi động)
CREATE TABLE IF NOT EXISTS school_classes (
  id SERIAL PRIMARY KEY,
  class_name VARCHAR(30) UNIQUE NOT NULL,
  grade_level INT,
  gvcn_name VARCHAR(100)
  homeroom_teacher_id INT REFERENCES users(id)        -- thiếu dấu phẩy
  ALTER TABLE school_classes                           -- ALTER TABLE lồng trong CREATE TABLE
  ADD COLUMN IF NOT EXISTS homeroom_teacher_id INT
  REFERENCES users(id);
);
```

**Cách sửa:** Khôi phục `CREATE TABLE IF NOT EXISTS school_classes` về cú pháp hợp lệ (chỉ 4 cột: `id`, `class_name`, `grade_level`, `gvcn_name`), sau đó thêm migration riêng biệt:

```sql
-- SAU (hợp lệ, idempotent)
ALTER TABLE school_classes ADD COLUMN IF NOT EXISTS homeroom_teacher_id INTEGER REFERENCES users(id);
```

Migration này được đặt trong khối `await query(...)` thứ hai của `initDatabaseSchema()` — khối đã dùng pattern `ADD COLUMN IF NOT EXISTS` an toàn — nên hoàn toàn tương thích với database đã tồn tại.

---

## 3. Các file đã chỉnh sửa

| File | Lý do thay đổi |
|------|----------------|
| `src/config/db.js` | Sửa lỗi CREATE TABLE bị vỡ; thêm `ALTER TABLE school_classes ADD COLUMN IF NOT EXISTS homeroom_teacher_id`; thêm backfill migration theo `full_name LIKE gvcn_name || '%'` |
| `src/repositories/ClassRepository.js` | Thêm method `findByHomeroomTeacherId(userId)` — tra cứu bằng FK thay vì chuỗi tên |
| `src/middleware/dataAccessMiddleware.js` | Viết lại hoàn toàn: dùng `homeroom_teacher_id` FK thay vì `full_name`; sentinel `__NO_CLASS__` thay vì `null` để phân biệt "chưa phân công" vs "không phải GVCN" |
| `src/services/StudentService.js` | Thêm guard `__NO_CLASS__` — ném lỗi `GVCN_NOT_ASSIGNED` thay vì trả toàn bộ học sinh |
| `src/controllers/StudentController.js` | Thêm kiểm tra scope cho `getStudentById`, `createStudent`, `updateStudent` |
| `src/controllers/AttendanceController.js` | Thêm GVCN scope enforcement cho `getAttendance`, `saveAttendance` |
| `src/controllers/GradeBookController.js` | Thêm GVCN scope enforcement cho `getPageData`, `getGradeBook`, `saveGrades`, `saveSpreadsheet` |
| `server.js` | Bổ sung `authenticateToken` + `resolveGvcnClass` cho các routes GradeBook và Attendance còn thiếu |
| `src/seeders/dataInitializer.js` | Thêm import `querySafe`; thêm backfill `homeroom_teacher_id` sau khi tạo classes |
| `src/tests/gvcn-scope.test.js` | Tạo mới — 11 unit test (không cần DB thật) |

---

## 4. Chi tiết Migration

### Cách thêm cột `homeroom_teacher_id`

```sql
ALTER TABLE school_classes ADD COLUMN IF NOT EXISTS homeroom_teacher_id INTEGER REFERENCES users(id);
```

- **Idempotent:** `ADD COLUMN IF NOT EXISTS` — chạy lại nhiều lần không gây lỗi.
- **Tương thích backward:** Không xóa dữ liệu cũ, không thay đổi cột `gvcn_name`.
- **Nullable:** Cho phép NULL trong giai đoạn migration — các lớp chưa phân công không bị ảnh hưởng.
- **Chạy tự động:** Migration chạy trong `initDatabaseSchema()` mỗi khi server khởi động, an toàn với database đã tồn tại.

### Cách chạy thủ công (nếu cần)

```bash
# Trong psql
ALTER TABLE school_classes ADD COLUMN IF NOT EXISTS homeroom_teacher_id INTEGER REFERENCES users(id);

# Backfill
UPDATE school_classes sc
SET homeroom_teacher_id = u.id
FROM users u
WHERE u.role = 'GVCN'
  AND u.full_name LIKE sc.gvcn_name || '%'
  AND sc.homeroom_teacher_id IS NULL;
```

---

## 5. Kết quả Liên kết GVCN → Lớp

### Phân tích dữ liệu seeder

| Username | full_name (users) | gvcn_name (school_classes) | Kết quả |
|----------|-------------------|----------------------------|---------|
| `gvcn.10a1` | `Lê Minh Châu (GVCN 10A1)` | `Lê Minh Châu` | ✅ Khớp bằng LIKE prefix |
| _(không có)_ | _(không có)_ | `Phạm Thị Dung` (10A2) | ⚠️ Chưa có tài khoản GVCN tương ứng |
| _(không có)_ | _(không có)_ | `Hoàng Văn Em` (11B1) | ⚠️ Chưa có tài khoản GVCN tương ứng |

**Ghi chú về LIKE prefix:** `users.full_name = 'Lê Minh Châu (GVCN 10A1)'` và `school_classes.gvcn_name = 'Lê Minh Châu'`. Điều kiện `full_name LIKE gvcn_name || '%'` khớp thành công do full_name bắt đầu bằng gvcn_name.

**Lớp 10A2, 11B1** sẽ có `homeroom_teacher_id IS NULL` — server sẽ ghi cảnh báo khi khởi động. Cần tạo tài khoản GVCN tương ứng và cập nhật FK thủ công khi có.

**Seeder backfill (dataInitializer.js)** cũng chạy riêng để đảm bảo sau seed: `UPDATE school_classes SET homeroom_teacher_id = (SELECT id FROM users WHERE username = 'gvcn.10a1' AND role = 'GVCN' LIMIT 1) WHERE class_name = '10A1' AND homeroom_teacher_id IS NULL`.

---

## 6. Danh sách API được bảo vệ

| Route | Phương thức | Middleware | Scope GVCN |
|-------|-------------|------------|------------|
| `/api/students` | GET | `authenticateToken`, `resolveGvcnClass` | Chỉ thấy học sinh lớp mình |
| `/api/students/:id` | GET | `authenticateToken`, `resolveGvcnClass` | Từ chối nếu học sinh không thuộc lớp |
| `/api/students` | POST | `authenticateToken`, `resolveGvcnClass` | Chỉ tạo vào lớp mình |
| `/api/students/:id` | PUT | `authenticateToken`, `resolveGvcnClass` | Chỉ sửa học sinh lớp mình |
| `/api/students/:id/calculate-gpa` | POST | `authenticateToken` | Không giới hạn scope (tính toán) |
| `/api/gradebook` | GET | `authenticateToken`, `resolveGvcnClass` | Force className = lớp mình |
| `/api/gradebook/page-data` | GET | `authenticateToken`, `resolveGvcnClass` | Force className = lớp mình |
| `/api/gradebook/save` | POST | `authenticateToken`, `resolveGvcnClass` | Kiểm tra className mỗi item |
| `/api/gradebook/save-spreadsheet` | POST | `authenticateToken`, `resolveGvcnClass` | Kiểm tra className mỗi item |
| `/api/gradebook/lock` | POST | `authenticateToken` | Không giới hạn (BGH operation) |
| `/api/gradebook/unlock` | POST | `authenticateToken` | Không giới hạn (BGH operation) |
| `/api/attendance` | GET | `authenticateToken`, `resolveGvcnClass` | Force className = lớp mình |
| `/api/attendance/summary` | GET | `authenticateToken` | Không giới hạn (BGH dashboard) |
| `/api/attendance/save` | POST | `authenticateToken`, `resolveGvcnClass` | Kiểm tra className mỗi item |

**Chính sách role khác:** BGH, GV, HS, PH → `req.gvcnClassName = null` → không bị hạn chế bởi scope logic này. Các quyền cũ giữ nguyên.

---

## 7. Kết quả Test

```
▶ resolveGvcnClass middleware logic
  ✔ Test 1: GVCN với lớp được phân công → gvcnClassName = class_name (2.296ms)
  ✔ Test 2: GVCN chưa được phân công lớp → sentinel __NO_CLASS__ (0.373ms)
  ✔ Test 3: BGH role → null (không hạn chế) (0.248ms)
  ✔ Test 3b: GV role → null (không hạn chế) (0.239ms)
✔ resolveGvcnClass middleware logic (6.590ms)

▶ StudentService.getAllStudents logic
  ✔ Test 4: restrictClassName là tên lớp → chỉ trả học sinh lớp đó (1.166ms)
  ✔ Test 4b: restrictClassName ưu tiên hơn className từ query param (0.300ms)
  ✔ Test 5: restrictClassName là __NO_CLASS__ → ném lỗi GVCN_NOT_ASSIGNED (0.919ms)
  ✔ Test 6: Sentinel __NO_CLASS__ propagation — không bao giờ trả toàn bộ học sinh (0.311ms)
  ✔ Test 7: BGH/null restrictClassName → trả toàn bộ học sinh (0.510ms)
✔ StudentService.getAllStudents logic (3.977ms)

▶ GVCN scope violations
  ✔ Test: GVCN 10A1 không thể xem học sinh 10A2 theo ID (0.427ms)
  ✔ Test: GVCN 10A1 có thể xem học sinh 10A1 theo ID (0.280ms)
✔ GVCN scope violations (0.985ms)

ℹ tests 11 | pass 11 | fail 0
```

---

## 8. Hướng dẫn kiểm thử Postman

### Chuẩn bị
1. Đảm bảo server đang chạy: `node server.js`
2. Đăng nhập để lấy token

### Test 1 — GVCN xem danh sách lớp mình (nên thành công, chỉ thấy 10A1)
```
POST /api/auth/login
Body: { "username": "gvcn.10a1", "password": "123456" }
→ Lấy token

GET /api/students
Headers: Authorization: Bearer <token>
Kỳ vọng: HTTP 200, chỉ trả về học sinh lớp 10A1 (HS001–HS004)
```

### Test 2 — GVCN giả mạo classId
```
GET /api/students?className=10A2
Headers: Authorization: Bearer <token GVCN 10A1>
Kỳ vọng: HTTP 200, vẫn chỉ trả về học sinh 10A1 (backend bỏ qua className từ query)
```

### Test 3 — GVCN xem học sinh ngoài phạm vi theo ID
```
GET /api/students/5          (HS005 thuộc 10A2)
Headers: Authorization: Bearer <token GVCN 10A1>
Kỳ vọng: HTTP 403, { "code": "GVCN_SCOPE_VIOLATION" }
```

### Test 4 — GVCN cập nhật học sinh ngoài phạm vi
```
PUT /api/students/5
Headers: Authorization: Bearer <token GVCN 10A1>
Body: { "fullName": "Tên sửa" }
Kỳ vọng: HTTP 403, dữ liệu HS005 không thay đổi
```

### Test 5 — GVCN chưa phân công
```
# Tạo tài khoản GVCN mới không có lớp chủ nhiệm:
# INSERT INTO users(username, password, full_name, role) VALUES('gvcn.test','...','Test GVCN','GVCN');

POST /api/auth/login
Body: { "username": "gvcn.test", "password": "123456" }

GET /api/students
Kỳ vọng: HTTP 403, { "code": "GVCN_NOT_ASSIGNED" }
```

### Test 6 — Token không hợp lệ
```
GET /api/students
Headers: Authorization: Bearer invalid.token.here
Kỳ vọng: HTTP 401, { "message": "Token không hợp lệ hoặc đã hết hạn." }
```

### Test 7 — Regression (BGH vẫn xem được mọi thứ)
```
POST /api/auth/login
Body: { "username": "bgh.admin", "password": "123456" }

GET /api/students
Kỳ vọng: HTTP 200, trả về tất cả học sinh (5 bản ghi)

GET /api/students/5
Kỳ vọng: HTTP 200, trả về HS005 (10A2)
```

---

## 9. Lưu ý và đề xuất còn lại

### Đã hoàn thành trong task này
- ✅ Migration `homeroom_teacher_id` FK — idempotent, tương thích backward
- ✅ Middleware mới dùng FK thay vì `full_name` string matching
- ✅ Sentinel `__NO_CLASS__` — GVCN chưa phân công không được xem dữ liệu
- ✅ Scope enforcement cho Student (list, detail, create, update)
- ✅ Scope enforcement cho Attendance (get, save)
- ✅ Scope enforcement cho GradeBook (get, page-data, save, save-spreadsheet)
- ✅ Các routes GradeBook và Attendance trước đây **không có `authenticateToken`** — đã thêm
- ✅ 11 unit test pass, không cần DB thật

### Điểm cần theo dõi
- **10A2 và 11B1** chưa có tài khoản GVCN tương ứng trong seeder → `homeroom_teacher_id IS NULL`. Cần tạo tài khoản và cập nhật FK khi triển khai thực tế.
- **Sổ điểm GV (Giáo viên bộ môn):** Route `/api/gradebook/save` và `/api/gradebook/save-spreadsheet` hiện được bảo vệ bởi `authenticateToken` — GV role không bị giới hạn scope (chỉ GVCN mới bị). Nếu dự án muốn giới hạn GV chỉ nhập điểm môn mình dạy, cần task riêng.
- **`/api/gradebook/lock`, `/api/gradebook/unlock`** thêm `authenticateToken` nhưng không có `resolveGvcnClass` — đây là thao tác của BGH, giữ nguyên.
- **Đề xuất nâng cấp (task riêng):** Thêm cột `class_id INT REFERENCES school_classes(id)` vào bảng `students` thay vì dùng `class_name` string join — hiện tại đã hoạt động đúng nhưng FK sẽ bền vững hơn.
