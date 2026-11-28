-- =============================================================================
-- POSTGRESQL DDL SCHEMA & INITIAL SEED SCRIPT (UNIFIED MASTER SCHEMA)
-- Project: Hệ Thống Quản Lý Lớp Học & Học Vụ THPT (HTQLLH / School Management System)
-- Tiêu chuẩn: Thông tư 22/2021/TT-BGDĐT & Chuẩn hóa 3NF
-- Phiên bản: v2.0 (Đồng bộ đầy đủ 12 phân hệ: Auth, Students, GradeBook, Attendance, 
--           Leave, Tuition VietQR, Schedules, Templates, Notifications, Closures, Settings)
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
  gvcn_name VARCHAR(100),
  homeroom_teacher_id INT
);

-- 3. Bảng Tài khoản Người dùng (users)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  token_version INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
  ON users (LOWER(email)) WHERE email IS NOT NULL;

-- 4. Bảng Token Đặt Lại Mật Khẩu (password_reset_tokens)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Bảng Hồ Sơ Học Sinh (students)
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

-- 6. Bảng Sổ Điểm Điện Tử TT22 (grade_books)
CREATE TABLE IF NOT EXISTS grade_books (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  student_code VARCHAR(30) NOT NULL,
  student_name VARCHAR(100),
  class_name VARCHAR(30),
  subject_name VARCHAR(50),
  semester VARCHAR(10) DEFAULT 'HK1',
  school_year VARCHAR(20) DEFAULT '2024-2025',
  score_oral NUMERIC(3, 1) DEFAULT 0.0,
  score_oral_2 NUMERIC(3, 1),
  score_15m NUMERIC(3, 1) DEFAULT 0.0,
  score_15m_2 NUMERIC(3, 1),
  score_1hour NUMERIC(3, 1) DEFAULT 0.0,
  score_mid_term NUMERIC(3, 1) DEFAULT 0.0,
  score_final_term NUMERIC(3, 1) DEFAULT 0.0,
  average_score NUMERIC(3, 1) DEFAULT 0.0,
  grade_letter VARCHAR(20) DEFAULT 'Chưa xếp loại',
  teacher_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'APPROVED',
  CONSTRAINT uq_grade_books_unique UNIQUE (student_code, subject_name, class_name, semester, school_year)
);

-- 7. Bảng Điểm Danh Chuyên Cần (attendances)
-- Nâng cấp UAT-06: hỗ trợ điểm danh 2 cấp (GVCN đầu giờ period=0 & GVBM theo tiết period=1..10)
CREATE TABLE IF NOT EXISTS attendances (
  id           SERIAL PRIMARY KEY,
  student_id   INT REFERENCES students(id) ON DELETE CASCADE,
  student_code VARCHAR(30)  NOT NULL,
  student_name VARCHAR(100),
  class_name   VARCHAR(30),
  att_date     VARCHAR(20)  NOT NULL,
  -- period: 0 = điểm danh đầu giờ GVCN, 1..10 = tiết học GVBM
  period       INT          NOT NULL DEFAULT 0,
  subject_name VARCHAR(100) DEFAULT NULL,  -- tên môn học (NULL nếu period=0)
  recorded_by  VARCHAR(100) DEFAULT NULL,  -- username người điểm danh
  late_minutes INT          DEFAULT 0,     -- số phút đi trễ (chỉ dùng khi status=LATE)
  status       VARCHAR(30)  NOT NULL,
  note         TEXT,
  -- UNIQUE theo (student_code, class_name, att_date, period): GVCN và GVBM không ghi đè nhau
  CONSTRAINT uq_attendance_student_date_period UNIQUE (student_code, class_name, att_date, period)
);

-- 8. Bảng Đơn Xin Nghỉ Học (leave_requests)
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

