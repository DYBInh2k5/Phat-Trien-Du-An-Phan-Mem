# Hướng dẫn Thiết lập và Kết nối PostgreSQL (HTQLLH Backend Node.js Clean Architecture)

Tài liệu này hướng dẫn chi tiết cách cài đặt, cấu hình và kết nối Cơ sở dữ liệu PostgreSQL với phâm hệ Backend Node.js Express của hệ thống Quản lý Trường học (HTQLLH) thuộc **Thành viên 3 (Database Architect & Backend Developer)**.

---

## 1. Kiến trúc Tổng quan (Clean Architecture Overview)

Hệ thống Backend được thiết kế theo đúng nguyên lý **Clean Architecture** gồm 4 tầng phân tách minh bạch:

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

- **Domain Entities** (`src/entities/`): Chứa các mô hình nghiệp vụ lõi (`User`, `Student`, `GradeBook`,...).
- **Repositories** (`src/repositories/`): Xử lý truy vấn SQL dữ liệu (Data Access Layer - PostgreSQL Client).
- **Services** (`src/services/`): Xử lý các Use Case nghiệp vụ (tính toán GPA, khóa sổ điểm, duyệt đơn xin nghỉ).
- **Controllers** (`src/controllers/`): Định tuyến RESTful APIs và tương thích dữ liệu JSON (`camelCase` / `snake_case`) cho React Frontend.
- **Infrastructure** (`src/config/db.js`): Quản lý PostgreSQL Connection Pool (`pg`) và cơ chế Stateful In-Memory Fallback tự động.

---

## 2. Yêu cầu Tiền đề (Prerequisites)

