/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/repositories/UserRepository.js
 * Vai trò: Kho Lưu Trữ Dữ Liệu Tài Khoản & Phân Quyền (User Data Access Repository)
 * Kiến trúc: Clean Architecture - Data Access Layer (Repositories)
 * Tác giả: Huỳnh Trung Tính (Dev Backend & DBA) & Võ Duy Bình (Reviewer)
 * Ngày cập nhật: 17/11/2026
 * Mô tả:
 *   - Thực thi các câu lệnh SQL tác động lên bảng 'users' chống SQL Injection.
 *   - Tích hợp kho nhớ dự phòng (In-Memory Fallback) giúp hệ thống vẫn đăng nhập
 *     và demo 5 vai trò trơn tru ngay cả khi Docker PostgreSQL đang được tắt.
 * ==============================================================================
 */

import { querySafe as query } from '../config/db.js';

const defaultDb = { query };

/**
 * Kho dữ liệu người dùng bộ nhớ dự phòng (In-Memory Fallback Store).
 * Hỗ trợ đăng nhập tức thì cho 5 vai trò theo cả tài khoản demo 1-Click và tài khoản chuẩn.
 */
let memUsers = [
  { id: 1, username: 'bgh.admin', password: '$2a$10$FSxwXONhCEW5Gd/lW85We.8yc4nndH0ua7RbLzffFkpeifaWbbuoK', full_name: 'Hiệu trưởng Trần Quốc Bảo', role: 'BGH', email: 'admin@hsu.edu.vn', is_active: true, token_version: 0 },
  { id: 2, username: 'admin', password: '$2a$10$6HQ29vumdapvhJLTv5YiMep7ZrS9Np5TbMqXjEh0186ZI6/rOTlEe', full_name: 'Quản Trị Viên Hệ Thống', role: 'BGH', email: 'admin@school.edu.vn', is_active: true, token_version: 0 },
  { id: 3, username: 'bgh_nam', password: '$2a$10$2Q47hukwGijAzpQfdBGuveD.XYOPCdNlKAkcan3sY2DqSy.S4X1cq', full_name: 'Nguyễn Văn Nam (Hiệu trưởng)', role: 'BGH', email: 'nam.nv@school.edu.vn', is_active: true, token_version: 0 },
  { id: 4, username: 'gvcn.10a1', password: '$2a$10$FSxwXONhCEW5Gd/lW85We.8yc4nndH0ua7RbLzffFkpeifaWbbuoK', full_name: 'Lê Minh Châu (GVCN 10A1)', role: 'GVCN', email: 'chau.lm@hsu.edu.vn', is_active: true, token_version: 0 },
  { id: 5, username: 'gvcn01', password: '$2a$10$B8dCIRdMI0upmL4wP2GQSuh2VXECv6TgOw82soI1DxsFyslDXPtXW', full_name: 'Lê Minh Châu (GVCN 10A1)', role: 'GVCN', email: 'chau.le@hsu.edu.vn', is_active: true, token_version: 0 },
  { id: 6, username: 'gvcn_minh', password: '$2a$10$2Q47hukwGijAzpQfdBGuveD.XYOPCdNlKAkcan3sY2DqSy.S4X1cq', full_name: 'Trần Thị Minh (GVCN 10A1)', role: 'GVCN', email: 'minh.tt@school.edu.vn', is_active: true, token_version: 0 },
  { id: 7, username: 'gv.an', password: '$2a$10$FSxwXONhCEW5Gd/lW85We.8yc4nndH0ua7RbLzffFkpeifaWbbuoK', full_name: 'Nguyễn Văn An (GV Toán)', role: 'GV', email: 'an.nv@hsu.edu.vn', is_active: true, token_version: 0 },
  { id: 8, username: 'gv01', password: '$2a$10$nX5yRiyxqhAUM0rYTdAxkeEjIse2nu9HzsT7mMgW8TMHcL72aTuYe', full_name: 'Nguyễn Văn An (GV Toán)', role: 'GV', email: 'an.toan@hsu.edu.vn', is_active: true, token_version: 0 },
  { id: 9, username: 'gvbm_hoa', password: '$2a$10$2Q47hukwGijAzpQfdBGuveD.XYOPCdNlKAkcan3sY2DqSy.S4X1cq', full_name: 'Lê Văn Hoa (GV Môn Toán)', role: 'GV', email: 'hoa.lv@school.edu.vn', is_active: true, token_version: 0 },
  { id: 10, username: 'hs.anh', password: '$2a$10$FSxwXONhCEW5Gd/lW85We.8yc4nndH0ua7RbLzffFkpeifaWbbuoK', full_name: 'Nguyễn Thị Ánh', role: 'HS', email: 'anh.nt@student.hsu.edu.vn', is_active: true, token_version: 0 },
  { id: 11, username: 'hs001', password: '$2a$10$SfiQ4Rq3QJZNjinU/lLtueRMzt6SbUGUgmfJmarvOOg9pvDC001H2', full_name: 'Nguyễn Thị Ánh', role: 'HS', email: 'anh.hs001@student.hsu.edu.vn', is_active: true, token_version: 0 },
  { id: 12, username: 'ph.hs0001', password: '$2a$10$FSxwXONhCEW5Gd/lW85We.8yc4nndH0ua7RbLzffFkpeifaWbbuoK', full_name: 'Nguyễn Thị Hương (PH em Ánh)', role: 'PH', email: 'huong.ph@gmail.com', is_active: true, token_version: 0 },
  { id: 13, username: 'ph001', password: '$2a$10$.VyuJdzd8jNry2yn3XyepeFCYK2gox68rR0FuS.1yTPF..rBQls2a', full_name: 'Nguyễn Thị Hương (PH em Ánh)', role: 'PH', email: 'huong.parent@gmail.com', is_active: true, token_version: 0 },
  { id: 14, username: 'ph_an', password: '$2a$10$2Q47hukwGijAzpQfdBGuveD.XYOPCdNlKAkcan3sY2DqSy.S4X1cq', full_name: 'Phạm Thị An (Phụ huynh)', role: 'PH', email: 'an.pt@gmail.com', is_active: true, token_version: 0 }
];

