/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/config/db.js
 * Vai trò: Hồ Chứa Kết Nối Cơ Sở Dữ Liệu (Database Connection Pool & Schema DDL)
 * Kiến trúc: Clean Architecture - Tầng Hạ Tầng Cơ Sở Dữ Liệu (Database Infrastructure)
 * Hệ quản trị CSDL: PostgreSQL 15 (Docker Container trên cổng 5434)
 * Mô tả:
 *   - Khởi tạo hồ chứa kết nối pg.Pool với dung lượng tối đa 10 kết nối đồng thời.
 *   - Định nghĩa hàm query tổng quát hỗ trợ câu truy vấn tham số hóa ($1, $2) chống SQL Injection.
 *   - Tích hợp cơ chế kiên cường dự phòng (Graceful Memory Fallback): nếu CSDL Docker chưa bật,
 *     hệ thống tự động sử dụng kho dữ liệu bộ nhớ tạm thời mà không bị sập.
 *   - Khởi tạo tự động 8 bảng dữ liệu quan hệ chuẩn 3NF (DDL Schema Initialization).
 * ==============================================================================
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * Hồ chứa kết nối cơ sở dữ liệu PostgreSQL (Connection Pool).
 * Sử dụng hồ chứa giúp tái sử dụng các kết nối TCP đã mở, loại bỏ chi phí
 * thiết lập kết nối tốn kém trong mỗi yêu cầu HTTP.
 */
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  // Cổng 5434 được ánh xạ từ cổng 5432 của Container để tránh xung đột với PostgreSQL cục bộ
  port: parseInt(process.env.DB_PORT || '5434', 10),
  database: process.env.DB_NAME || 'school_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 10,                      // Tối đa 10 kết nối đồng thời trong hồ chứa
  idleTimeoutMillis: 10000,     // Thu hồi kết nối sau 10 giây không có hoạt động
  connectionTimeoutMillis: 2000 // Hủy yêu cầu nếu quá 2 giây không mượn được kết nối
});

/**
 * query() - Strict: throws nếu có lỗi DB. Dùng cho authentication (UserRepository).
 * @async
 * @param {string} text - Câu lệnh SQL (ví dụ: 'SELECT * FROM students WHERE id = $1')
 * @param {Array<any>} [params=[]] - Mảng giá trị tham số tương ứng với $1, $2, ...
 * @returns {Promise<import('pg').QueryResult>} Kết quả trả về từ PostgreSQL
 */
export async function query(text, params = []) {
  const res = await pool.query(text, params);
  return res;
}

/**
 * querySafe() - Soft: trả null nếu DB lỗi. Dùng cho các repository có in-memory fallback.
 */
export async function querySafe(text, params = []) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    // Khi CSDL chưa bật hoặc mất kết nối, ghi cảnh báo và trả về null để tầng Repository kích hoạt kho nhớ dự phòng
    console.warn(`[DB WARN] PostgreSQL query failed ("${text.substring(0, 60)}..."): ${err.message}`);
    return null;
  }
}

/**
 * Hàm khởi tạo tự động lược đồ 8 bảng CSDL quan hệ chuẩn 3NF (Data Definition Language)
 * Được gọi một lần duy nhất khi máy chủ Express bắt đầu khởi động.
 * @async
 */