- **PostgreSQL Server**: Phiên bản 14.x, 15.x hoặc 16.x (Tải từ https://www.postgresql.org/download/).
- **Node.js**: v18.0.0 trở lên.
- **Công cụ quản trị CSDL**: pgAdmin 4, DBeaver hoặc psql CLI.

---

## 3. Các bước Cấu hình Kết nối CSDL PostgreSQL

### Bước 1: Tạo Database trong PostgreSQL
Mở **pgAdmin 4** hoặc dùng **psql CLI** để tạo cơ sở dữ liệu mới với tên `school_management`:

```sql
CREATE DATABASE school_management;
```

### Bước 2: Cấu hình File Môi trường `.env`
Trong thư mục `members/member3_Backend_DB/school-management-nodejs/`, tạo hoặc chỉnh sửa file `.env` với các tham số tương ứng:

```env
PORT=8081
DB_HOST=localhost
DB_PORT=5434
DB_NAME=school_management
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=HTQLLH_Super_Secret_JWT_Key_2026
```

*Lưu ý*: Nếu PostgreSQL của bạn chạy cổng mặc định `5432`, hãy sửa `DB_PORT=5432`.

---

## 4. Cấu trúc Bảng CSDL PostgreSQL (DDL Schema)

Hệ thống Backend Node.js sẽ tự động tạo bảng (Auto DDl Migration) khi khởi chạy server. Bạn cũng có thể chủ động tạo bảng thủ công bằng script SQL dưới đây:

```sql
-- 1. Bảng Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Students
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  student_code VARCHAR(30) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  gender VARCHAR(10),
  dob VARCHAR(20),
  class_name VARCHAR(30),
  parent_name VARCHAR(100),
  parent_phone VARCHAR(20),
  gpa NUMERIC(3, 1),
  academic_rank VARCHAR(30),
  status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- 3. Bảng Grade Books (Sổ điểm điện tử)
CREATE TABLE IF NOT EXISTS grade_books (
  id SERIAL PRIMARY KEY,
  student_id INT,
  student_code VARCHAR(30) NOT NULL,
  student_name VARCHAR(100),
  class_name VARCHAR(30),
  subject_name VARCHAR(50),
  semester VARCHAR(10),
  school_year VARCHAR(20),
  score_oral NUMERIC(3, 1),
  score_15m NUMERIC(3, 1),
  score_1hour NUMERIC(3, 1),
  score_mid_term NUMERIC(3, 1),
  score_final_term NUMERIC(3, 1),
  average_score NUMERIC(3, 1),
  grade_letter VARCHAR(20),
  status VARCHAR(20) DEFAULT 'APPROVED'
);

-- 4. Bảng Attendances (Điểm danh chuyên cần)
CREATE TABLE IF NOT EXISTS attendances (
  id SERIAL PRIMARY KEY,
  student_id INT,
  student_code VARCHAR(30) NOT NULL,
  student_name VARCHAR(100),
  class_name VARCHAR(30),
  att_date VARCHAR(20) NOT NULL,
  status VARCHAR(30) NOT NULL,
  note TEXT
);

-- 5. Bảng Leave Requests (Đơn xin nghỉ học)
CREATE TABLE IF NOT EXISTS leave_requests (
  id SERIAL PRIMARY KEY,
  student_id INT,
  student_code VARCHAR(30) NOT NULL,
  student_name VARCHAR(100),
  class_name VARCHAR(30),
  from_date VARCHAR(20),
  to_date VARCHAR(20),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng Tuitions (Học phí)
CREATE TABLE IF NOT EXISTS tuitions (
  id SERIAL PRIMARY KEY,
  student_code VARCHAR(30) NOT NULL,
  student_name VARCHAR(100),
  class_name VARCHAR(30),
  semester VARCHAR(10),
  school_year VARCHAR(20),
  amount_due NUMERIC(12, 2),
  amount_paid NUMERIC(12, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'UNPAID',
  receipt_no VARCHAR(50)
);

-- 7. Bảng School Classes (Danh mục Lớp học)
CREATE TABLE IF NOT EXISTS school_classes (
  id SERIAL PRIMARY KEY,
  class_name VARCHAR(30) UNIQUE NOT NULL,
  grade_level INT,
  gvcn_name VARCHAR(100)
);

-- 8. Bảng Subjects (Danh mục Môn học)
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  credits INT DEFAULT 1
);
```

---

## 5. Khởi động và Kiểm tra Kết nối

### 1. Khởi chạy Server Backend
Mở Terminal tại thư mục `members/member3_Backend_DB/school-management-nodejs/`:

```bash
npm install
npm run start
```

### 2. Kết quả Log Kỳ vọng

```text
[DB INIT] Initializing PostgreSQL database tables...
[DATA INIT] Initializing default seed data...
[DATA INIT] Initialized 5 default system users.
[DATA INIT] Initialized demo students.
[DATA INIT] Initialized demo gradebooks.
=====================================================
HTQLLH Clean Architecture Backend Server Running!
Port: 8081
API Endpoint: http://localhost:8081/api
=====================================================
```

### 3. Cơ chế Stateful In-Memory Fallback Tự động
Nếu PostgreSQL chưa khởi chạy hoặc bị lỗi mật khẩu, hệ thống sẽ đưa ra cảnh báo nhẹ `[DB WARN]` và tự động chuyển sang lưu trữ bộ nhớ đệm (Stateful Memory Store). Việc này giúp ứng dụng Frontend React.js **luôn luôn chạy mượt mà 100% mà không bị đứt gãy hay gián đoạn trải nghiệm**.

### 4. Kiểm tra Endpoint HealthCheck
Mở trình duyệt hoặc Postman truy cập:
- `http://localhost:8081/api/health`

**Phản hồi:**
```json
{
  "status": "UP",
  "system": "HTQLLH School Management Node.js Clean Architecture Backend",
  "database": "PostgreSQL (or Stateful Memory Fallback)",
  "timestamp": "2026-10-06T10:42:00.000Z"
}
```

---

## 6. Người thực hiện & Liên hệ

- **Trưởng nhóm / PM**: Võ Duy Bình (DYBInh2k5)
- **Thành viên 3**: Database Architect & Backend Developer
- **Hệ thống**: HTQLLH (School Management System - SMS)
