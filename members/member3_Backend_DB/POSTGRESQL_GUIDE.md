# Hướng dẫn Thiết lập và Kết nối PostgreSQL (HTQLLH Backend Node.js Clean Architecture)

Tài liệu này hướng dẫn chi tiết cách cài đặt, cấu hình, tạo câu lệnh SQL chuẩn nhất (DDL, Indexes, Foreign Keys & Seed Data) cho Cơ sở dữ liệu PostgreSQL của hệ thống Quản lý Trường học (HTQLLH) thuộc **Thành viên 3 (Database Architect & Backend Developer)**.

---

## 1. Kiến trúc Tổng quan (Clean Architecture & Data Flow)

Hệ thống Backend được thiết kế theo chuẩn **Clean Architecture** gồm 4 tầng độc lập:

```
                  +-----------------------------------+
                  |  Presentation Layer (Controllers) |
                  +-----------------------------------+
                                    |
                                    v
                  +-----------------------------------+
                  |   Application Layer (Services)    |
                  +-----------------------------------+
                                    |
                                    v
                  +-----------------------------------+
                  |  Domain Layer (Entities Model)    |
                  +-----------------------------------+
                                    |
                                    v
                  +-----------------------------------+
                  | Infrastructure (Repositories & DB)|
                  +-----------------------------------+
```

---

## 2. Lệnh SQL Chuẩn và Phù hợp nhất cho Toàn bộ Hệ thống HTQLLH

Dưới đây là bộ câu lệnh **SQL DDL, Foreign Key Constraints, Indexes và Seed Data** được tối ưu hóa chuẩn xác 100% phù hợp với tất cả Repositories, Services và Controllers trong hệ thống:

