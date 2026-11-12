# CẨM NANG HƯỚNG DẪN KẾT NỐI VÀ SỬ DỤNG POSTGRESQL EXTENSION TRÊN IDE
## HỆ THỐNG QUẢN LÝ LỚP HỌC & HỌC VỤ THPT (HTQLLH / EDUMANAGE PRO)

```
================================================================================
DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC THPT HSU (HTQLLH / SCHOOL MANAGEMENT SYSTEM)
MÔN HỌC: SW320DV01 — PHÁT TRIỂN DỰ ÁN PHẦN MỀM (ĐẠI HỌC HOA SEN)
TÀI LIỆU: HƯỚNG DẪN SỬ DỤNG POSTGRESQL EXTENSION & THAO TÁC BẢNG DỮ LIỆU
VỊ TRÍ TÀI LIỆU: docs/HUONG_DAN_KET_NOI_POSTGRESQL_EXTENSION.md
TÁC GIẢ: NHÓM DỰ ÁN PHÁT TRIỂN PHẦN MỀM HSU (TRƯỞNG NHÓM: VÕ DUY BÌNH)
THÀNH VIÊN KỸ THUẬT: Huỳnh Trung Tính (Backend & DBA) · Trần Quang Vinh (Logic & Security)
NGÀY LẬP: 12/11/2026 (TUẦN 8-9 HỌC PHẦN)
================================================================================
```

---

## 1. THÔNG SỐ KẾT NỐI CƠ SỞ DỮ LIỆU CHUẨN

Khi container Docker PostgreSQL (`htqllh_postgres`) đang chạy, CSDL sẽ lắng nghe tại cổng **`5434`** trên máy của bạn với các thông số kết nối chuẩn sau:

| Thông số kết nối (Field) | Giá trị cấu hình (Value) | Ghi chú giải thích |
| :--- | :--- | :--- |
| **Host / Server** | `localhost` (hoặc `127.0.0.1`) | Máy chủ cục bộ của bạn |
| **Port** | **`5434`** | Cổng ngoại vi ánh xạ từ Docker container |
| **Database Name** | **`school_management`** | Tên CSDL chứa toàn bộ 11 bảng của dự án |
| **User / Username** | **`postgres`** | Tài khoản quản trị mặc định |
| **Password** | **`postgres`** | Mật khẩu xác thực CSDL |
| **SSL / Secure Connection** | `Disable` (hoặc `false`) | Kết nối nội bộ localhost không dùng SSL |

---

## 2. HƯỚNG DẪN TỪNG BƯỚC THIẾT LẬP KẾT NỐI TRÊN IDE

### Bước 1: Mở giao diện PostgreSQL Extension
1. Nhìn vào thanh bên trái (Activity Bar) của IDE, bấm vào biểu tượng **Database** / **PostgreSQL** (hoặc biểu tượng hình con voi / hình trụ CSDL).
2. Hoặc mở **Command Palette** (`Ctrl + Shift + P`) ➔ gõ `PostgreSQL: Add Connection` ➔ nhấn `Enter`.

### Bước 2: Điền thông tin kết nối
Hệ thống sẽ lần lượt hỏi các thông số (hoặc hiện bảng điền form):
- **Host name:** Gõ `localhost` ➔ Enter.
- **Port:** Gõ `5434` ➔ Enter.
- **Database:** Gõ `school_management` ➔ Enter.
- **User:** Gõ `postgres` ➔ Enter.
- **Password:** Gõ `postgres` ➔ Enter.
- **Save password:** Chọn `Always` (để không phải nhập lại mỗi lần mở IDE).
- **Connection name (tùy chọn):** Đặt tên dễ nhớ: `HTQLLH Local DB (5434)`.

👉 Sau khi kết nối thành công, bạn sẽ thấy xuất hiện nút màu xanh lá cây báo hiệu **Connected**!

---

## 3. THAO TÁC XEM VÀ DUYỆT BẢNG DỮ LIỆU (DATABASE EXPLORER)

Sau khi kết nối, bạn bung cây thư mục theo thứ tự:
`HTQLLH Local DB` ➔ `Databases` ➔ `school_management` ➔ `Schemas` ➔ `public` ➔ `Tables`.

Bạn sẽ thấy đầy đủ **11 bảng dữ liệu** của dự án:
- `users`: Danh sách tài khoản 5 vai trò (BGH, GVCN, GVBM, HS, PH).
- `students`: Hồ sơ học sinh toàn trường (Mã HS, Họ tên, Lớp, SĐT phụ huynh).
- `school_classes`: Danh mục các lớp học (10A1, 10A2, 11A1, 12A1...).
- `subjects`: Danh mục các môn học (Toán, Văn, Anh, Lý, Hóa...).
- `teacher_assignments`: Phân công giáo viên giảng dạy từng lớp theo môn.
- `grade_books`: Sổ điểm điện tử thành phần chuẩn Thông tư 22.
- `attendances`: Nhật ký điểm danh 2 cấp (đầu giờ & theo tiết).
- `leave_requests`: Đơn xin phép nghỉ học trực tuyến của phụ huynh.
- `tuitions`: Danh mục hóa đơn học phí và biên lai VietQR.
- `schedules`: Ma trận thời khóa biểu tuần các lớp.
- `audit_logs`: Nhật ký kiểm toán lưu vết lịch sử sửa điểm.

### Cách xem dữ liệu bên trong một bảng:
- **Cách 1 (Nhanh nhất):** Chuột phải vào tên bảng (ví dụ `students`) ➔ Chọn **Select Top 100** (hoặc *View Data*). Một tab bảng tính trực quan sẽ hiện ra hiển thị toàn bộ các hàng và cột dữ liệu.
- **Cách 2:** Bấm vào biểu tượng con mắt hoặc biểu tượng tia sét cạnh tên bảng.

