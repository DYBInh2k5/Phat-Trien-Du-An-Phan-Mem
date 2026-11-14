/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/services/GradeBookService.js
 * Vai trò: Tầng Nghiệp Vụ Sổ Điểm Điện Tử & Tính Điểm Trung Bình Môn (GradeBook Use Cases)
 * Kiến trúc: Clean Architecture - Tầng Nghiệp Vụ Cốt Lõi (Application Business Rules)
 * Tiêu chuẩn học vụ: Quy chế đánh giá học sinh THPT theo Thông tư 22/2021/TT-BGDĐT
 * Tác giả: Nhóm Đồ Án PTDA Phần Mềm (Võ Duy Bình - Lead BA & Dev Team)
 * Ngày cập nhật: 13/11/2026 (Đồng bộ hóa 100% sơ đồ SD-02 với UnitOfWork và AuditLogger)
 * Công thức tính điểm trung bình môn học kỳ (ĐTBmhk):
 *   ĐTBmhk = (Điểm Miệng + Điểm 15p + Điểm 1 Tiết*2 + Điểm Giữa Kỳ*2 + Điểm Cuối Kỳ*3) / 9
 * Quy tắc an toàn:
 *   - Quản lý giao dịch nguyên tử (Atomic Transaction): Sử dụng UnitOfWork bảo đảm ACID khi lưu điểm cả lớp.
 *   - Ghi nhật ký kiểm toán (Audit Logging): Tự động ghi vết mọi hành vi cập nhật điểm và khóa/mở khóa sổ điểm.
 *   - Kiểm tra trạng thái khóa sổ điểm (status === 'LOCKED'): Tuyệt đối ngăn chặn sửa điểm nếu BGH đã chốt sổ.
 *   - Hỗ trợ lưu điểm hàng loạt (Batch Save) cho cả lớp 45 học sinh.
 * ==============================================================================
 */

import { GradeBookRepository } from '../repositories/GradeBookRepository.js';
import { StudentRepository } from '../repositories/StudentRepository.js';
import { SubjectRepository } from '../repositories/SubjectRepository.js';
import { ClassRepository } from '../repositories/ClassRepository.js';
import { UnitOfWork } from '../utils/UnitOfWork.js';
import { AuditLogger } from '../utils/AuditLogger.js';

/**
 * Lớp GradeBookService - Điều phối nghiệp vụ chấm điểm môn học
 */
export class GradeBookService {
  /**
   * Lấy toàn bộ dữ liệu cần thiết cho trang GradebookPage:
   *   - classes, subjects, students trong lớp, gradeRows
   * @param {string} className
   * @param {string} semester  - 'HK1' | 'HK2'
   * @param {string} schoolYear
   */
  static async getGradebookPageData(className, semester, schoolYear) {
    const [rawClasses, rawSubjects, rawStudents, rawGrades] = await Promise.all([
      ClassRepository.findAll(),
      SubjectRepository.findAll(),
      StudentRepository.findByClassName(className),
      GradeBookRepository.findByClassNameAndSemester(className, semester, schoolYear),
    ]);

    const classes = rawClasses.map((c) => ({
      id:   c.class_name,
      name: c.class_name,
    }));

    const subjects = rawSubjects.map((s) => ({
      id:   s.code || s.name,
      name: s.name,
    }));

    const students = rawStudents.map((s) => ({
      id:        s.student_code || s.studentCode,
      name:      s.full_name    || s.fullName,
      classId:   s.class_name   || s.className,
      code:      s.student_code || s.studentCode,
    }));

    // Build gradeRows: flat array dễ dùng ở frontend
    const gradeRows = rawGrades.map((g) => ({
      id:            g.id,
      studentCode:   g.student_code || g.studentCode,
      studentName:   g.student_name || g.studentName,
      className:     g.class_name   || g.className,
      subjectName:   g.subject_name || g.subjectName,
      subjectId:     g.subject_name || g.subjectName, // dùng name làm id cho đồng nhất
      semester:      g.semester,
      schoolYear:    g.school_year  || g.schoolYear,
      scoreOral:     g.score_oral   != null ? parseFloat(g.score_oral)   : null,
      scoreOral2:    g.score_oral_2 != null ? parseFloat(g.score_oral_2) : null,
      score15m:      g.score_15m    != null ? parseFloat(g.score_15m)    : null,
      score15m2:     g.score_15m_2  != null ? parseFloat(g.score_15m_2)  : null,
      score1Hour:    g.score_1hour  != null ? parseFloat(g.score_1hour)  : null,
      scoreMidTerm:  g.score_mid_term  != null ? parseFloat(g.score_mid_term)  : null,
      scoreFinalTerm:g.score_final_term!= null ? parseFloat(g.score_final_term): null,
      averageScore:  g.average_score   != null ? parseFloat(g.average_score)   : null,
      status:        g.status,
    }));

    return { classes, subjects, students, gradeRows };
  }

