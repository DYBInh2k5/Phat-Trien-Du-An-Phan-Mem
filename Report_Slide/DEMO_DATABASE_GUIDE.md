# HƯỚNG DẪN DEMO CHUYÊN ĐỀ CƠ SỞ DỮ LIỆU
## Chuyên đề 2 (Tuần 3): Thiết Kế CSDL PostgreSQL 3NF & ERD
### Hệ thống: HTQLLH / EduManage Pro — Đại học Hoa Sen (SW320DV01)

```
================================================================================
Vị trí tệp : Report_Slide/DEMO_DATABASE_GUIDE.md
Mục đích   : Kịch bản quay video demo chuyên đề Cơ sở Dữ liệu (Tuần 3)
Thời điểm  : 30/10/2026 — Tuần 7 / 15 Tuần Học kỳ 2631
GitHub     : https://github.com/DYBInh2k5/Phat-Trien-Du-An-Phan-Mem
================================================================================
```

---

## PHẦN 1: CHUẨN BỊ TRƯỚC KHI QUAY VIDEO

### 1.1 Yêu cầu
- Docker Desktop đang chạy, container PostgreSQL đã khởi động
- Backend Node.js đang chạy (đã seed 45 học sinh mẫu)
- VS Code mở file `database/schema.sql`
- Terminal sẵn sàng chạy lệnh `docker exec`

### 1.2 Kiểm tra Docker và kết nối CSDL
```bash
# Kiểm tra container đang chạy
docker ps
# => Mong đợi: "htqllh-postgres" status "Up", port 5434->5432

# Kết nối vào PostgreSQL bên trong container
docker exec -it htqllh-postgres psql -U postgres -d school_management
# => Dấu nhắc: school_management=#
```

### 1.3 Bố cục màn hình khi quay video
```
+------------------------------------------+---------------------------------+
|  TERMINAL (psql / docker exec)            |  VS CODE (database/schema.sql) |
|  [Chạy SQL query trực tiếp]               |  [Xem DDL và quan hệ FK]       |
+------------------------------------------+---------------------------------+
```

---

## PHẦN 2: KỊCH BẢN DEMO TỪNG NỘI DUNG CƠ SỞ DỮ LIỆU

---

### DEMO 3.1: Khởi Động Docker & Kết Nối PostgreSQL
**Thời lượng gợi ý: 2 phút**

**Kịch bản tường thuật:**

> "Thay vì cài PostgreSQL trực tiếp lên máy và lo xung đột cổng, hệ thống đóng gói PostgreSQL vào Docker Container. Lệnh docker-compose up khởi động toàn bộ hạ tầng chỉ trong vài giây."

**Thao tác demo:**
```bash
docker ps
# => htqllh-postgres Up, cổng 5434->5432

docker exec -it htqllh-postgres psql -U postgres -d school_management
# => school_management=#
```

> "Cổng 5434 (không phải 5432 mặc định) để tránh xung đột với PostgreSQL đã cài sẵn trên máy tính."

---

### DEMO 3.2: Liệt Kê 8 Bảng Dữ Liệu & Sơ Đồ Quan Hệ
**Thời lượng gợi ý: 3 phút**

**Kịch bản tường thuật:**

> "Hệ thống có 8 bảng, thiết kế theo chuẩn 3NF — không có thuộc tính phụ thuộc vào thuộc tính không phải khóa chính."

**Thao tác trong psql:**
```sql
\dt
-- Kết quả: 8 bảng: subjects, school_classes, users, students,
--          grade_books, attendances, leave_requests, tuition_fees
```

**Sơ đồ quan hệ (trình bày trên bảng hoặc slide):**
```
school_classes <-- students --> grade_books
                            |-> attendances
                            |-> leave_requests
                            |-> tuition_fees
subjects (danh mục môn học độc lập)
users    (tài khoản hệ thống độc lập)
```

---

### DEMO 3.3: Xem Dữ Liệu Mẫu 45 Học Sinh
**Thời lượng gợi ý: 2 phút**