export async function initDatabaseSchema() {
  console.log('[DB INIT] Initializing PostgreSQL database tables...');
  try {
    await query(`
      -- 1. BẢNG TÀI KHOẢN NGƯỜI DÙNG & PHÂN QUYỀN RBAC
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(30) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 2. BẢNG HỒ SƠ HỌC SINH TOÀN TRƯỜNG
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

      -- 3. BẢNG SỔ ĐIỂM ĐIỆN TỬ THEO QUY CHẾ THÔNG TƯ 22/2021/TT-BGDĐT
      CREATE TABLE IF NOT EXISTS grade_books (
        id SERIAL PRIMARY KEY,
        student_id INT,
        student_code VARCHAR(30) NOT NULL,
        student_name VARCHAR(100),
        class_name VARCHAR(30),
        subject_name VARCHAR(50),
        semester VARCHAR(10),
        school_year VARCHAR(20),
        score_oral NUMERIC(3, 1),         -- Điểm kiểm tra miệng (hệ số 1)
        score_15m NUMERIC(3, 1),          -- Điểm kiểm tra 15 phút (hệ số 1)
        score_1hour NUMERIC(3, 1),        -- Điểm kiểm tra 1 tiết (hệ số 2)
        score_mid_term NUMERIC(3, 1),     -- Điểm đánh giá giữa kỳ (hệ số 2)
        score_final_term NUMERIC(3, 1),   -- Điểm đánh giá cuối kỳ (hệ số 3)
        average_score NUMERIC(3, 1),      -- Điểm trung bình môn học kỳ
        grade_letter VARCHAR(20),         -- Đánh giá xếp loại môn học (Đạt / Chưa đạt)
        status VARCHAR(20) DEFAULT 'APPROVED' -- Trạng thái: DRAFT / APPROVED / LOCKED
      );

      -- 4. BẢNG ĐIỂM DANH CHUYÊN CẦN HÀNG NGÀY
      CREATE TABLE IF NOT EXISTS attendances (
        id SERIAL PRIMARY KEY,
        student_id INT,
        student_code VARCHAR(30) NOT NULL,
        student_name VARCHAR(100),
        class_name VARCHAR(30),
        att_date VARCHAR(20) NOT NULL,
        status VARCHAR(30) NOT NULL,      -- PRESENT / LATE / ABSENT
        note TEXT
      );

      -- 5. BẢNG ĐƠN XIN NGHỈ PHÉP TỪ PHỤ HUYNH
      CREATE TABLE IF NOT EXISTS leave_requests (
        id SERIAL PRIMARY KEY,
        student_id INT,
        student_code VARCHAR(30) NOT NULL,
        student_name VARCHAR(100),
        class_name VARCHAR(30),
        from_date VARCHAR(20),
        to_date VARCHAR(20),
        reason TEXT,
        status VARCHAR(20) DEFAULT 'PENDING', -- PENDING / APPROVED / REJECTED
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 6. BẢNG THEO DÕI HỌC PHÍ & BIÊN LAI THU TIỀN
      CREATE TABLE IF NOT EXISTS tuitions (
        id SERIAL PRIMARY KEY,
        student_code VARCHAR(30) NOT NULL,
        student_name VARCHAR(100),
        class_name VARCHAR(30),
        semester VARCHAR(10),
        school_year VARCHAR(20),
        amount_due NUMERIC(12, 2),        -- Số tiền học phí phải đóng
        amount_paid NUMERIC(12, 2) DEFAULT 0, -- Số tiền thực tế đã nộp
        status VARCHAR(20) DEFAULT 'UNPAID',  -- PAID / PARTIAL / UNPAID
        receipt_no VARCHAR(50)            -- Số biên lai hóa đơn điện tử
      );

      -- 7. BẢNG DANH MỤC LỚP HỌC
      CREATE TABLE IF NOT EXISTS school_classes (
        id SERIAL PRIMARY KEY,
        class_name VARCHAR(30) UNIQUE NOT NULL,
        grade_level INT,                  -- Khối lớp: 10, 11, 12
        gvcn_name VARCHAR(100)            -- Tên giáo viên chủ nhiệm phụ trách
      );

      -- 8. BẢNG DANH MỤC MÔN HỌC
      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(50) NOT NULL,
        credits INT DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        class_id   VARCHAR(30) NOT NULL,
        week_start VARCHAR(20) NOT NULL,
        day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
        period     INT NOT NULL CHECK (period BETWEEN 1 AND 10),
        subject_name VARCHAR(100),
        teacher_name VARCHAR(100),
        room         VARCHAR(50),
        time_range   VARCHAR(30),
        UNIQUE (class_id, week_start, day_of_week, period)
      );
      CREATE TABLE IF NOT EXISTS grade_book_closures (
        id           SERIAL PRIMARY KEY,
        class_id     VARCHAR(30) NOT NULL,
        class_name   VARCHAR(30) NOT NULL,
        gvcn_name    VARCHAR(100),
        semester     VARCHAR(10) NOT NULL DEFAULT 'HK1',
        school_year  VARCHAR(20) NOT NULL DEFAULT '2024-2025',
        status       VARCHAR(20) NOT NULL DEFAULT 'pending',
        submitted_at TIMESTAMPTZ,
        approved_at  TIMESTAMPTZ,
        UNIQUE (class_id, semester, school_year)
      );
      CREATE TABLE IF NOT EXISTS notifications (
        id          SERIAL PRIMARY KEY,
        title       VARCHAR(255) NOT NULL,
        content     TEXT,
        type        VARCHAR(30)  NOT NULL DEFAULT 'general',
        sender_id   VARCHAR(50),
        recipients  TEXT[],
        sent_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        status      VARCHAR(20)  NOT NULL DEFAULT 'sent'
      );
      CREATE TABLE IF NOT EXISTS parent_messages (
        id          SERIAL PRIMARY KEY,
        student_id  VARCHAR(30) NOT NULL,
        class_name  VARCHAR(30),
        from_role   VARCHAR(10)  NOT NULL DEFAULT 'gv',
        message     TEXT         NOT NULL,
        sent_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS system_settings (
        key         VARCHAR(100) PRIMARY KEY,
        value       JSONB        NOT NULL,
        updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // ===== Chức năng quên mật khẩu + migration homeroom_teacher_id =====
    await query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
        ON users (LOWER(email)) WHERE email IS NOT NULL;

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash CHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id
        ON password_reset_tokens (user_id);

      ALTER TABLE school_classes ADD COLUMN IF NOT EXISTS homeroom_teacher_id INTEGER REFERENCES users(id);

      -- UNIQUE constraint để UPSERT grade_books hoạt động đúng (tránh duplicate rows)
      ALTER TABLE grade_books
        ADD COLUMN IF NOT EXISTS school_year VARCHAR(20);
      ALTER TABLE grade_books
        ADD COLUMN IF NOT EXISTS score_oral_2 NUMERIC(3,1);
      ALTER TABLE grade_books
        ADD COLUMN IF NOT EXISTS score_15m_2  NUMERIC(3,1);
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'uq_grade_books_student_subject_class_sem_year'
        ) THEN
          ALTER TABLE grade_books
            ADD CONSTRAINT uq_grade_books_student_subject_class_sem_year
            UNIQUE (student_code, subject_name, class_name, semester, school_year);
        END IF;
      END $$;
    `);

    // ===== UNIQUE constraint cho homeroom_teacher_id (1 lớp – 1 GVCN) =====
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS school_classes_homeroom_unique
        ON school_classes (homeroom_teacher_id)
        WHERE homeroom_teacher_id IS NOT NULL;
    `);

    // ===== Notifications: thêm cột mới cho hệ thống chốt sổ điểm =====
    await query(`
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_role VARCHAR(30);
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_class VARCHAR(30);
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_semester VARCHAR(10);
    `);

    // ===== Schedule Templates: lịch cố định hàng tuần (không gắn tuần cụ thể) =====
    await query(`
      CREATE TABLE IF NOT EXISTS schedule_templates (
        id           SERIAL PRIMARY KEY,
        class_id     VARCHAR(30) NOT NULL,
        day_of_week  INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
        period       INT NOT NULL CHECK (period BETWEEN 1 AND 10),
        subject_name VARCHAR(100),
        teacher_name VARCHAR(100),
        room         VARCHAR(50),
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (class_id, day_of_week, period)
      );
      ALTER TABLE schedule_templates ADD COLUMN IF NOT EXISTS subject_name VARCHAR(100);
      ALTER TABLE schedule_templates ADD COLUMN IF NOT EXISTS teacher_name VARCHAR(100);
      ALTER TABLE schedule_templates ADD COLUMN IF NOT EXISTS room VARCHAR(50);
    `);

    // ===== UNIQUE constraint cho attendances (idempotent) =====
    await query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'uq_attendances_student_class_date'
        ) THEN
          ALTER TABLE attendances
            ADD CONSTRAINT uq_attendances_student_class_date
            UNIQUE (student_code, class_name, att_date);
        END IF;
      END $$;
    `);

    // ===== Backfill schedule_templates từ schedules hiện có (idempotent) =====
    try {
      const backfillTemplates = await pool.query(`
        INSERT INTO schedule_templates (class_id, day_of_week, period, subject_name, teacher_name, room)
        SELECT DISTINCT ON (class_id, day_of_week, period)
          class_id, day_of_week, period, subject_name, teacher_name, room
        FROM schedules
        WHERE subject_name IS NOT NULL
        ORDER BY class_id, day_of_week, period, week_start DESC
        ON CONFLICT (class_id, day_of_week, period) DO UPDATE SET
          subject_name = EXCLUDED.subject_name,
          teacher_name = EXCLUDED.teacher_name,
          room         = EXCLUDED.room,
          updated_at   = NOW();
      `);
      if (backfillTemplates.rowCount > 0) {
        console.log(`[DB INIT] Backfilled ${backfillTemplates.rowCount} schedule_template rows from schedules.`);
      }
    } catch (backfillTemplatesErr) {
      console.warn('[DB INIT] schedule_templates backfill warning:', backfillTemplatesErr.message);
    }

    // Backfill homeroom_teacher_id từ gvcn_name → users.full_name (prefix match)
    // Seeder lưu full_name = 'Lê Minh Châu (GVCN 10A1)', còn school_classes.gvcn_name = 'Lê Minh Châu'
    // Chỉ cập nhật các hàng homeroom_teacher_id IS NULL để không ghi đè phân công hợp lệ
    try {
      const backfillResult = await pool.query(`
        UPDATE school_classes sc
        SET homeroom_teacher_id = u.id
        FROM users u
        WHERE u.role = 'GVCN'
          AND u.full_name LIKE sc.gvcn_name || '%'
          AND sc.homeroom_teacher_id IS NULL
      `);
      if (backfillResult.rowCount > 0) {
        console.log(`[DB INIT] Backfilled homeroom_teacher_id for ${backfillResult.rowCount} class(es).`);
      }
      // Báo cáo các lớp chưa khớp
      const unmatched = await pool.query(`
        SELECT class_name, gvcn_name FROM school_classes WHERE homeroom_teacher_id IS NULL AND gvcn_name IS NOT NULL
      `);
      if (unmatched.rows.length > 0) {
        console.warn('[DB INIT] Classes with unmatched homeroom_teacher_id:', unmatched.rows.map(r => `${r.class_name} (gvcn_name: ${r.gvcn_name})`).join(', '));
      }
    } catch (backfillErr) {
      console.warn('[DB INIT] homeroom_teacher_id backfill warning:', backfillErr.message);
    }

    // ===== Parent-Student relations & Message channels =====
    await query(`
      CREATE TABLE IF NOT EXISTS parent_students (
        id SERIAL PRIMARY KEY,
        parent_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        student_code VARCHAR(30) NOT NULL REFERENCES students(student_code) ON DELETE CASCADE,
        relationship VARCHAR(50) DEFAULT 'Phụ huynh',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (parent_user_id, student_code)
      );

      ALTER TABLE parent_messages ADD COLUMN IF NOT EXISTS conversation_type VARCHAR(20) NOT NULL DEFAULT 'GVCN';
      ALTER TABLE parent_messages ADD COLUMN IF NOT EXISTS sender_id INT REFERENCES users(id);
      ALTER TABLE parent_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

      -- Chuẩn hóa tin nhắn do BGH gửi về đúng kênh BGH
      UPDATE parent_messages
      SET conversation_type = 'BGH'
      WHERE from_role = 'bgh' AND (conversation_type IS NULL OR conversation_type != 'BGH');
    `);

    try {
      await pool.query(`
        INSERT INTO parent_students (parent_user_id, student_code, relationship)
        SELECT u.id, 'HS001', 'Phụ huynh'
        FROM users u
        WHERE u.username = 'ph.hs0001'
        ON CONFLICT (parent_user_id, student_code) DO NOTHING;
      `);
    } catch (parentRelErr) {
      console.warn('[DB INIT] parent_students backfill warning:', parentRelErr.message);
    }
  } catch (err) {
    console.error('[DB INIT ERROR] Không thể khởi tạo schema PostgreSQL:', err.message);
    throw err;
  }
}

export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