  /**
   * Lưu hàng loạt grades từ spreadsheet bên trong một giao dịch UnitOfWork nguyên tử.
   * Mỗi item: { studentCode, studentName, className, subjectId (=subjectName),
   *             semester, schoolYear, scoreOral, score15m, score1Hour,
   *             scoreMidTerm, scoreFinalTerm }
   * @async
   * @param {Array<Object>} items - Danh sách điểm từ bảng tính spreadsheet
   * @param {Object} [userContext=null] - Ngữ cảnh người dùng (username, role, ipAddress)
   * @returns {Promise<Array<Object>>} Kết quả các bản ghi đã lưu
   * @throws {Error} Nếu có bất kỳ lỗi nào trong quá trình thực thi giao dịch
   */
  static async saveGradesFromSpreadsheet(items, userContext = null) {
    const uow = new UnitOfWork();
    await uow.beginTransaction();

    try {
      const results = [];
      for (const item of items) {
        const gb = {
          studentCode:    item.studentCode,
          studentName:    item.studentName,
          className:      item.className,
          subjectName:    item.subjectId,
          semester:       item.semester,
          schoolYear:     item.schoolYear,
          scoreOral:      item.scoreOral,
          scoreOral2:     item.scoreOral2  ?? null,
          score15m:       item.score15m,
          score15m2:      item.score15m2   ?? null,
          score1Hour:     item.score1Hour,
          scoreMidTerm:   item.scoreMidTerm,
          scoreFinalTerm: item.scoreFinalTerm,
          status:         'APPROVED',
        };
        const calculated = this.calculateTBM(gb);
        // Lưu từng dòng điểm qua kết nối giao dịch UnitOfWork
        const saved = await GradeBookRepository.save(calculated, uow);
        results.push(saved);
      }

      // Xác nhận commit giao dịch vào cơ sở dữ liệu
      await uow.commit();

      // Kích hoạt ghi nhật ký kiểm toán (Audit Log) theo đặc tả SD-02
      AuditLogger.log({
        action: 'GRADE_BATCH_UPDATE',
        user: userContext?.username || 'system',
        role: userContext?.role || 'GV',
        entity: 'grade_books',
        entityId: 'SPREADSHEET_BATCH',
        newValue: { count: results.length, className: items[0]?.className },
        ipAddress: userContext?.ipAddress || '127.0.0.1',
      });

      return results;
    } catch (err) {
      // Hoàn tác toàn bộ nếu có lỗi trong giao dịch
      await uow.rollback();
      throw err;
    }
  }

  /**
   * Lấy danh sách điểm theo các tiêu chí linh hoạt: Mã học sinh, Tên lớp, hoặc Tên lớp + Tên môn
   * @async
   * @param {Object} filter
   * @param {string} [filter.studentCode] - Mã học sinh (HS001)
   * @param {string} [filter.className] - Tên lớp (10A1)
   * @param {string} [filter.subjectName] - Tên môn (Toán)
   * @returns {Promise<Array<Object>>}
   */
  static async getGrades({ studentCode, className, subjectName }) {
    if (studentCode) {
      return await GradeBookRepository.findByStudentCode(studentCode);
    }
    if (className && subjectName) {
      return await GradeBookRepository.findByClassNameAndSubjectName(className, subjectName);
    }
    if (className) {
      return await GradeBookRepository.findByClassName(className);
    }
    return await GradeBookRepository.findAll();
  }