```sql
-- Đếm tổng học sinh
SELECT COUNT(*) FROM students;
-- => 45

-- Xem 5 học sinh đầu
SELECT id, student_code, full_name, class_name, academic_rank
FROM students LIMIT 5;
```

> "Khi Backend khởi động lần đầu, dataInitializer.js tự động seed 45 học sinh mẫu. Chạy lại không bị trùng nhờ `ON CONFLICT DO NOTHING`."

---

### DEMO 3.4: Truy Vấn JOIN Nhiều Bảng — Sổ Điểm Học Sinh
**Thời lượng gợi ý: 3 phút**

```sql
-- Lấy sổ điểm môn Toán lớp 10A1
SELECT
  s.student_code  AS "Mã HS",
  s.full_name     AS "Họ tên",
  g.subject_name  AS "Môn học",
  g.score_oral    AS "Miệng",
  g.score_15m     AS "15 phút",
  g.score_1hour   AS "1 Tiết",
  g.score_mid_term AS "Giữa kỳ",
  g.score_final_term AS "Cuối kỳ",
  g.average_score AS "TBM",
  g.grade_letter  AS "Xếp loại"
FROM grade_books g
JOIN students s ON g.student_id = s.id
WHERE g.subject_name = 'Toan'
ORDER BY s.student_code
LIMIT 10;
```

> "Khóa ngoại `grade_books.student_id REFERENCES students(id)` bảo đảm không thể tồn tại điểm của học sinh không có trong bảng `students`."

---

### DEMO 3.5: Xem schema.sql — DDL & Ràng Buộc Dữ Liệu
**Thời lượng gợi ý: 3 phút**

**Mở file trên VS Code:**
```
database/schema.sql
```

**Đoạn DDL cần giải thích:**
```sql
CREATE TABLE IF NOT EXISTS grade_books (
  id               SERIAL PRIMARY KEY,
  student_id       INT REFERENCES students(id) ON DELETE CASCADE,
  score_oral       NUMERIC(3, 1) DEFAULT 0.0,   -- Miệng (hệ số 1)
  score_15m        NUMERIC(3, 1) DEFAULT 0.0,   -- 15 phút (hệ số 1)
  score_1hour      NUMERIC(3, 1) DEFAULT 0.0,   -- 1 Tiết (hệ số 2)
  score_mid_term   NUMERIC(3, 1) DEFAULT 0.0,   -- Giữa kỳ (hệ số 2)
  score_final_term NUMERIC(3, 1) DEFAULT 0.0,   -- Cuối kỳ (hệ số 3)
  average_score    NUMERIC(3, 1) DEFAULT 0.0,
  grade_letter     VARCHAR(20)   DEFAULT 'Chua xep loai',
  status           VARCHAR(20)   DEFAULT 'APPROVED'
);
```

> "NUMERIC(3,1): tối đa 3 chữ số, 1 chữ số thập phân — lưu điểm từ 0.0 đến 10.0 chính xác tuyệt đối, không có sai số làm tròn như kiểu FLOAT."

> "ON DELETE CASCADE: Khi học sinh bị xóa, tất cả điểm của học sinh đó cũng xóa tự động — tránh dữ liệu mồ côi."

---

### DEMO 3.6: Minh Họa ACID — Giao Dịch BEGIN / ROLLBACK
**Thời lượng gợi ý: 2 phút**

```sql
BEGIN;

UPDATE grade_books
SET score_final_term = 8.5
WHERE student_code = 'HS001' AND subject_name = 'Toan';

-- Giả lập lỗi xảy ra -> hoàn tác
ROLLBACK;

-- Xác nhận điểm không thay đổi
SELECT score_final_term FROM grade_books
WHERE student_code = 'HS001' AND subject_name = 'Toan';
-- => Giá trị gốc không bị ảnh hưởng
```

