import { querySafe as query, query as queryStrict } from '../config/db.js';

/**
 * ClosureRepository — Tầng SQL cho bảng grade_book_closures.
 * Chỉ chứa SQL, không có business logic.
 */
export class ClosureRepository {
  /**
   * Upsert bản ghi chốt sổ điểm.
   * Nếu đã có → cập nhật status='submitted', submitted_at=NOW(), gvcn_name.
   */
  static async upsert({ classId, className, gvcnName, semester, schoolYear }) {
    const res = await queryStrict(
      `INSERT INTO grade_book_closures
         (class_id, class_name, gvcn_name, semester, school_year, status, submitted_at)
       VALUES ($1, $2, $3, $4, $5, 'submitted', NOW())
       ON CONFLICT (class_id, semester, school_year)
       DO UPDATE SET
         status       = 'submitted',
         submitted_at = NOW(),
         gvcn_name    = EXCLUDED.gvcn_name
       RETURNING *`,
      [classId, className, gvcnName, semester, schoolYear]
    );
    return res.rows[0];
  }

  /**
   * Tìm bản ghi chốt sổ theo khóa (class_id, semester, school_year).
   */
  static async findByKey(classId, semester, schoolYear) {
    const res = await query(
      `SELECT * FROM grade_book_closures
       WHERE class_id = $1 AND semester = $2 AND school_year = $3`,
      [classId, semester, schoolYear]
    );
    if (res && res.rows) return res.rows[0] ?? null;
    return null;
  }

  /**
   * Cập nhật trạng thái bản ghi chốt sổ.
   * Nếu status='approved' → tự động set approved_at=NOW().
   */
  static async updateStatus(classId, semester, schoolYear, status) {
    const res = await queryStrict(
      `UPDATE grade_book_closures
       SET status      = $4::VARCHAR,
           approved_at = CASE WHEN $4::VARCHAR = 'approved' THEN NOW() ELSE approved_at END
       WHERE class_id   = $1
         AND semester   = $2
         AND school_year = $3
       RETURNING *`,
      [classId, semester, schoolYear, status]
    );
    return res.rows[0] ?? null;
  }
}
