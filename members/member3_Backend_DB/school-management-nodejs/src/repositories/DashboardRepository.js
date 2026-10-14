import { querySafe as query } from '../config/db.js';

/**
 * DashboardRepository — Tầng truy cập dữ liệu cho Dashboard BGH.
 * Chỉ chứa các câu lệnh SQL thuần, không có business logic.
 */
export class DashboardRepository {
  /** Đếm tổng học sinh đang học. */
  static async countActiveStudents() {
    const res = await query(
      `SELECT COUNT(*) AS total FROM students WHERE status = 'ACTIVE'`
    );
    return res ? parseInt(res.rows[0]?.total ?? 0, 10) : 0;
  }

  /** Đếm tổng giáo viên (GV + GVCN). */
  static async countTeachers() {
    const res = await query(
      `SELECT COUNT(*) AS total FROM users WHERE role IN ('GV', 'GVCN')`
    );
    return res ? parseInt(res.rows[0]?.total ?? 0, 10) : 0;
  }

  /**
   * Tổng hợp điểm danh toàn trường.
   * @returns {{ total: number, present: number } | null}
   */
  static async getOverallAttendanceSummary() {
    const res = await query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status = 'PRESENT') AS present
       FROM attendances`
    );
    if (!res || !res.rows[0]) return null;
    return {
      total: parseInt(res.rows[0].total, 10),
      present: parseInt(res.rows[0].present, 10),
    };
  }

  /**
   * Tổng hợp học lực toàn trường (chỉ HS có GPA).
   * @returns {{ total: number, passing: number } | null}
   */
  static async getOverallPassingSummary() {
    const res = await query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE gpa >= 5.0) AS passing
       FROM students
       WHERE status = 'ACTIVE' AND gpa IS NOT NULL`
    );
    if (!res || !res.rows[0]) return null;
    return {
      total: parseInt(res.rows[0].total, 10),
      passing: parseInt(res.rows[0].passing, 10),
    };
  }

  /**
   * Tổng hợp tỉ lệ chuyên cần theo từng lớp.
   * @returns {Array<{ className, gvcnName, total, present }>}
   */
  static async getAttendanceSummaryByClass() {
    const res = await query(
      `SELECT
         a.class_name,
         sc.gvcn_name,
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE a.status = 'PRESENT') AS present
       FROM attendances a
       LEFT JOIN school_classes sc ON sc.class_name = a.class_name
       GROUP BY a.class_name, sc.gvcn_name
       HAVING COUNT(*) > 0`
    );
    if (!res) return [];
    return res.rows.map((row) => ({
      className: row.class_name,
      gvcnName: row.gvcn_name || 'Chưa phân công',
      total: parseInt(row.total, 10),
      present: parseInt(row.present, 10),
    }));
  }

  /**
   * Danh sách học sinh có GPA thấp.
   * @param {number} threshold - Ngưỡng GPA (mặc định 5.0)
   * @param {number} limit - Số lượng tối đa trả về
   * @returns {Array}
   */
  static async findStudentsBelowGpa(threshold = 5.0, limit = 20) {
    const res = await query(
      `SELECT id, student_code, full_name, class_name, gpa, academic_rank
       FROM students
       WHERE gpa < $1 AND status = 'ACTIVE'
       ORDER BY gpa ASC
       LIMIT $2`,
      [threshold, limit]
    );
    if (!res) return [];
    return res.rows;
  }

  /**
   * Xu hướng chuyên cần theo tuần, lấy N tuần gần nhất.
   * @param {number} weeks - Số tuần cần lấy
   * @returns {Array<{ weekStart: string, total: number, present: number }>}
   */
  static async getAttendanceTrendByWeek(weeks = 5) {
    const res = await query(
      `SELECT
         TO_CHAR(DATE_TRUNC('week', att_date::date), 'DD/MM') AS week_start,
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status = 'PRESENT') AS present
       FROM attendances
       WHERE att_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
       GROUP BY DATE_TRUNC('week', att_date::date)
       ORDER BY DATE_TRUNC('week', att_date::date) DESC
       LIMIT $1`,
      [weeks]
    );
    if (!res) return [];
    return res.rows.map((row) => ({
      weekStart: row.week_start,
      total: parseInt(row.total, 10),
      present: parseInt(row.present, 10),
    }));
  }
}
