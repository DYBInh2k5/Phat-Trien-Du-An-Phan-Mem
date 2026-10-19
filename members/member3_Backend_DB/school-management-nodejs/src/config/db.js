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
 * Hàm thực thi câu lệnh SQL với tham số hóa (Parameterized Query)
 * @async
 * @param {string} text - Câu lệnh SQL (ví dụ: 'SELECT * FROM students WHERE id = $1')
 * @param {Array<any>} [params=[]] - Mảng giá trị tham số tương ứng với $1, $2, ...
 * @returns {Promise<import('pg').QueryResult|null>} Kết quả trả về từ PostgreSQL hoặc null nếu mất kết nối
 */
export async function query(text, params = []) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    // Khi CSDL chưa bật hoặc mất kết nối, ghi cảnh báo và trả về null để tầng Repository kích hoạt kho nhớ dự phòng
    console.warn(`[DB WARN] PostgreSQL query failed ("${text}"): ${err.message}. Using fallback memory store.`);
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
    `);
  } catch (err) {
    console.warn('[DB INIT WARN] Fallback to Memory Data Store.');
  }
}
