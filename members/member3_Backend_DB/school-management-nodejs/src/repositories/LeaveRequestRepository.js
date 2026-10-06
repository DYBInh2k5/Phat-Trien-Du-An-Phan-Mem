import { query } from '../config/db.js';

export class LeaveRequestRepository {
  static async findAll() {
    const res = await query('SELECT * FROM leave_requests ORDER BY id DESC');
    return res.rows;
  }

  static async findById(id) {
    const res = await query('SELECT * FROM leave_requests WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  static async findByStudentCode(studentCode) {
    const res = await query('SELECT * FROM leave_requests WHERE student_code = $1 ORDER BY id DESC', [studentCode]);
    return res.rows;
  }

  static async findByClassName(className) {
    const res = await query('SELECT * FROM leave_requests WHERE class_name = $1 ORDER BY id DESC', [className]);
    return res.rows;
  }

  static async create(lr) {
    const res = await query(
      `INSERT INTO leave_requests (student_id, student_code, student_name, class_name, from_date, to_date, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [lr.studentId, lr.studentCode, lr.studentName, lr.className, lr.fromDate, lr.toDate, lr.reason, lr.status || 'PENDING']
    );
    return res.rows[0];
  }

  static async updateStatus(id, status) {
    const res = await query('UPDATE leave_requests SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    return res.rows[0];
  }
}