---

## 4. THAO TÁC VIẾT VÀ CHẠY TRUY VẤN SQL TRỰC TIẾP (QUERY CONSOLE)

1. Mở một trình soạn thảo truy vấn: Chuột phải vào kết nối ➔ Chọn **New Query** (hoặc bấm biểu tượng trang giấy có dấu cộng).
2. Gõ câu lệnh SQL cần kiểm tra.
3. Bôi đen câu lệnh ➔ Nhấn tổ hợp phím **`Ctrl + Enter`** (hoặc `F5`, hoặc bấm nút **Execute / Run**).
4. Bảng kết quả trả về (*Result Grid*) sẽ hiển thị ngay bên dưới với đầy đủ số lượng dòng, thời gian thực thi (ms).

---

## 5. TOP 10 CÂU LỆNH SQL MẪU THƯỜNG DÙNG TRONG DỰ ÁN

Dưới đây là các câu truy vấn hữu ích bạn có thể copy chạy ngay để kiểm tra nghiệp vụ:

### 1. Xem danh sách 5 tài khoản mẫu để đăng nhập:
```sql
SELECT id, username, full_name, role, created_at 
FROM users 
ORDER BY id ASC;
```

### 2. Xem toàn bộ học sinh lớp 10A1:
```sql
SELECT student_code, full_name, gender, dob, class_name, parent_name, parent_phone, status
FROM students
WHERE class_name = '10A1'
ORDER BY student_code ASC;
```

### 3. Xem sổ điểm môn Toán lớp 10A1 (Chuẩn Thông tư 22):
```sql
SELECT student_code, student_name, subject_name, 
       score_oral AS "Miệng", 
       score_15m AS "15 Phút", 
       score_1hour AS "1 Tiết", 
       score_mid_term AS "Giữa Kỳ", 
       score_final_term AS "Cuối Kỳ", 
       average_score AS "ĐTBmhk", 
       grade_letter AS "Học Lực", 
       status AS "Trạng Thái Sổ"
FROM grade_books
WHERE class_name = '10A1' AND subject_name = 'Toán'
ORDER BY student_code ASC;
```

### 4. Kiểm tra vết kiểm toán khi có ai sửa điểm (Audit Trail):
```sql
SELECT id, user_id, student_id, old_score, new_score, reason, ip_address, created_at
FROM audit_logs
ORDER BY created_at DESC;
```

### 5. Xem tình hình điểm danh học sinh hôm nay:
```sql
SELECT student_code, student_name, class_name, att_date, status, note
FROM attendances
WHERE att_date = CURRENT_DATE
ORDER BY class_name, student_code;
```

### 6. Xem danh sách học sinh có nguy cơ bị cấm thi (Vắng >= 20%):
```sql
SELECT student_code, student_name, class_name,
       COUNT(CASE WHEN status IN ('ABSENT', 'EXCUSED') THEN 1 END) AS total_absent,
       COUNT(*) AS total_sessions,
       ROUND((COUNT(CASE WHEN status IN ('ABSENT', 'EXCUSED') THEN 1 END)::NUMERIC / COUNT(*)) * 100, 1) AS absent_rate
FROM attendances
GROUP BY student_code, student_name, class_name
HAVING ROUND((COUNT(CASE WHEN status IN ('ABSENT', 'EXCUSED') THEN 1 END)::NUMERIC / COUNT(*)) * 100, 1) >= 20.0;
```

### 7. Xem danh sách đơn xin nghỉ học đang chờ GVCN duyệt:
```sql
SELECT id, student_code, student_name, class_name, from_date, to_date, reason, status
FROM leave_requests
WHERE status = 'PENDING'
ORDER BY created_at DESC;
```

### 8. Xem hóa đơn học phí và mã biên lai VietQR:
```sql
SELECT student_code, student_name, class_name, semester, amount_due, amount_paid, status, receipt_no
FROM tuitions
ORDER BY class_name, student_code;
```

### 9. Xem ma trận thời khóa biểu tuần của lớp 10A1:
```sql
SELECT day_of_week, period, subject_name, teacher_name, room
FROM schedules
WHERE class_name = '10A1'
ORDER BY day_of_week, period;
```

### 10. Đếm tổng số bản ghi trong từng bảng của toàn hệ thống:
```sql
SELECT 'users' AS table_name, COUNT(*) AS total_rows FROM users UNION ALL
SELECT 'students', COUNT(*) FROM students UNION ALL
SELECT 'school_classes', COUNT(*) FROM school_classes UNION ALL
SELECT 'subjects', COUNT(*) FROM subjects UNION ALL
SELECT 'grade_books', COUNT(*) FROM grade_books UNION ALL
SELECT 'attendances', COUNT(*) FROM attendances UNION ALL
SELECT 'leave_requests', COUNT(*) FROM leave_requests UNION ALL
SELECT 'tuitions', COUNT(*) FROM tuitions UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;
```

---

## 6. XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

- **Lỗi 1: `Connection refused` (Không kết nối được vào cổng 5434):**
  - *Nguyên nhân:* Container Docker PostgreSQL chưa được bật.
  - *Khắc phục:* Mở Terminal gõ lệnh:
    ```bash
    docker start htqllh_postgres
    ```
- **Lỗi 2: `Password authentication failed for user "postgres"`:**
  - *Khắc phục:* Kiểm tra lại mật khẩu phải gõ đúng chữ thường: `postgres`.
- **Lỗi 3: `Database "school_management" does not exist`:**
  - *Khắc phục:* Đảm bảo tên CSDL gõ đúng chữ thường `school_management` (có dấu gạch dưới `_`).
