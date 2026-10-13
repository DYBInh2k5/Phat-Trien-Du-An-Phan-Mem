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
      'INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [user.username, user.password, user.fullName, user.role]
    );
    return res.rows[0];
  }

  static async findAll() {
    const res = await query('SELECT id, username, full_name, role, created_at FROM users');
    return res.rows;
  }

  // ===== Quên mật khẩu =====

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
    const res = await query('SELECT id, token_version FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  /**
   * Đổi mật khẩu và tăng token_version để mọi JWT đã cấp trước đó mất hiệu lực.
   * Truyền `db` (client của transaction) để chạy chung transaction với việc đánh dấu token đã dùng.
   */
  static async updatePasswordAndRevokeSessions(userId, passwordHash, db = defaultDb) {
    const res = await db.query(
      'UPDATE users SET password = $2, token_version = token_version + 1 WHERE id = $1',
      [userId, passwordHash]
    );
    return res.rowCount === 1;
  }
}