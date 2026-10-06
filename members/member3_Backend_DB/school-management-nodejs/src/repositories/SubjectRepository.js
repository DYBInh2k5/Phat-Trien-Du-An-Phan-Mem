import { query } from '../config/db.js';

export class SubjectRepository {
  static async findAll() {
    const res = await query('SELECT * FROM subjects ORDER BY code ASC');
    return res.rows;
  }

  static async create(s) {
    const res = await query(
      'INSERT INTO subjects (code, name, credits) VALUES ($1, $2, $3) RETURNING *',
      [s.code, s.name, s.credits || 1]
    );
    return res.rows[0];
  }
}