-- 9. Bảng Quản Lý Học Phí (tuitions)
CREATE TABLE IF NOT EXISTS tuitions (
  id SERIAL PRIMARY KEY,
  student_code VARCHAR(30) NOT NULL,
  student_name VARCHAR(100),
  class_name VARCHAR(30),
  semester VARCHAR(10) DEFAULT 'HK1',
  school_year VARCHAR(20) DEFAULT '2024-2025',
  item_name VARCHAR(150),
  amount_due NUMERIC(12, 2) DEFAULT 0.00,
  amount_paid NUMERIC(12, 2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'UNPAID',
  receipt_no VARCHAR(50)
);

-- 10. Bảng Giao Dịch Thanh Toán VietQR & Đối Soát (payments)
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_code VARCHAR(50) UNIQUE NOT NULL,
  tuition_id INT NOT NULL REFERENCES tuitions(id) ON DELETE CASCADE,
  student_code VARCHAR(30) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(30) DEFAULT 'VIETQR',
  bank_bin VARCHAR(10) DEFAULT '970422',
  bank_account_no VARCHAR(50) DEFAULT '0388888888',
  bank_transaction_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'OPEN',
  receipt_no VARCHAR(50) UNIQUE,
  payer_name VARCHAR(100),
  payer_phone VARCHAR(20),
  proof_image TEXT,
  note TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Bảng Quan Hệ Phụ Huynh - Học Sinh (parent_students)
CREATE TABLE IF NOT EXISTS parent_students (
  id SERIAL PRIMARY KEY,
  parent_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_code VARCHAR(30) NOT NULL REFERENCES students(student_code) ON DELETE CASCADE,
  relationship VARCHAR(50) DEFAULT 'Phụ huynh',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (parent_user_id, student_code)
);

-- 12. Bảng Thời Khóa Biểu Hàng Tuần (schedules)
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  class_id VARCHAR(30) NOT NULL,
  week_start VARCHAR(20) NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  period INT NOT NULL CHECK (period BETWEEN 1 AND 10),
  subject_name VARCHAR(100),
  teacher_name VARCHAR(100),
  room VARCHAR(50),
  time_range VARCHAR(30),
  UNIQUE (class_id, week_start, day_of_week, period)
);

-- 13. Bảng Lịch Cố Định Hàng Tuần (schedule_templates)
CREATE TABLE IF NOT EXISTS schedule_templates (
  id SERIAL PRIMARY KEY,
  class_id VARCHAR(30) NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  period INT NOT NULL CHECK (period BETWEEN 1 AND 10),
  subject_name VARCHAR(100),
  teacher_name VARCHAR(100),
  room VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (class_id, day_of_week, period)
);

-- 14. Bảng Chốt Sổ & Yêu Cầu Mở Khóa (grade_book_closures)
CREATE TABLE IF NOT EXISTS grade_book_closures (
  id SERIAL PRIMARY KEY,
  class_id VARCHAR(30) NOT NULL,
  class_name VARCHAR(30) NOT NULL,
  gvcn_name VARCHAR(100),
  semester VARCHAR(10) NOT NULL DEFAULT 'HK1',
  school_year VARCHAR(20) NOT NULL DEFAULT '2024-2025',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  UNIQUE (class_id, semester, school_year)
);

-- 15. Bảng Thông Báo Toàn Trường (notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type VARCHAR(30) NOT NULL DEFAULT 'general',
  sender_id VARCHAR(50),
  sender_role VARCHAR(30),
  related_class VARCHAR(30),
  related_semester VARCHAR(10),
  recipients TEXT[],
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'sent'
);

-- 16. Bảng Tin Nhắn Sổ Liên Lạc (parent_messages)
CREATE TABLE IF NOT EXISTS parent_messages (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(30) NOT NULL,
  class_name VARCHAR(30),
  from_role VARCHAR(10) NOT NULL DEFAULT 'gv',
  sender_id INT REFERENCES users(id),
  conversation_type VARCHAR(20) NOT NULL DEFAULT 'GVCN',
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- 17. Bảng Cài Đặt Hệ Thống & Ma Trận Phân Quyền (system_settings)
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Bảng Nhật Ký Kiểm Toán Tập Trung (audit_logs - Non-Repudiation)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  action VARCHAR(50) NOT NULL,
  username VARCHAR(50) NOT NULL,
  role VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100),
  previous_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(45)
);

