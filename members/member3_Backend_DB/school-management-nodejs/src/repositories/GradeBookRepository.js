/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/repositories/GradeBookRepository.js
 * Vai trò: Kho Lưu Trữ Dữ Liệu Sổ Điểm (GradeBook Data Access Repository)
 * Kiến trúc: Clean Architecture - Tầng Giao Tiếp Dữ Liệu (Interface Adapters / Data Access)
 * Tiêu chuẩn: Quy chế đánh giá cho điểm môn học theo Thông tư 22/2021/TT-BGDĐT
 * Tác giả: Nhóm Đồ Án PTDA Phần Mềm (Võ Duy Bình - Lead BA & Dev Team)
 * Ngày cập nhật: 13/11/2026 (Tích hợp hỗ trợ Unit of Work giao dịch nguyên tử)
 * Mô tả:
 *   - Thực thi các câu lệnh SQL tác động lên bảng 'grade_books' trong PostgreSQL.
 *   - Hỗ trợ lưu trữ các đầu điểm: Miệng (Oral), 15 phút, 1 tiết, Giữa kỳ, Cuối kỳ.
 *   - Hỗ trợ lưu điểm (Upsert: tự động INSERT nếu chưa có ID hoặc UPDATE nếu đã có ID).
 *   - Hỗ trợ thực thi câu truy vấn bên trong giao dịch nguyên tử UnitOfWork.
 *   - Cung cấp thao tác khóa/mở khóa sổ điểm hàng loạt theo Lớp và Môn học.
 *   - Tích hợp kho nhớ tạm thời (In-Memory Fallback) khi chưa kết nối CSDL Docker.
 * ==============================================================================
 */

import { querySafe as query, query as queryStrict } from '../config/db.js';

/**
 * Kho dữ liệu bộ nhớ dự phòng cho sổ điểm điện tử
 */
let memGrades = [
  { id: 1, student_id: 1, studentId: 1, student_code: 'HS001', studentCode: 'HS001', student_name: 'Nguyễn Thị Ánh', studentName: 'Nguyễn Thị Ánh', class_name: '10A1', className: '10A1', subject_name: 'Toán', subjectName: 'Toán', semester: 'HK1', school_year: '2024-2025', schoolYear: '2024-2025', score_oral: 9.0, scoreOral: 9.0, score_15m: 8.5, score15m: 8.5, score_1hour: 8.0, score1Hour: 8.0, score_mid_term: 8.5, scoreMidTerm: 8.5, score_final_term: 9.0, scoreFinalTerm: 9.0, average_score: 8.7, averageScore: 8.7, grade_letter: 'Giỏi', gradeLetter: 'Giỏi', status: 'APPROVED' },
  { id: 2, student_id: 1, studentId: 1, student_code: 'HS001', studentCode: 'HS001', student_name: 'Nguyễn Thị Ánh', studentName: 'Nguyễn Thị Ánh', class_name: '10A1', className: '10A1', subject_name: 'Ngữ văn', subjectName: 'Ngữ văn', semester: 'HK1', school_year: '2024-2025', schoolYear: '2024-2025', score_oral: 8.0, scoreOral: 8.0, score_15m: 8.0, score15m: 8.0, score_1hour: 7.5, score1Hour: 7.5, score_mid_term: 8.0, scoreMidTerm: 8.0, score_final_term: 8.5, scoreFinalTerm: 8.5, average_score: 8.1, averageScore: 8.1, grade_letter: 'Giỏi', gradeLetter: 'Giỏi', status: 'APPROVED' },
  { id: 3, student_id: 2, studentId: 2, student_code: 'HS002', studentCode: 'HS002', student_name: 'Trần Văn Bảo', studentName: 'Trần Văn Bảo', class_name: '10A1', className: '10A1', subject_name: 'Toán', subjectName: 'Toán', semester: 'HK1', school_year: '2024-2025', schoolYear: '2024-2025', score_oral: 6.0, scoreOral: 6.0, score_15m: 6.5, score15m: 6.5, score_1hour: 7.0, score1Hour: 7.0, score_mid_term: 6.5, scoreMidTerm: 6.5, score_final_term: 7.0, scoreFinalTerm: 7.0, average_score: 6.7, averageScore: 6.7, grade_letter: 'Khá', gradeLetter: 'Khá', status: 'APPROVED' }
];

