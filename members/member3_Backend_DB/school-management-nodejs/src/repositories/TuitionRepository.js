import { query } from '../config/db.js';

export class TuitionRepository {
  static async findAll() {
    const res = await query('SELECT * FROM tuitions ORDER BY id ASC');
    return res.rows;
  }

  static async findById(id) {
    const res = await query('SELECT * FROM tuitions WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  static async findByStudentCode(studentCode) {
    const res = await query('SELECT * FROM tuitions WHERE student_code = $1', [studentCode]);
    return res.rows;
  }

  static async findByClassName(className) {
    const res = await query('SELECT * FROM tuitions WHERE class_name = $1', [className]);
    return res.rows;
  }

  static async save(t) {
    if (t.id) {
      const res = await query(
        `UPDATE tuitions SET amount_paid = $1, status = $2, receipt_no = $3 WHERE id = $4 RETURNING *`,
        [t.amountPaid, t.status, t.receiptNo, t.id]
      );
      return res.rows[0];
    } else {
      const res = await query(
        `INSERT INTO tuitions (student_code, student_name, class_name, semester, school_year, amount_due, amount_paid, status, receipt_no)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [t.studentCode, t.studentName, t.className, t.semester, t.schoolYear, t.amountDue, t.amountPaid || 0, t.status || 'UNPAID', t.receiptNo]
      );
      return res.rows[0];
    }
  }
}
