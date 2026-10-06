import { query } from '../config/db.js';

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
}
