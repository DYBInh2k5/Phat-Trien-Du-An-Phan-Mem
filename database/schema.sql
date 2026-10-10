-- =============================================================================
-- POSTGRESQL DDL SCHEMA & INITIAL SEED SCRIPT
-- Project: He Thong Quan Ly Truong Hoc (HTQLLH / School Management System)
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
-- INDEXES TỐI ƯU HÓA HIỆU NĂNG TRUY VẤN
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_students_class_name ON students(class_name);
CREATE INDEX IF NOT EXISTS idx_students_student_code ON students(student_code);
CREATE INDEX IF NOT EXISTS idx_grade_books_search ON grade_books(student_code, subject_name, semester);
CREATE INDEX IF NOT EXISTS idx_attendances_class_date ON attendances(class_name, att_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_student ON leave_requests(student_code, status);
CREATE INDEX IF NOT EXISTS idx_tuitions_student ON tuitions(student_code, status);

-- =============================================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- =============================================================================
INSERT INTO subjects (code, name, credits) VALUES
('MATH', 'Toán Học', 2),
('LIT', 'Ngữ Văn', 2),
('ENG', 'Tiếng Anh', 2),
('PHYS', 'Vật Lý', 1),
('CHEM', 'Hóa Học', 1)
ON CONFLICT (code) DO NOTHING;

INSERT INTO school_classes (class_name, grade_level, gvcn_name) VALUES
('10A1', 10, 'Nguyễn Văn An'),
('10A2', 10, 'Lê Thị Mai')
ON CONFLICT (class_name) DO NOTHING;

INSERT INTO users (username, password, full_name, role) VALUES
('admin', '$2a$10$wN3/sK.7Y4x1z...demo_admin', 'Ban Giám Hiệu Admin', 'ROLE_ADMIN'),
('gvcn', '$2a$10$wN3/sK.7Y4x1z...demo_gvcn', 'Nguyễn Văn An (GVCN 10A1)', 'ROLE_HOMEROOM_TEACHER'),
('gvbm', '$2a$10$wN3/sK.7Y4x1z...demo_gvbm', 'Trần Thị Bình (GVBM Toán)', 'ROLE_SUBJECT_TEACHER'),
('student', '$2a$10$wN3/sK.7Y4x1z...demo_student', 'Nguyễn Thị Ánh', 'ROLE_STUDENT'),
('parent', '$2a$10$wN3/sK.7Y4x1z...demo_parent', 'Nguyễn Thị Hương (Phụ huynh)', 'ROLE_PARENT')
ON CONFLICT (username) DO NOTHING;

INSERT INTO students (student_code, full_name, gender, dob, class_name, parent_name, parent_phone, gpa, academic_rank, status) VALUES
('HS001', 'Nguyễn Thị Ánh', 'Nữ', '2008-05-12', '10A1', 'Nguyễn Thị Hương', '0901234567', 8.7, 'Giỏi', 'ACTIVE'),
('HS002', 'Trần Văn Bảo', 'Nam', '2008-03-22', '10A1', 'Trần Văn Hùng', '0907654321', 6.8, 'Khá', 'ACTIVE'),
('HS003', 'Lê Thị Cẩm', 'Nữ', '2008-11-10', '10A1', 'Lê Văn Tâm', '0912345678', 4.5, 'Yếu', 'ACTIVE'),
('HS004', 'Phạm Hữu Dũng', 'Nam', '2008-01-15', '10A1', 'Phạm Thị Lan', '0922334455', 8.5, 'Giỏi', 'ACTIVE'),
('HS005', 'Đặng Thị Giang', 'Nữ', '2008-07-08', '10A2', 'Đặng Văn Nam', '0933445566', 7.2, 'Khá', 'ACTIVE')
ON CONFLICT (student_code) DO NOTHING;
