import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5434', 10),
  database: process.env.DB_NAME || 'school_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000,
});

/**
 * query() - Strict: throws nếu có lỗi DB. Dùng cho authentication (UserRepository).
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
    console.warn(`[DB WARN] PostgreSQL query failed ("${text.substring(0, 60)}..."): ${err.message}`);
    return null;
  }
}


export async function initDatabaseSchema() {
  console.log('[DB INIT] Initializing PostgreSQL database tables...');
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(30) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
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
      CREATE TABLE IF NOT EXISTS school_classes (
        id SERIAL PRIMARY KEY,
        class_name VARCHAR(30) UNIQUE NOT NULL,
        grade_level INT,
        gvcn_name VARCHAR(100)
      );
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
    `);
    // ===== Chức năng quên mật khẩu =====
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
    `);
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