> "Trong mã nguồn, UnitOfWork.js tự động gọi BEGIN khi bắt đầu lưu bảng điểm và COMMIT khi thành công toàn bộ. Nếu có lỗi bất kỳ, ROLLBACK được gọi — đây là tính Atomicity của ACID."

---

## PHẦN 3: THỨ TỰ QUAY VIDEO VÀ THỜI LƯỢNG

| STT | Nội dung | Thời lượng | Ghi chú |
|:---:|:---|:---:|:---|
| 1 | Giới thiệu: Tại sao chọn PostgreSQL thay vì MySQL hay MongoDB | 2 phút | ACID, MVCC, miễn phí 100% |
| 2 | Demo 3.1: Docker ps + kết nối psql | 2 phút | Hiển thị terminal rõ ràng |
| 3 | Demo 3.2: Liệt kê 8 bảng + vẽ sơ đồ quan hệ | 3 phút | Kết hợp terminal và bảng tay |
| 4 | Demo 3.3: SELECT 45 học sinh mẫu | 2 phút | Cho thấy dữ liệu thật |
| 5 | Demo 3.4: JOIN bảng students + grade_books | 3 phút | Gõ câu query trực tiếp |
| 6 | Demo 3.5: schema.sql — DDL, FK, NUMERIC | 3 phút | VS Code song song terminal |
| 7 | Demo 3.6: BEGIN / ROLLBACK — tính ACID | 2 phút | Liên hệ với UnitOfWork.js |

**Tổng thời lượng dự kiến: khoảng 17 phút**

---

## PHẦN 4: CÂU TRẢ LỜI NGẮN GỌN NẾU BỊ HỎI THÊM

### "Tại sao chọn PostgreSQL thay vì MySQL?"
> "PostgreSQL hỗ trợ MVCC tốt hơn — nhiều giao dịch đọc ghi song song không chặn nhau. Kiểu NUMERIC lưu điểm số chính xác tuyệt đối, không có lỗi làm tròn FLOAT như MySQL đôi khi gặp."

### "3NF là gì, tại sao cần chuẩn hóa?"
> "Dạng Chuẩn Thứ Ba yêu cầu mọi thuộc tính không khóa phụ thuộc trực tiếp vào khóa chính, không phụ thuộc vào nhau. Nếu không chuẩn hóa, đổi tên lớp học phải sửa hàng nghìn bản ghi thay vì chỉ 1 bản ghi trong bảng school_classes."

### "NUMERIC(3,1) khác FLOAT như thế nào?"
> "FLOAT lưu xấp xỉ nhị phân — đôi khi 8.5 thành 8.4999... Với điểm số học sinh theo Thông tư 22, NUMERIC(3,1) đảm bảo lưu chính xác hoàn toàn."

### "ON DELETE CASCADE có nguy hiểm không?"
> "Phù hợp khi dữ liệu con không có ý nghĩa độc lập — điểm của học sinh đã xóa không cần giữ lại. Với bảng users, chúng tôi không dùng CASCADE để tránh xóa nhầm tài khoản."

---

## PHẦN 5: ĐƯỜNG DẪN MÃ NGUỒN THAM KHẢO

- **Lược đồ DDL**: [database/schema.sql](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/database/schema.sql)
- **Sơ đồ ERD**: [database/ERD.md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/database/ERD.md)
- **Cấu hình Singleton Pool**: [src/config/db.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/config/db.js)
- **Docker Compose**: [docker-compose.yml](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/docker-compose.yml)
- **Khởi tạo dữ liệu mẫu**: [src/seeders/dataInitializer.js](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/seeders/dataInitializer.js)
- **Tài liệu nghiên cứu tuần 3**: [BrainStorm/Week3 DB .md](file:///d:/HSU/2631Semester%201%282026-2027%29/PT_DA_PM/BrainStorm/Week3%20DB%20.md)

---

*Tài liệu phục vụ quay video demo chuyên đề Cơ sở Dữ liệu — Môn học Phát triển Dự án Phần mềm (SW320DV01), Đại học Hoa Sen (HSU), Học kỳ 2631.*
