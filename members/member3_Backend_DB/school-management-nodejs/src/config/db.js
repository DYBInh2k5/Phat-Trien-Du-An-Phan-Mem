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

export async function query(text, params = []) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.warn(`[DB WARN] PostgreSQL query failed ("${text}"): ${err.message}. Using fallback memory store.`);
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
    `);
  } catch (err) {
    console.warn('[DB INIT WARN] Fallback to Memory Data Store.');
  }
}
