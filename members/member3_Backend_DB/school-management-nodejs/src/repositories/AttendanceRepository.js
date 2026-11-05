import { querySafe as query } from '../config/db.js';

export class AttendanceRepository {
  static async findAll() {
    const res = await query('SELECT * FROM attendances ');
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

  /**
   * Tổng hợp điểm danh theo lớp trong khoảng ngày, kết hợp thông tin lớp.
   * Trả về mảng { class_name, gvcn_name, total_students, total_records, present_count }.
   * @param {string|null} dateFrom - YYYY-MM-DD
   * @param {string|null} dateTo   - YYYY-MM-DD
   * @param {string|null} className
   */
  static async getSummaryByClass(dateFrom, dateTo, className) {
    const conditions = [`a.att_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'`];
    const params = [];

    if (dateFrom) {
      params.push(dateFrom);
      conditions.push(`a.att_date::date >= $${params.length}::date`);
    }
    if (dateTo) {
      params.push(dateTo);
      conditions.push(`a.att_date::date <= $${params.length}::date`);
    }
    if (className) {
      params.push(className);
      conditions.push(`a.class_name = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const res = await query(
      `SELECT
         a.class_name,
         sc.gvcn_name,
         COUNT(DISTINCT a.student_code)                        AS total_students,
         COUNT(*)                                              AS total_records,
         COUNT(*) FILTER (WHERE a.status = 'PRESENT')         AS present_count
       FROM attendances a
       LEFT JOIN school_classes sc ON sc.class_name = a.class_name
       ${whereClause}
       GROUP BY a.class_name, sc.gvcn_name
       HAVING COUNT(*) > 0
       ORDER BY a.class_name ASC`,
      params
    );
    if (!res) return [];
    return res.rows;
  }

  /** Lấy danh sách tất cả class_name hiện có trong bảng attendances. */
  static async getDistinctClassNames() {
    const res = await query(
      `SELECT DISTINCT class_name FROM attendances ORDER BY class_name ASC`
    );
    if (!res) return [];
    return res.rows.map((r) => r.class_name);
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

  /**
   * Upsert điểm danh theo (student_code, class_name, att_date).
   * Nếu bản ghi đã tồn tại → UPDATE status + note.
   * Nếu chưa → INSERT mới.
   * Không cần truyền id từ frontend.
   */
  static async upsert(att) {
    // Tìm student_id từ student_code nếu chưa có
    let studentId = att.studentId ?? null;
    if (!studentId && att.studentCode) {
      const stRes = await query(
        'SELECT id FROM students WHERE student_code = $1 LIMIT 1',
        [att.studentCode]
      );
      studentId = stRes?.rows[0]?.id ?? null;
    }

    const res = await query(
      `INSERT INTO attendances (student_id, student_code, student_name, class_name, att_date, status, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (student_code, class_name, att_date)
       DO UPDATE SET
         status       = EXCLUDED.status,
         note         = EXCLUDED.note,
         student_name = EXCLUDED.student_name
       RETURNING *`,
      [studentId, att.studentCode, att.studentName, att.className, att.attDate, att.status, att.note]
    );
    return res.rows[0];
  }
}