export class UserRepository {
  static async findByUsername(username) {
    const res = await query('SELECT * FROM users WHERE username = $1', [username]);
    if (res && res.rows) return res.rows[0] || null;
    return memUsers.find(u => u.username.toLowerCase() === String(username).toLowerCase()) || null;
  }

  static async findByUsernameAndRole(username, role) {
    const res = await query('SELECT * FROM users WHERE username = $1 AND role = $2', [username, role]);
    if (res && res.rows) return res.rows[0] || null;
    return memUsers.find(u => u.username.toLowerCase() === String(username).toLowerCase() && u.role === role) || null;
  }

  static async create(user) {
    const res = await query(
      'INSERT INTO users (username, password, full_name, role, email, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user.username, user.password, user.fullName, user.role, user.email || null, user.isActive !== false]
    );
    if (res && res.rows) return res.rows[0];
    const newUser = {
      id: memUsers.length + 1,
      username: user.username,
      password: user.password,
      full_name: user.fullName,
      role: user.role,
      email: user.email || null,
      is_active: user.isActive !== false,
      token_version: 0
    };
    memUsers.push(newUser);
    return newUser;
  }

  static async findAll() {
    const res = await query(
      'SELECT id, username, full_name, role, email, is_active, created_at FROM users ORDER BY id ASC'
    );
    if (res && res.rows) return res.rows;
    return memUsers;
  }

