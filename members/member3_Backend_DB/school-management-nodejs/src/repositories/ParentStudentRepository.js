import { querySafe as query } from '../config/db.js';

/**
 * ParentStudentRepository — Tầng truy cập dữ liệu quan hệ Phụ huynh - Học sinh.
 * Clean Architecture: chỉ chứa SQL thuần và xử lý an toàn dữ liệu.
 */
export class ParentStudentRepository {
  /**
   * Lấy danh sách con em của phụ huynh theo parent_user_id.
   * Kèm thông tin lớp, GVCN của lớp mà con đang học.
   * @param {number} parentUserId
   * @returns {Promise<Array<{ studentCode, studentName, className, gvcnName, homeroomTeacherId, relationship }>>}
   */
  static async findStudentsByParentUserId(parentUserId) {
    const res = await query(
      `SELECT 
        ps.id AS relation_id,
        ps.relationship,
        s.student_code,
        s.full_name AS student_name,
        s.class_name,
        sc.gvcn_name,
        sc.homeroom_teacher_id
       FROM parent_students ps
       JOIN students s ON ps.student_code = s.student_code
       LEFT JOIN school_classes sc ON s.class_name = sc.class_name
       WHERE ps.parent_user_id = $1
       ORDER BY s.student_code ASC`,
      [parentUserId]
    );

    if (res && res.rows && res.rows.length > 0) {
      return res.rows.map((r) => ({
        studentCode:       r.student_code,
        studentName:       r.student_name,
        className:         r.class_name,
        gvcnName:          r.gvcn_name,
        homeroomTeacherId: r.homeroom_teacher_id,
        relationship:      r.relationship || 'Phụ huynh',
      }));
    }

    // Fallback thông minh: nếu chưa tạo bản ghi parent_students nhưng user có pattern username "ph.hs0001"
    const userRes = await query('SELECT username, full_name FROM users WHERE id = $1', [parentUserId]);
    const user = userRes?.rows?.[0];
    if (user) {
      const codeMatch = user.username.match(/ph\.([a-zA-Z0-9]+)/i);
      const studentCode = codeMatch ? codeMatch[1].toUpperCase() : null;

      const fallbackRes = await query(
        `SELECT 
          s.student_code,
          s.full_name AS student_name,
          s.class_name,
          sc.gvcn_name,
          sc.homeroom_teacher_id
         FROM students s
         LEFT JOIN school_classes sc ON s.class_name = sc.class_name
         WHERE ($1::varchar IS NOT NULL AND UPPER(s.student_code) = UPPER($1))
            OR s.parent_name = $2
         ORDER BY s.student_code ASC`,
        [studentCode, user.full_name]
      );

      if (fallbackRes && fallbackRes.rows && fallbackRes.rows.length > 0) {
        // Tự động lưu vào parent_students để các lần sau truy vấn trực tiếp
        for (const row of fallbackRes.rows) {
          await query(
            `INSERT INTO parent_students (parent_user_id, student_code, relationship)
             VALUES ($1, $2, 'Phụ huynh')
             ON CONFLICT (parent_user_id, student_code) DO NOTHING`,
            [parentUserId, row.student_code]
          );
        }

        return fallbackRes.rows.map((r) => ({
          studentCode:       r.student_code,
          studentName:       r.student_name,
          className:         r.class_name,
          gvcnName:          r.gvcn_name,
          homeroomTeacherId: r.homeroom_teacher_id,
          relationship:      'Phụ huynh',
        }));
      }
    }

    return [];
  }

  /**
   * Kiểm tra quyền: parentUserId có phải là phụ huynh của studentCode không.
   * @param {number} parentUserId
   * @param {string} studentCode
   * @returns {Promise<boolean>}
   */
  static async isParentOfStudent(parentUserId, studentCode) {
    if (!parentUserId || !studentCode) return false;

    const res = await query(
      `SELECT 1 FROM parent_students 
       WHERE parent_user_id = $1 AND UPPER(student_code) = UPPER($2)
       LIMIT 1`,
      [parentUserId, studentCode]
    );

    if (res && res.rows && res.rows.length > 0) {
      return true;
    }

    // Fallback kiểm tra danh sách con em
    const children = await this.findStudentsByParentUserId(parentUserId);
    return children.some((c) => c.studentCode.toUpperCase() === studentCode.toUpperCase());
  }

  /**
   * Tạo liên kết giữa phụ huynh và học sinh.
   */
  static async createLink(parentUserId, studentCode, relationship = 'Phụ huynh') {
    const res = await query(
      `INSERT INTO parent_students (parent_user_id, student_code, relationship)
       VALUES ($1, $2, $3)
       ON CONFLICT (parent_user_id, student_code) DO UPDATE
       SET relationship = EXCLUDED.relationship
       RETURNING *`,
      [parentUserId, studentCode, relationship]
    );
    return res?.rows?.[0] ?? null;
  }
}