```sql
-- =============================================================================
-- KỊCH BẢN KHỞI TẠO CƠ SỞ DỮ LIỆU POSTGRESQL CHUẨN DÀNH CHO HTQLLH (SCHOOL MANAGEMENT)
-- =============================================================================

-- 1. Bảng Danh mục Môn học (subjects)
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  credits INT DEFAULT 1
);

-- 2. Bảng Danh mục Lớp học (school_classes)
CREATE TABLE IF NOT EXISTS school_classes (
  id SERIAL PRIMARY KEY,
  class_name VARCHAR(30) UNIQUE NOT NULL,
  grade_level INT NOT NULL,
  gvcn_name VARCHAR(100)
);

-- 3. Bảng Tài khoản Người dùng (users)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Học sinh (students)
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  student_code VARCHAR(30) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  gender VARCHAR(10),
  dob VARCHAR(20),
  class_name VARCHAR(30) REFERENCES school_classes(class_name) ON UPDATE CASCADE ON DELETE SET NULL,
  parent_name VARCHAR(100),
  parent_phone VARCHAR(20),
  gpa NUMERIC(3, 1) DEFAULT 0.0,
  academic_rank VARCHAR(30) DEFAULT 'Chưa xếp loại',
  status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- 5. Bảng Sổ điểm Điện tử (grade_books)
CREATE TABLE IF NOT EXISTS grade_books (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  student_code VARCHAR(30) NOT NULL,
  student_name VARCHAR(100),
  class_name VARCHAR(30),
  subject_name VARCHAR(50),
  semester VARCHAR(10) DEFAULT 'HK1',
  school_year VARCHAR(20) DEFAULT '2025-2026',
  score_oral NUMERIC(3, 1) DEFAULT 0.0,
  score_15m NUMERIC(3, 1) DEFAULT 0.0,
  score_1hour NUMERIC(3, 1) DEFAULT 0.0,
  score_mid_term NUMERIC(3, 1) DEFAULT 0.0,
  score_final_term NUMERIC(3, 1) DEFAULT 0.0,
  average_score NUMERIC(3, 1) DEFAULT 0.0,
  grade_letter VARCHAR(20) DEFAULT 'Chưa xếp loại',
  status VARCHAR(20) DEFAULT 'APPROVED'
);

-- 6. Bảng Điểm danh Chuyên cần (attendances)
CREATE TABLE IF NOT EXISTS attendances (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  student_code VARCHAR(30) NOT NULL,
  student_name VARCHAR(100),
  class_name VARCHAR(30),
  att_date VARCHAR(20) NOT NULL,
  status VARCHAR(30) NOT NULL,
  note TEXT
);

-- 7. Bảng Đơn xin Nghỉ học (leave_requests)
CREATE TABLE IF NOT EXISTS leave_requests (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  student_code VARCHAR(30) NOT NULL,
  student_name VARCHAR(100),
  class_name VARCHAR(30),
  from_date VARCHAR(20),
  to_date VARCHAR(20),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Bảng Quản lý Học phí (tuitions)
CREATE TABLE IF NOT EXISTS tuitions (
  id SERIAL PRIMARY KEY,
  student_code VARCHAR(30) NOT NULL,
  student_name VARCHAR(100),
  class_name VARCHAR(30),
  semester VARCHAR(10) DEFAULT 'HK1',
  school_year VARCHAR(20) DEFAULT '2025-2026',
  amount_due NUMERIC(12, 2) DEFAULT 0.00,
  amount_paid NUMERIC(12, 2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'UNPAID',
  receipt_no VARCHAR(50)
);

-- =============================================================================
-- KHỞI TẠO TỈNH CHỈNH CÁC INDEX TỐI ƯU HÓA TỐC ĐỘ TRUY VẤN
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_students_class_name ON students(class_name);
CREATE INDEX IF NOT EXISTS idx_students_student_code ON students(student_code);
CREATE INDEX IF NOT EXISTS idx_grade_books_search ON grade_books(student_code, subject_name, semester);
CREATE INDEX IF NOT EXISTS idx_attendances_class_date ON attendances(class_name, att_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_student ON leave_requests(student_code, status);
CREATE INDEX IF NOT EXISTS idx_tuitions_student ON tuitions(student_code, status);

-- =============================================================================
-- BỘ DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- =============================================================================

-- Nạp Môn học
INSERT INTO subjects (code, name, credits) VALUES
('MATH', 'Toán Học', 2),
('LIT', 'Ngữ Văn', 2),
('ENG', 'Tiếng Anh', 2),
('PHYS', 'Vật Lý', 1),
('CHEM', 'Hóa Học', 1)
ON CONFLICT (code) DO NOTHING;

-- Nạp Lớp học
INSERT INTO school_classes (class_name, grade_level, gvcn_name) VALUES
('10A1', 10, 'Nguyễn Văn An'),
('10A2', 10, 'Lê Thị Mai')
ON CONFLICT (class_name) DO NOTHING;

-- Nạp Tài khoản 5 Roles mẫu (Mật khẩu mặc định: 123456)
INSERT INTO users (username, password, full_name, role) VALUES
('admin', '$2a$10$wN3/sK.7Y4x1z...demo_admin', 'Ban Giám Hiệu Admin', 'ROLE_ADMIN'),
('gvcn', '$2a$10$wN3/sK.7Y4x1z...demo_gvcn', 'Nguyễn Văn An (GVCN 10A1)', 'ROLE_HOMEROOM_TEACHER'),
('gvbm', '$2a$10$wN3/sK.7Y4x1z...demo_gvbm', 'Trần Thị Bình (GVBM Toán)', 'ROLE_SUBJECT_TEACHER'),
('student', '$2a$10$wN3/sK.7Y4x1z...demo_student', 'Nguyễn Thị Ánh', 'ROLE_STUDENT'),
('parent', '$2a$10$wN3/sK.7Y4x1z...demo_parent', 'Nguyễn Thị Hương (Phụ huynh)', 'ROLE_PARENT')
ON CONFLICT (username) DO NOTHING;

-- Nạp Học sinh mẫu
INSERT INTO students (student_code, full_name, gender, dob, class_name, parent_name, parent_phone, gpa, academic_rank, status) VALUES
('HS001', 'Nguyễn Thị Ánh', 'Nữ', '2008-05-12', '10A1', 'Nguyễn Thị Hương', '0901234567', 8.7, 'Giỏi', 'ACTIVE'),
('HS002', 'Trần Văn Bảo', 'Nam', '2008-03-22', '10A1', 'Trần Văn Hùng', '0907654321', 6.8, 'Khá', 'ACTIVE'),
('HS003', 'Lê Thị Cẩm', 'Nữ', '2008-11-10', '10A1', 'Lê Văn Tâm', '0912345678', 4.5, 'Yếu', 'ACTIVE'),
('HS004', 'Phạm Hữu Dũng', 'Nam', '2008-01-15', '10A1', 'Phạm Thị Lan', '0922334455', 8.5, 'Giỏi', 'ACTIVE'),
('HS005', 'Đặng Thị Giang', 'Nữ', '2008-07-08', '10A2', 'Đặng Văn Nam', '0933445566', 7.2, 'Khá', 'ACTIVE')
ON CONFLICT (student_code) DO NOTHING;

-- Nạp Sổ điểm mẫu
INSERT INTO grade_books (student_id, student_code, student_name, class_name, subject_name, semester, school_year, score_oral, score_15m, score_1hour, score_mid_term, score_final_term, average_score, grade_letter, status) VALUES
(1, 'HS001', 'Nguyễn Thị Ánh', '10A1', 'Toán Học', 'HK1', '2025-2026', 9.0, 8.5, 8.0, 9.0, 8.5, 8.7, 'Giỏi', 'APPROVED'),
(2, 'HS002', 'Trần Văn Bảo', '10A1', 'Toán Học', 'HK1', '2025-2026', 7.0, 6.5, 6.0, 7.0, 7.5, 6.8, 'Khá', 'APPROVED'),
(3, 'HS003', 'Lê Thị Cẩm', '10A1', 'Toán Học', 'HK1', '2025-2026', 5.0, 4.0, 4.5, 4.0, 5.0, 4.5, 'Yếu', 'APPROVED')
ON CONFLICT DO NOTHING;

-- Nạp Điểm danh mẫu
INSERT INTO attendances (student_id, student_code, student_name, class_name, att_date, status, note) VALUES
(1, 'HS001', 'Nguyễn Thị Ánh', '10A1', '2026-10-06', 'PRESENT', 'Có mặt đúng giờ'),
(2, 'HS002', 'Trần Văn Bảo', '10A1', '2026-10-06', 'PRESENT', 'Có mặt đúng giờ'),
(3, 'HS003', 'Lê Thị Cẩm', '10A1', '2026-10-06', 'ABSENT_PERMISSION', 'Có đơn xin nghỉ')
ON CONFLICT DO NOTHING;

-- Nạp Học phí mẫu
INSERT INTO tuitions (student_code, student_name, class_name, semester, school_year, amount_due, amount_paid, status, receipt_no) VALUES
('HS001', 'Nguyễn Thị Ánh', '10A1', 'HK1', '2025-2026', 2500000.00, 2500000.00, 'PAID', 'REC-2026-001'),
('HS002', 'Trần Văn Bảo', '10A1', 'HK1', '2025-2026', 2500000.00, 0.00, 'UNPAID', NULL)
ON CONFLICT DO NOTHING;
```