/**
 * Lớp GradeBookRepository - Quản lý truy xuất bảng điểm
 */
export class GradeBookRepository {
  /**
   * Lấy toàn bộ các bản ghi điểm môn học trong hệ thống
   * @async
   * @returns {Promise<Array<Object>>}
   */
  static async findAll() {
    const res = await query('SELECT * FROM grade_books ORDER BY id ASC');
    if (res && res.rows) return res.rows;
    return memGrades;
  }

  /**
   * Lấy toàn bộ grades theo lớp + học kỳ, kèm semester filter.
   * @async
   * @param {string} className
   * @param {string} [semester]
   * @param {string} [schoolYear]
   * @returns {Promise<Array<Object>>}
   */
  static async findByClassNameAndSemester(className, semester, schoolYear) {
    const params = [className];
    const conditions = ['class_name = $1'];
    if (semester) { params.push(semester); conditions.push(`semester = $${params.length}`); }
    if (schoolYear) { params.push(schoolYear); conditions.push(`school_year = $${params.length}`); }
    const res = await query(
      `SELECT * FROM grade_books WHERE ${conditions.join(' AND ')} ORDER BY student_name ASC, subject_name ASC`,
      params
    );
    if (res && res.rows) return res.rows;
    return memGrades.filter(
      (g) => (g.class_name === className || g.className === className) &&
             (!semester || g.semester === semester)
    );
  }

  /**
   * Tìm bản ghi điểm theo khóa chính ID
   * @async
   * @param {number|string} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const res = await query('SELECT * FROM grade_books WHERE id = $1', [id]);
    if (res && res.rows) return res.rows[0] || null;
    return memGrades.find(g => g.id === parseInt(id, 10)) || null;
  }

  /**
   * Lấy toàn bộ điểm các môn học của một học sinh theo Mã số (phục vụ tính GPA hoặc Cổng Phụ Huynh)
   * @async
   * @param {string} studentCode - Mã học sinh (ví dụ: 'HS001')
   * @returns {Promise<Array<Object>>}
   */
  static async findByStudentCode(studentCode) {
    const res = await query(
      `SELECT gb.*,
              COALESCE(s.name, gb.subject_name) AS subject_name_full
       FROM grade_books gb
       LEFT JOIN subjects s ON s.code = gb.subject_name OR s.name = gb.subject_name
       WHERE gb.student_code = $1
       ORDER BY gb.semester ASC, gb.subject_name ASC`,
      [studentCode]
    );
    if (res && res.rows) {
      // Ghi đè subject_name bằng tên đầy đủ nếu có
      return res.rows.map(r => ({
        ...r,
        subject_name: r.subject_name_full || r.subject_name,
      }));
    }
    return memGrades.filter(g => g.student_code === studentCode || g.studentCode === studentCode);
  }

  /**
   * Lấy sổ điểm của tất cả học sinh trong một Lớp học
   * @async
   * @param {string} className - Tên lớp (ví dụ: '10A1')
   * @returns {Promise<Array<Object>>}
   */
  static async findByClassName(className) {
    const res = await query('SELECT * FROM grade_books WHERE class_name = $1', [className]);
    if (res && res.rows) return res.rows;
    return memGrades.filter(g => g.class_name === className || g.className === className);
  }

  /**
   * Lấy sổ điểm cụ thể của một Lớp và một Môn học (phục vụ màn hình GradebookPage của giáo viên bộ môn)
   * @async
   * @param {string} className - Tên lớp (ví dụ: '10A1')
   * @param {string} subjectName - Tên môn học (ví dụ: 'Toán')
   * @returns {Promise<Array<Object>>}
   */
  static async findByClassNameAndSubjectName(className, subjectName) {
    const res = await query('SELECT * FROM grade_books WHERE class_name = $1 AND subject_name = $2', [className, subjectName]);
    if (res && res.rows) return res.rows;
    return memGrades.filter(g => (g.class_name === className || g.className === className) && (g.subject_name === subjectName || g.subjectName === subjectName));
  }

