import { query } from '../config/db.js';

export class ClassRepository {
  static async findAll() {
    const res = await query('SELECT * FROM school_classes ORDER BY class_name ASC');
    return res.rows;
  }

  static async create(sc) {
    const res = await query(
      'INSERT INTO school_classes (class_name, grade_level, gvcn_name) VALUES ($1, $2, $3) RETURNING *',
      [sc.className, sc.gradeLevel, sc.gvcnName]
    );
    return res.rows[0];
  }
}