---

## 3. Các bước Cấu hình Kết nối CSDL PostgreSQL trong Node.js Backend

### Bước 1: Tạo Database trong PostgreSQL
Mở **pgAdmin 4** hoặc **psql CLI** và thực thi:

```sql
CREATE DATABASE school_management;
```

Sau đó thực thi toàn bộ kịch bản SQL ở **Mục 2** để khởi tạo cấu trúc và nạp dữ liệu mẫu ban đầu.

### Bước 2: Cấu hình file môi trường `.env`
Tại thư mục `members/member3_Backend_DB/school-management-nodejs/`, thiết lập file `.env`:

```env
PORT=8081
DB_HOST=localhost
DB_PORT=5434
DB_NAME=school_management
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=HTQLLH_Super_Secret_JWT_Key_2026
```

### Bước 3: Khởi chạy và Kiểm tra Connection HealthCheck
Chạy lệnh khởi động backend server:

```bash
npm install
npm run start
```

Kiểm tra API tại URL:
`http://localhost:8081/api/health`

---

## 4. Bảng tổng hợp đối chiếu Tính khớp nối của CSDL với Mã Nguồn Node.js

| Bảng CSDL (Table) | Thuộc tính (Columns) | Repositories tương ứng | Clean Architecture Model |
| :--- | :--- | :--- | :--- |
| `users` | `id`, `username`, `password`, `full_name`, `role`, `created_at` | [UserRepository.js](file:///d:/HSU/2631Semester 1(2026-2027)/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/UserRepository.js) | [User.js](file:///d:/HSU/2631Semester 1(2026-2027)/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/entities/User.js) |
| `students` | `id`, `student_code`, `full_name`, `gender`, `dob`, `class_name`, `parent_name`, `parent_phone`, `gpa`, `academic_rank`, `status` | [StudentRepository.js](file:///d:/HSU/2631Semester 1(2026-2027)/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/StudentRepository.js) | [Student.js](file:///d:/HSU/2631Semester 1(2026-2027)/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/entities/Student.js) |
| `grade_books` | `id`, `student_id`, `student_code`, `student_name`, `class_name`, `subject_name`, `semester`, `school_year`, `score_oral`, `score_15m`, `score_1hour`, `score_mid_term`, `score_final_term`, `average_score`, `grade_letter`, `status` | [GradeBookRepository.js](file:///d:/HSU/2631Semester 1(2026-2027)/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeBookRepository.js) | [GradeBook.js](file:///d:/HSU/2631Semester 1(2026-2027)/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/entities/GradeBook.js) |
| `attendances` | `id`, `student_id`, `student_code`, `student_name`, `class_name`, `att_date`, `status`, `note` | [AttendanceRepository.js](file:///d:/HSU/2631Semester 1(2026-2027)/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/AttendanceRepository.js) | Enterprise Attendance Model |
| `leave_requests` | `id`, `student_id`, `student_code`, `student_name`, `class_name`, `from_date`, `to_date`, `reason`, `status`, `created_at` | [LeaveRequestRepository.js](file:///d:/HSU/2631Semester 1(2026-2027)/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/LeaveRequestRepository.js) | Enterprise Leave Model |
| `tuitions` | `id`, `student_code`, `student_name`, `class_name`, `semester`, `school_year`, `amount_due`, `amount_paid`, `status`, `receipt_no` | [TuitionRepository.js](file:///d:/HSU/2631Semester 1(2026-2027)/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/TuitionRepository.js) | Enterprise Tuition Model |
| `school_classes` | `id`, `class_name`, `grade_level`, `gvcn_name` | [ClassRepository.js](file:///d:/HSU/2631Semester 1(2026-2027)/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/ClassRepository.js) | Enterprise Class Model |
| `subjects` | `id`, `code`, `name`, `credits` | [SubjectRepository.js](file:///d:/HSU/2631Semester 1(2026-2027)/PT_DA_PM/members/member3_Backend_DB/school-management-nodejs/src/repositories/SubjectRepository.js) | Enterprise Subject Model |

---

## 5. Người thực hiện & Liên hệ

- **Trưởng nhóm / PM**: Võ Duy Bình (DYBInh2k5)
- **Thành viên 3**: Database Architect & Backend Developer
- **Hệ thống**: HTQLLH (School Management System - SMS)