  /**
   * Lưu bản ghi điểm học sinh (Tự động UPDATE nếu đã có id, hoặc INSERT nếu chưa có id)
   * Hỗ trợ thực thi bên trong giao dịch nguyên tử (ACID Transaction) khi truyền đối tượng UnitOfWork.
   * @async
   * @param {Object} gb - Bản ghi điểm học sinh
   * @param {import('../utils/UnitOfWork.js').UnitOfWork|null} [uow=null] - Đối tượng điều phối giao dịch UnitOfWork
   * @returns {Promise<Object>} Bản ghi điểm sau khi lưu
   * @throws {Error} Nếu câu lệnh SQL thất bại trong giao dịch nghiêm ngặt
   */
  static async save(gb, uow = null) {
    // Đảm bảo school_year luôn có giá trị — bắt buộc cho UNIQUE constraint
    const schoolYear = gb.schoolYear || gb.school_year || '2024-2025';

    // Xác định hàm thực thi truy vấn: ưu tiên uow.query nếu có giao dịch đang mở và client hợp lệ
    const executeQuery = (uow && typeof uow.query === 'function' && uow.client)
      ? (sql, params) => uow.query(sql, params)
      : queryStrict;

    if (gb.id) {
      // UPDATE theo id — câu lệnh tham số hóa ($1..$9) chống SQL Injection
      const res = await executeQuery(
        `UPDATE grade_books SET score_oral = $1, score_15m = $2, score_1hour = $3,
            score_mid_term = $4, score_final_term = $5, average_score = $6,
            grade_letter = $7, status = $8
         WHERE id = $9 RETURNING *`,
        [gb.scoreOral, gb.score15m, gb.score1Hour, gb.scoreMidTerm, gb.scoreFinalTerm,
         gb.averageScore, gb.gradeLetter, gb.status || 'APPROVED', gb.id]
      );
      if (res && res.rows && res.rows.length > 0) return res.rows[0];
      return gb;
    }

    // UPSERT theo Unique constraint (student_code, subject_name, class_name, semester, school_year)
    const res = await executeQuery(
      `INSERT INTO grade_books
         (student_id, student_code, student_name, class_name, subject_name,
          semester, school_year, score_oral, score_oral_2, score_15m, score_15m_2,
          score_1hour, score_mid_term, score_final_term, average_score, grade_letter, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       ON CONFLICT (student_code, subject_name, class_name, semester, school_year)
       DO UPDATE SET
         score_oral       = EXCLUDED.score_oral,
         score_oral_2     = EXCLUDED.score_oral_2,
         score_15m        = EXCLUDED.score_15m,
         score_15m_2      = EXCLUDED.score_15m_2,
         score_1hour      = EXCLUDED.score_1hour,
         score_mid_term   = EXCLUDED.score_mid_term,
         score_final_term = EXCLUDED.score_final_term,
         average_score    = EXCLUDED.average_score,
         grade_letter     = EXCLUDED.grade_letter,
         status           = EXCLUDED.status
       RETURNING *`,
      [gb.studentId ?? null, gb.studentCode, gb.studentName, gb.className, gb.subjectName,
       gb.semester, schoolYear,
       gb.scoreOral, gb.scoreOral2 ?? null,
       gb.score15m,  gb.score15m2  ?? null,
       gb.score1Hour, gb.scoreMidTerm, gb.scoreFinalTerm,
       gb.averageScore, gb.gradeLetter, gb.status || 'APPROVED']
    );
    if (res && res.rows && res.rows.length > 0) return res.rows[0];
    return gb;
  }

  /**
   * Cập nhật trạng thái khóa/mở khóa sổ điểm hàng loạt cho cả một lớp theo môn
   * @async
   * @param {string} className - Tên lớp (ví dụ: '10A1')
   * @param {string} subjectName - Tên môn học (ví dụ: 'Toán')
   * @param {'APPROVED'|'LOCKED'|'DRAFT'} status - Trạng thái mới cần áp dụng
   */
  static async updateStatusByClassAndSubject(className, subjectName, status) {
    await query('UPDATE grade_books SET status = $1 WHERE class_name = $2 AND subject_name = $3', [status, className, subjectName]);
    // Cập nhật kho nhớ tạm
    memGrades.forEach(g => {
      if ((g.class_name === className || g.className === className) && (g.subject_name === subjectName || g.subjectName === subjectName)) {
        g.status = status;
      }
    });
  }
}
