import { query } from '../config/db.js';

const defaultDb = { query };

export class UserRepository {
  static async findByUsername(username) {
    const res = await query('SELECT * FROM users WHERE username = $1', [username]);
    return res.rows[0] || null;
  }

  static async findByUsernameAndRole(username, role) {
    const res = await query('SELECT * FROM users WHERE username = $1 AND role = $2', [username, role]);
    return res.rows[0] || null;
  }

  static async create(user) {
    const res = await query(
      'INSERT INTO users (username, password, full_name, role, email, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user.username, user.password, user.fullName, user.role, user.email || null, user.isActive !== false]
    );
    return res.rows[0];
  }

  static async findAll() {
    const res = await query(
      'SELECT id, username, full_name, role, email, is_active, created_at FROM users ORDER BY id ASC'
    );
    return res.rows;
  }

  static async findById(id) {
    const res = await query(
      'SELECT id, username, full_name, role, email, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
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
    return res.rows[0] || null;
  }

  /**
   * Vô hiệu hóa tài khoản (set is_active = false).
   */
  static async deactivate(id) {
    const res = await query(
      'UPDATE users SET is_active = FALSE WHERE id = $1 RETURNING id, username, full_name, role, is_active',
      [id]
    );
    return res.rows[0] || null;
  }

  /**
   * Xóa hẳn tài khoản khỏi DB (chỉ dùng cho tài khoản đã bị vô hiệu hóa).
   */
  static async deleteById(id) {
    const res = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return res.rowCount > 0;
  }

  // ===== Authentication helpers =====

  /** Tìm tài khoản theo email (không phân biệt hoa thường). Không trả về password hash. */
  static async findByEmail(email) {
    const res = await query(
      'SELECT id, username, full_name, role, email FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return res.rows[0] || null;
  }

  /** Dùng cho authMiddleware: lấy phiên bản token hiện tại của tài khoản. */
  static async findAuthStateById(id) {
    const res = await query('SELECT id, token_version, is_active FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  /**
   * Đổi mật khẩu và tăng token_version để mọi JWT đã cấp trước đó mất hiệu lực.
   */
  static async updatePasswordAndRevokeSessions(userId, passwordHash, db = defaultDb) {
    const res = await db.query(
      'UPDATE users SET password = $2, token_version = token_version + 1 WHERE id = $1',
      [userId, passwordHash]
    );
    return res.rowCount === 1;
  }
}