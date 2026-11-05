import { querySafe as query } from '../config/db.js';

/**
 * ReportRepository — Tầng truy cập dữ liệu cho trang Báo cáo BGH.
 * Chỉ chứa SQL thuần, không có business logic.
 */
export class ReportRepository {

  // ── Grade Book Closures ──────────────────────────────────────────────────

  /**
   * Lấy danh sách tiến độ chốt sổ điểm theo học kỳ & năm học.
   * Tự khởi tạo bản ghi cho các lớp chưa có nếu truyền classNames.
   */
  static async findClosures(semester, schoolYear) {
    const res = await query(
      `SELECT c.*, sc.gvcn_name
       FROM grade_book_closures c
       LEFT JOIN school_classes sc ON sc.class_name = c.class_id
       WHERE c.semester = $1 AND c.school_year = $2
       ORDER BY c.class_name ASC`,
      [semester, schoolYear]
    );
    if (!res) return [];
    return res.rows;
  }

  /**
   * Tự động tạo bản ghi closure cho mọi lớp trong school_classes nếu chưa có.
   */
  static async ensureClosuresForAllClasses(semester, schoolYear) {
    await query(
      `INSERT INTO grade_book_closures (class_id, class_name, gvcn_name, semester, school_year, status)
       SELECT sc.class_name, sc.class_name, sc.gvcn_name, $1, $2, 'pending'
       FROM school_classes sc
       WHERE NOT EXISTS (
         SELECT 1 FROM grade_book_closures c
         WHERE c.class_id = sc.class_name AND c.semester = $1 AND c.school_year = $2
       )`,
      [semester, schoolYear]
    );
  }

  /** Cập nhật trạng thái duyệt một lớp. */
  static async approveClass(classId, semester, schoolYear) {
    const res = await query(
      `UPDATE grade_book_closures
       SET status = 'approved', approved_at = NOW()
       WHERE class_id = $1 AND semester = $2 AND school_year = $3
       RETURNING *`,
      [classId, semester, schoolYear]
    );
    if (!res) return null;
    return res.rows[0] || null;
  }

  /** Khóa sổ toàn bộ các lớp đã approved. */
  static async lockAll(semester, schoolYear) {
    const res = await query(
      `UPDATE grade_book_closures
       SET status = 'locked'
       WHERE semester = $1 AND school_year = $2 AND status = 'approved'
       RETURNING class_id`,
      [semester, schoolYear]
    );
    if (!res) return 0;
    return res.rowCount;
  }

  // ── Academic Performance (tỉ lệ học lực) ────────────────────────────────

  /**
   * Tỉ lệ học lực theo từng khối (grade_level).
   * Tính trực tiếp từ grade_books theo semester/schoolYear.
   */
  static async getAcademicRankByGrade(semester, schoolYear) {
    const res = await query(
      `WITH student_avg AS (
        SELECT
          gb.student_code,
          s.class_name,
          AVG(gb.average_score) AS gpa
        FROM grade_books gb
        JOIN students s ON s.student_code = gb.student_code
        WHERE gb.semester = $1
          AND gb.school_year = $2
          AND s.status = 'ACTIVE'
          AND gb.average_score IS NOT NULL
        GROUP BY gb.student_code, s.class_name
      ),
      student_rank AS (
        SELECT
          sa.class_name,
          CASE
            WHEN sa.gpa >= 9.0 THEN 'Xuất sắc'
            WHEN sa.gpa >= 8.0 THEN 'Giỏi'
            WHEN sa.gpa >= 6.5 THEN 'Khá'
            WHEN sa.gpa >= 5.0 THEN 'Trung bình'
            WHEN sa.gpa >= 3.5 THEN 'Yếu'
            ELSE 'Kém'
          END AS academic_rank
        FROM student_avg sa
      )
      SELECT sc.grade_level, sr.academic_rank, COUNT(*) AS cnt
      FROM student_rank sr
      JOIN school_classes sc ON sc.class_name = sr.class_name
      GROUP BY sc.grade_level, sr.academic_rank
      ORDER BY sc.grade_level ASC`,
      [semester, schoolYear]
    );
    if (!res) return [];
    return res.rows;
  }

  // ── Grade averages by subject & class ────────────────────────────────────

  /**
   * Điểm trung bình theo môn và lớp.
   * @returns {Array<{ subject_name, class_name, avg_score }>}
   */
  static async getAvgScoreBySubjectAndClass(semester, schoolYear) {
    const params = [];
    const conditions = [];
    if (semester) { params.push(semester); conditions.push(`gb.semester = $${params.length}`); }
    if (schoolYear) { params.push(schoolYear); conditions.push(`gb.school_year = $${params.length}`); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const res = await query(
      `SELECT
         gb.subject_name,
         gb.class_name,
         ROUND(AVG(gb.average_score)::numeric, 1) AS avg_score
       FROM grade_books gb
       ${where}
       GROUP BY gb.subject_name, gb.class_name
       ORDER BY gb.subject_name ASC, gb.class_name ASC`,
      params
    );
    if (!res) return [];
    return res.rows;
  }

  // ── Submission rate by teacher ───────────────────────────────────────────

  /**
   * Tỉ lệ nộp điểm đúng hạn theo giáo viên × môn.
   * Dựa trên grade_books.status = 'APPROVED' là đã nộp đúng hạn.
   * @returns {Array<{ teacher_name, subject_name, on_time, total }>}
   */
  static async getSubmissionRateByTeacher(semester, schoolYear) {
    const params = [];
    const conditions = [];
    if (semester) { params.push(semester); conditions.push(`semester = $${params.length}`); }
    if (schoolYear) { params.push(schoolYear); conditions.push(`school_year = $${params.length}`); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const res = await query(
      `SELECT
         gb.teacher_name,
         gb.subject_name,
         COUNT(*) FILTER (WHERE gb.status IN ('APPROVED','LOCKED')) AS on_time,
         COUNT(*) AS total
       FROM (
         SELECT teacher_name, subject_name, class_name, semester, school_year, status
         FROM grade_books
         ${where}
         GROUP BY teacher_name, subject_name, class_name, semester, school_year, status
       ) gb
       GROUP BY gb.teacher_name, gb.subject_name
       ORDER BY gb.teacher_name ASC`,
      params
    );
    if (!res) return [];
    return res.rows;
  }

  // ── Score distribution ────────────────────────────────────────────────────

  /**
   * Phân phối điểm trung bình toàn trường theo dải.
   * @returns {Array<{ range_label, cnt }>}
   */
  static async getScoreDistribution(semester, schoolYear) {
    const params = [];
    const conditions = [];
    if (semester) { params.push(semester); conditions.push(`semester = $${params.length}`); }
    if (schoolYear) { params.push(schoolYear); conditions.push(`school_year = $${params.length}`); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const res = await query(
      `SELECT
         CASE
           WHEN average_score < 2   THEN '0 – 2'
           WHEN average_score < 4   THEN '2 – 4'
           WHEN average_score < 5   THEN '4 – 5'
           WHEN average_score < 6.5 THEN '5 – 6.5'
           WHEN average_score < 8   THEN '6.5 – 8'
           ELSE '8 – 10'
         END AS range_label,
         COUNT(*) AS cnt
       FROM grade_books
       ${where}
       GROUP BY range_label
       ORDER BY MIN(average_score) ASC`,
      params
    );
    if (!res) return [];
    return res.rows;
  }
}
