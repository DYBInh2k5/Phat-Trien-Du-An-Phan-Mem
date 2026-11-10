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

  // ── GVCN Dashboard ────────────────────────────────────────────────────────

  /**
   * Thông tin lớp chủ nhiệm theo user ID (homeroom_teacher_id FK).
   * Đây là cách tra cứu an toàn — dùng user.id từ JWT, không dùng chuỗi tên.
   * @param {number} gvcnUserId - req.user.id từ JWT đã xác thực
   */
  static async getHomeroomClassByGvcnId(gvcnUserId) {
    // Tìm lớp qua homeroom_teacher_id FK
    const classRes = await query(
      `SELECT * FROM school_classes WHERE homeroom_teacher_id = $1 LIMIT 1`,
      [gvcnUserId]
    );
    const classRow = classRes?.rows[0] ?? null;
    if (!classRow) return { classInfo: null, students: [] };

    // Lấy học sinh của lớp
    const studentsRes = await query(
      `SELECT id, student_code, full_name, gender, gpa, academic_rank, status
       FROM students
       WHERE class_name = $1 AND status = 'ACTIVE'
       ORDER BY full_name ASC`,
      [classRow.class_name]
    );

    return {
      classInfo: {
        id:         classRow.class_name,
        name:       classRow.class_name,
        gradeLevel: classRow.grade_level,
        gvcnName:   classRow.gvcn_name,
      },
      students: (studentsRes?.rows ?? []).map((s) => ({
        id:           s.id,
        code:         s.student_code,
        name:         s.full_name,
        gender:       s.gender,
        gpa:          s.gpa != null ? parseFloat(s.gpa) : null,
        academicRank: s.academic_rank || '',
        status:       s.status,
      })),
    };
  }

  /**
   * @deprecated Dùng getHomeroomClassByGvcnId thay thế — method này dùng full_name string
   * matching không đáng tin cậy. Giữ lại để backward compat trong trường hợp cần.
   */
  static async getHomeroomClassByGvcn(gvcnUsername) {
    const userRes = await query(
      `SELECT full_name FROM users WHERE username = $1`,
      [gvcnUsername]
    );
    const gvcnName = userRes?.rows[0]?.full_name ?? null;
    const classRes = await query(
      `SELECT * FROM school_classes WHERE gvcn_name = $1 LIMIT 1`,
      [gvcnName]
    );
    const classRow = classRes?.rows[0] ?? null;
    if (!classRow) return { classInfo: null, students: [] };
    const studentsRes = await query(
      `SELECT id, student_code, full_name, gender, gpa, academic_rank, status
       FROM students
       WHERE class_name = $1 AND status = 'ACTIVE'
       ORDER BY full_name ASC`,
      [classRow.class_name]
    );
    return {
      classInfo: {
        id:         classRow.class_name,
        name:       classRow.class_name,
        gradeLevel: classRow.grade_level,
        gvcnName:   classRow.gvcn_name,
      },
      students: (studentsRes?.rows ?? []).map((s) => ({
        id:           s.id,
        code:         s.student_code,
        name:         s.full_name,
        gender:       s.gender,
        gpa:          s.gpa != null ? parseFloat(s.gpa) : null,
        academicRank: s.academic_rank || '',
        status:       s.status,
      })),
    };
  }

  /**
   * Điểm danh hôm nay của một lớp.
   * @param {string} className
   * @param {string} todayStr  — YYYY-MM-DD
   */
  static async getTodayAttendance(className, todayStr) {
    const res = await query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status = 'PRESENT')          AS present,
         COUNT(*) FILTER (WHERE status = 'ABSENT_NO_PERMIT') AS absent_no_permit,
         COUNT(*) FILTER (WHERE status = 'ABSENT_WITH_PERMIT') AS absent_with_permit
       FROM attendances
       WHERE class_name = $1 AND att_date = $2`,
      [className, todayStr]
    );
    if (!res || !res.rows[0]) return null;
    const row = res.rows[0];
    return {
      total:           parseInt(row.total,            10),
      present:         parseInt(row.present,          10),
      absentNoPermit:  parseInt(row.absent_no_permit, 10),
      absentWithPermit:parseInt(row.absent_with_permit,10),
    };
  }

  /**
   * Đơn xin nghỉ chờ duyệt của một lớp.
   */
  static async getPendingLeaveRequests(className) {
    const res = await query(
      `SELECT id, student_code, student_name, from_date, to_date, reason, status, created_at
       FROM leave_requests
       WHERE class_name = $1 AND status = 'PENDING'
       ORDER BY created_at DESC`,
      [className]
    );
    if (!res) return [];
    return res.rows.map((r) => ({
      id:          r.id,
      studentCode: r.student_code,
      studentName: r.student_name,
      fromDate:    r.from_date,
      toDate:      r.to_date,
      reason:      r.reason,
      status:      r.status.toLowerCase(),
      createdAt:   r.created_at,
    }));
  }

  /**
   * Phân bố hạnh kiểm (dùng academic_rank làm proxy) của một lớp.
   */
  static async getConductSummary(className) {
    const res = await query(
      `SELECT academic_rank, COUNT(*) AS cnt
       FROM students
       WHERE class_name = $1 AND status = 'ACTIVE'
       GROUP BY academic_rank`,
      [className]
    );
    if (!res) return [];
    return res.rows.map((r) => ({
      rank:  r.academic_rank || 'Chưa xếp loại',
      count: parseInt(r.cnt, 10),
    }));
  }
}
