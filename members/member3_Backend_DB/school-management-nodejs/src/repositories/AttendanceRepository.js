import { query } from '../config/db.js';

export class AttendanceRepository {
  static async findAll() {
    const res = await query('SELECT * FROM attendances ORDER BY id ASC');
    return res.rows;
  }

  static async findByStudentCode(studentCode) {
    const res = await query('SELECT * FROM attendances WHERE student_code = $1', [studentCode]);
    return res.rows;
  }

  static async findByClassNameAndDate(className, attDate) {
    const res = await query('SELECT * FROM attendances WHERE class_name = $1 AND att_date = $2', [className, attDate]);
    return res.rows;
  }

  static async save(att) {
    if (att.id) {
      const res = await query(
        'UPDATE attendances SET status = $1, note = $2 WHERE id = $3 RETURNING *',
        [att.status, att.note, att.id]
      );
      return res.rows[0];
    } else {
      const res = await query(
        `INSERT INTO attendances (student_id, student_code, student_name, class_name, att_date, status, note)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [att.studentId, att.studentCode, att.studentName, att.className, att.attDate, att.status, att.note]
      );
      return res.rows[0];
    }
  }
}