  static async findById(id) {
    const res = await query(
      'SELECT id, username, full_name, role, email, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    if (res && res.rows) return res.rows[0] || null;
    return memUsers.find(u => Number(u.id) === Number(id)) || null;
  }

  /**
   * Cập nhật thông tin user (không đổi password nếu không truyền).
   */
  static async update(id, user) {
    const fields = [];
    const params = [];

    if (user.fullName !== undefined) { params.push(user.fullName); fields.push(`full_name = $${params.length}`); }
    if (user.email    !== undefined) { params.push(user.email);    fields.push(`email = $${params.length}`); }
    if (user.role     !== undefined) { params.push(user.role);     fields.push(`role = $${params.length}`); }
    if (user.isActive !== undefined) { params.push(user.isActive); fields.push(`is_active = $${params.length}`); }
    if (user.password && user.password.trim() !== '') {
      params.push(user.password);
      fields.push(`password = $${params.length}`);
    }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    const res = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${params.length}
       RETURNING id, username, full_name, role, email, is_active, created_at`,
      params
    );
    if (res && res.rows) return res.rows[0] || null;

    const existing = memUsers.find(u => Number(u.id) === Number(id));
    if (existing) {
      if (user.fullName !== undefined) existing.full_name = user.fullName;
      if (user.email !== undefined) existing.email = user.email;
      if (user.role !== undefined) existing.role = user.role;
      if (user.isActive !== undefined) existing.is_active = user.isActive;
      if (user.password && user.password.trim() !== '') existing.password = user.password;
    }
    return existing || null;
  }

  /**
   * Vô hiệu hóa tài khoản (set is_active = false).
   */
  static async deactivate(id) {
    const res = await query(
      'UPDATE users SET is_active = FALSE WHERE id = $1 RETURNING id, username, full_name, role, is_active',
      [id]
    );
    if (res && res.rows) return res.rows[0] || null;
    const existing = memUsers.find(u => Number(u.id) === Number(id));
    if (existing) existing.is_active = false;
    return existing || null;
  }

  /**
   * Xóa hẳn tài khoản khỏi DB (chỉ dùng cho tài khoản đã bị vô hiệu hóa).
   */
  static async deleteById(id) {
    const res = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    if (res) return res.rowCount > 0;
    const initialLen = memUsers.length;
    memUsers = memUsers.filter(u => Number(u.id) !== Number(id));
    return memUsers.length < initialLen;
  }

  // ===== Authentication helpers =====

  /** Tìm tài khoản theo email (không phân biệt hoa thường). Không trả về password hash. */
  static async findByEmail(email) {
    const res = await query(
      'SELECT id, username, full_name, role, email FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    if (res && res.rows) return res.rows[0] || null;
    return memUsers.find(u => u.email && u.email.toLowerCase() === String(email).toLowerCase()) || null;
  }

  /**
   * Tra cứu email và họ tên của Phụ huynh liên kết với một mã học sinh (qua bảng parent_students)
   * @async
   * @param {string} studentCode - Mã định danh học sinh (VD: HS001)
   * @returns {Promise<{email: string, full_name: string}|null>}
   */
  static async findParentEmailByStudentCode(studentCode) {
    const res = await query(
      `SELECT u.email, u.full_name
       FROM users u
       JOIN parent_students ps ON ps.parent_user_id = u.id
       WHERE ps.student_code = $1 AND u.email IS NOT NULL AND u.email <> ''
       LIMIT 1`,
      [studentCode]
    );
    if (res && res.rows) return res.rows[0] || null;
    return null;
  }

  /**
   * Cập nhật hồ sơ cá nhân (full_name, email, phone).
   * Chỉ cập nhật các trường được truyền, bỏ qua trường không truyền.
   * Fallback in-memory khi DB offline.
   *
   * @async
   * @param {number} userId - ID người dùng (từ JWT)
   * @param {{ fullName?, email?, phone? }} fields - Các trường cần cập nhật
   * @returns {Promise<{ id, username, name, role, email, phone }>}
   */
  static async updateProfile(userId, { fullName, email, phone }) {
    // ── PostgreSQL ────────────────────────────────────────────────────────────
    const setClauses = [];
    const params     = [];

    if (fullName !== undefined) { params.push(fullName); setClauses.push(`full_name = $${params.length}`); }
    if (email    !== undefined) { params.push(email);    setClauses.push(`email = $${params.length}`); }
    if (phone    !== undefined) { params.push(phone);    setClauses.push(`phone = $${params.length}`); }

    if (setClauses.length > 0) {
      params.push(userId);
      const res = await query(
        `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING id, username, full_name, role, email, phone`,
        params
      );
      if (res && res.rows && res.rows.length > 0) {
        const u = res.rows[0];
        return { id: u.id, username: u.username, name: u.full_name, role: u.role, email: u.email, phone: u.phone };
      }
    }

    // ── Fallback in-memory ────────────────────────────────────────────────────
    const idx = memUsers.findIndex(u => Number(u.id) === Number(userId));
    if (idx === -1) throw new Error('Không tìm thấy tài khoản.');
    if (fullName !== undefined) memUsers[idx].full_name = fullName;
    if (email    !== undefined) memUsers[idx].email     = email;
    if (phone    !== undefined) memUsers[idx].phone     = phone;
    const u = memUsers[idx];
    return { id: u.id, username: u.username, name: u.full_name, role: u.role, email: u.email, phone: u.phone };
  }

  /** Dùng cho authMiddleware: lấy phiên bản token hiện tại của tài khoản. */
  static async findAuthStateById(id) {
    const res = await query('SELECT id, token_version, is_active FROM users WHERE id = $1', [id]);
    if (res && res.rows) return res.rows[0] || null;
    const u = memUsers.find(user => Number(user.id) === Number(id));
    if (!u) return null;
    return { id: u.id, token_version: u.token_version ?? 0, is_active: u.is_active !== false };
  }

  /**
   * Đổi mật khẩu và tăng token_version để mọi JWT đã cấp trước đó mất hiệu lực.
   */
  static async updatePasswordAndRevokeSessions(userId, passwordHash, db = defaultDb) {
    const res = await db.query(
      'UPDATE users SET password = $2, token_version = token_version + 1 WHERE id = $1',
      [userId, passwordHash]
    );
    if (res && res.rowCount !== undefined) return res.rowCount === 1;
    const u = memUsers.find(user => Number(user.id) === Number(userId));
    if (u) {
      u.password = passwordHash;
      u.token_version = (u.token_version ?? 0) + 1;
      return true;
    }
    return false;
  }
}