-- =============================================================================
-- INDEXES TỐI ƯU HÓA HIỆU NĂNG TRUY VẤN
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_students_class_name ON students(class_name);
CREATE INDEX IF NOT EXISTS idx_students_student_code ON students(student_code);
CREATE INDEX IF NOT EXISTS idx_grade_books_search ON grade_books(student_code, subject_name, semester);
CREATE INDEX IF NOT EXISTS idx_grade_books_class_subject_sem ON grade_books(class_name, subject_name, semester);
CREATE INDEX IF NOT EXISTS idx_attendances_class_date ON attendances(class_name, att_date);
CREATE INDEX IF NOT EXISTS idx_attendances_class_date_status ON attendances(class_name, att_date, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(username, action, timestamp);
CREATE INDEX IF NOT EXISTS idx_leave_requests_student ON leave_requests(student_code, status);
CREATE INDEX IF NOT EXISTS idx_tuitions_student ON tuitions(student_code, status);
CREATE INDEX IF NOT EXISTS idx_payments_tuition_id ON payments(tuition_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_code ON payments(order_code);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =============================================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA - PASSWORD HASH: password123)
-- =============================================================================
INSERT INTO subjects (code, name, credits) VALUES
('MATH', 'Toán Học', 2),
('LIT', 'Ngữ Văn', 2),
('ENG', 'Tiếng Anh', 2),
('PHYS', 'Vật Lý', 1),
('CHEM', 'Hóa Học', 1),
('BIO', 'Sinh Học', 1),
('HIST', 'Lịch Sử', 1),
('GEO', 'Địa Lý', 1)
ON CONFLICT (code) DO NOTHING;

INSERT INTO school_classes (class_name, grade_level, gvcn_name) VALUES
('10A1', 10, 'Lê Minh Châu'),
('10A2', 10, 'Phạm Thị Dung'),
('11B1', 11, 'Nguyễn Văn An')
ON CONFLICT (class_name) DO NOTHING;

-- Mật khẩu chuẩn mã hóa bcrypt cho toàn bộ tài khoản demo: password123
INSERT INTO users (username, password, full_name, role, email) VALUES
('admin', '$2a$10$h0PpBO63hUVuW.ZDb7fjSu22y.fPM/kFrDgTXhxW1GH04NGJNzeSS', 'Hiệu trưởng Trần Quốc Bảo', 'BGH', 'admin@hsu.edu.vn'),
('bgh.admin', '$2a$10$h0PpBO63hUVuW.ZDb7fjSu22y.fPM/kFrDgTXhxW1GH04NGJNzeSS', 'Hiệu phó Nguyễn Văn Minh', 'BGH', 'minh.nv@hsu.edu.vn'),
('gvcn01', '$2a$10$h0PpBO63hUVuW.ZDb7fjSu22y.fPM/kFrDgTXhxW1GH04NGJNzeSS', 'Lê Minh Châu (GVCN 10A1)', 'GVCN', 'chau.lm@hsu.edu.vn'),
('gvcn.10a1', '$2a$10$h0PpBO63hUVuW.ZDb7fjSu22y.fPM/kFrDgTXhxW1GH04NGJNzeSS', 'Lê Minh Châu (GVCN 10A1)', 'GVCN', 'chau.le@hsu.edu.vn'),
('gv01', '$2a$10$h0PpBO63hUVuW.ZDb7fjSu22y.fPM/kFrDgTXhxW1GH04NGJNzeSS', 'Nguyễn Văn An (GV Toán)', 'GV', 'an.nv@hsu.edu.vn'),
('gv.an', '$2a$10$h0PpBO63hUVuW.ZDb7fjSu22y.fPM/kFrDgTXhxW1GH04NGJNzeSS', 'Nguyễn Văn An (GV Toán)', 'GV', 'an.toan@hsu.edu.vn'),
('hs001', '$2a$10$h0PpBO63hUVuW.ZDb7fjSu22y.fPM/kFrDgTXhxW1GH04NGJNzeSS', 'Nguyễn Thị Ánh', 'HS', 'anh.nt@student.hsu.edu.vn'),
('hs.anh', '$2a$10$h0PpBO63hUVuW.ZDb7fjSu22y.fPM/kFrDgTXhxW1GH04NGJNzeSS', 'Nguyễn Thị Ánh', 'HS', 'anh.hs001@student.hsu.edu.vn'),
('ph001', '$2a$10$h0PpBO63hUVuW.ZDb7fjSu22y.fPM/kFrDgTXhxW1GH04NGJNzeSS', 'Nguyễn Thị Hương (PH em Ánh)', 'PH', 'huong.ph@gmail.com'),
('ph.hs0001', '$2a$10$h0PpBO63hUVuW.ZDb7fjSu22y.fPM/kFrDgTXhxW1GH04NGJNzeSS', 'Nguyễn Thị Hương (PH HS001)', 'PH', 'huong.parent@gmail.com')
ON CONFLICT (username) DO NOTHING;

INSERT INTO students (student_code, full_name, gender, dob, class_name, parent_name, parent_phone, gpa, academic_rank, status) VALUES
('HS001', 'Nguyễn Thị Ánh', 'Nữ', '2008-05-12', '10A1', 'Nguyễn Thị Hương', '0901234567', 8.7, 'Tốt', 'ACTIVE'),
('HS002', 'Trần Văn Bảo', 'Nam', '2008-03-22', '10A1', 'Trần Văn Hùng', '0907654321', 6.8, 'Khá', 'ACTIVE'),
('HS003', 'Lê Thị Cẩm', 'Nữ', '2008-11-10', '10A1', 'Lê Văn Tâm', '0912345678', 5.2, 'Đạt', 'ACTIVE'),
('HS004', 'Phạm Hữu Dũng', 'Nam', '2008-01-15', '10A1', 'Phạm Thị Lan', '0922334455', 8.5, 'Tốt', 'ACTIVE'),
('HS005', 'Đặng Thị Giang', 'Nữ', '2008-07-08', '10A2', 'Đặng Văn Nam', '0933445566', 7.2, 'Khá', 'ACTIVE')
ON CONFLICT (student_code) DO NOTHING;

INSERT INTO parent_students (parent_user_id, student_code, relationship)
SELECT u.id, 'HS001', 'Phụ huynh'
FROM users u
WHERE u.username = 'ph.hs0001'
ON CONFLICT (parent_user_id, student_code) DO NOTHING;