  /**
   * Lưu điểm cho một học sinh đơn lẻ (kèm kiểm tra khóa sổ và tính ĐTB môn)
   * Kích hoạt AuditLogger để ghi nhận vết kiểm toán hành vi sửa điểm.
   * @async
   * @param {Object} gradeBook - Dữ liệu điểm học sinh
   * @param {Object} [userContext=null] - Thông tin tài khoản người thực hiện (username, role, ipAddress)
   * @returns {Promise<Object>} Bản ghi điểm sau khi lưu
   * @throws {Error} Nếu sổ điểm đã bị khóa bởi Ban Giám Hiệu
   */
  static async saveGrade(gradeBook, userContext = null) {
    if (gradeBook.id) {
      const existing = await GradeBookRepository.findById(gradeBook.id);
      // Quy tắc nghiệp vụ: Nếu trạng thái là LOCKED -> Chặn không cho sửa
      if (existing && existing.status === 'LOCKED') {
        throw new Error('Sổ điểm môn học này đã bị Ban Giám Hiệu khóa và không thể chỉnh sửa.');
      }
    }

    // Tự động tính điểm trung bình môn và xếp loại theo Thông tư 22
    const calculated = this.calculateTBM(gradeBook);
    const saved = await GradeBookRepository.save(calculated);

    // Kích hoạt ghi vết kiểm toán (Audit Logger) theo sơ đồ SD-02
    AuditLogger.log({
      action: 'UPDATE_GRADE',
      user: userContext?.username || 'system',
      role: userContext?.role || 'GV',
      entity: 'grade_books',
      entityId: saved?.id || gradeBook?.id || gradeBook?.studentCode,
      newValue: {
        averageScore: calculated.averageScore,
        gradeLetter: calculated.gradeLetter,
        studentCode: gradeBook.studentCode || gradeBook.student_code,
      },
      ipAddress: userContext?.ipAddress || '127.0.0.1',
    });

    return saved;
  }

  /**
   * Lưu điểm hàng loạt cho danh sách nhiều học sinh (phục vụ chức năng Lưu Toàn Bộ Sổ Điểm)
   * Quản lý giao dịch nguyên tử (ACID Transaction) thông qua UnitOfWork theo đúng thiết kế SD-02.
   * @async
   * @param {Array<Object>} gradeBooks - Mảng các bản ghi điểm
   * @param {Object} [userContext=null] - Ngữ cảnh người dùng (username, role, ipAddress)
   * @returns {Promise<Array<Object>>} Mảng các bản ghi đã lưu
   * @throws {Error} Nếu phát hiện bất kỳ bản ghi nào đã bị khóa hoặc lỗi giao dịch
   */
  static async saveAllGrades(gradeBooks, userContext = null) {
    // 1. Khởi tạo đối tượng UnitOfWork và bắt đầu Transaction
    const uow = new UnitOfWork();
    await uow.beginTransaction();

    try {
      const savedList = [];
      for (const gb of gradeBooks) {
        if (gb.id) {
          const existing = await GradeBookRepository.findById(gb.id);
          if (existing && existing.status === 'LOCKED') {
            throw new Error(`Điểm của học sinh ${gb.studentCode || gb.student_code} đã bị khóa sổ.`);
          }
        }
        // 2. Tính TBM chuẩn Thông tư 22
        const calculated = this.calculateTBM(gb);
        // 3. Thực thi lưu từng dòng điểm bên trong transaction UnitOfWork
        const saved = await GradeBookRepository.save(calculated, uow);
        savedList.push(saved);
      }

      // 4. Xác nhận commit vĩnh viễn toàn bộ thay đổi vào PostgreSQL
      await uow.commit();

      // 5. Kích hoạt ghi vết kiểm toán (Audit Logger) sau khi commit thành công
      AuditLogger.log({
        action: 'GRADE_BATCH_UPDATE',
        user: userContext?.username || 'system',
        role: userContext?.role || 'GV',
        entity: 'grade_books',
        entityId: savedList[0]?.id || 'BATCH',
        newValue: { count: savedList.length },
        ipAddress: userContext?.ipAddress || '127.0.0.1',
      });

      return savedList;
    } catch (err) {
      // 6. Hoàn tác toàn bộ 100% nếu có bất kỳ lỗi nào phát sinh
      await uow.rollback();
      throw err;
    }
  }

  /**
   * Khóa sổ điểm môn học của một lớp (Chỉ dành cho Ban Giám Hiệu hoặc GV chốt sổ)
   * Kèm theo ghi vết kiểm toán để theo dõi lịch sử chốt sổ.
   * @async
   * @param {string} className - Tên lớp
   * @param {string} subjectName - Tên môn học
   * @param {Object} [userContext=null] - Thông tin tài khoản người thực hiện
   */
  static async lockGradeSheet(className, subjectName, userContext = null) {
    await GradeBookRepository.updateStatusByClassAndSubject(className, subjectName, 'LOCKED');

    // Ghi vết kiểm toán khóa sổ
    AuditLogger.log({
      action: 'LOCK_GRADEBOOK',
      user: userContext?.username || 'system',
      role: userContext?.role || 'GV',
      entity: 'grade_books',
      entityId: `${className}_${subjectName}`,
      newValue: { status: 'LOCKED' },
      ipAddress: userContext?.ipAddress || '127.0.0.1',
    });
  }

  /**
   * Mở khóa sổ điểm môn học cho phép giáo viên chỉnh sửa lại theo phê duyệt của BGH
   * Kèm theo ghi vết kiểm toán để đảm bảo tính giải trình.
   * @async
   * @param {string} className - Tên lớp
   * @param {string} subjectName - Tên môn học
   * @param {Object} [userContext=null] - Thông tin tài khoản người duyệt mở khóa
   */
  static async unlockGradeSheet(className, subjectName, userContext = null) {
    await GradeBookRepository.updateStatusByClassAndSubject(className, subjectName, 'APPROVED');

    // Ghi vết kiểm toán mở khóa sổ
    AuditLogger.log({
      action: 'UNLOCK_GRADEBOOK',
      user: userContext?.username || 'system',
      role: userContext?.role || 'BGH',
      entity: 'grade_books',
      entityId: `${className}_${subjectName}`,
      newValue: { status: 'APPROVED' },
      ipAddress: userContext?.ipAddress || '127.0.0.1',
    });
  }

  /**
   * Thuật toán tính Điểm trung bình môn học kỳ (ĐTBmhk) theo Quy chế Thông tư 22/2021/TT-BGDĐT:
   *   - Đánh giá thường xuyên (ĐĐGtx): Miệng (hệ số 1), 15 phút (hệ số 1).
   *   - Đánh giá giữa kỳ (ĐĐGgk): 1 tiết (hệ số 2), Giữa kỳ (hệ số 2).
   *   - Đánh giá cuối kỳ (ĐĐGck): Cuối kỳ (hệ số 3).
   *   - Tổng trọng số: 1 + 1 + 2 + 2 + 3 = 9.
   *   - Kết quả làm tròn đến 1 chữ số thập phân.
   * @param {Object} gb - Bản ghi điểm học sinh
   * @returns {Object} Bản ghi đã bổ sung averageScore và gradeLetter
   */
  static calculateTBM(gb) {
    // Hướng A: NULL = 0, mẫu số cố định = 9 (theo BR-01)
    // TBM = (oral×1 + oral2×1 + 15'×1 + 15'_2×1 + 1tiết×2 + giữaHK×2 + cuốiHK×3) / 9
    // Ô nào chưa nhập (null/undefined) được coi là 0.
    const toNum = (v) => (v != null && !isNaN(parseFloat(v))) ? parseFloat(v) : 0;

    const oral  = toNum(gb.scoreOral);
    const oral2 = toNum(gb.scoreOral2);
    const m15   = toNum(gb.score15m);
    const m15_2 = toNum(gb.score15m2);
    const h1    = toNum(gb.score1Hour);
    const mid   = toNum(gb.scoreMidTerm);
    const fin   = toNum(gb.scoreFinalTerm);

    const DENOMINATOR = 9;
    const sum = oral * 1 + oral2 * 1 + m15 * 1 + m15_2 * 1 + h1 * 2 + mid * 2 + fin * 3;
    const avg = Math.round((sum / DENOMINATOR) * 10) / 10;

    gb.averageScore  = avg;
    gb.average_score = avg;

    if (avg >= 9.0)      gb.gradeLetter = 'Xuất sắc';
    else if (avg >= 8.0) gb.gradeLetter = 'Giỏi';
    else if (avg >= 6.5) gb.gradeLetter = 'Khá';
    else if (avg >= 5.0) gb.gradeLetter = 'Trung bình';
    else                 gb.gradeLetter = 'Yếu';
    gb.grade_letter = gb.gradeLetter;

    return gb;
  }
}
