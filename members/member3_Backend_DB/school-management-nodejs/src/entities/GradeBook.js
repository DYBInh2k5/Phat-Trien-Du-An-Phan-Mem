/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/entities/GradeBook.js
 * Vai trò: Thực Thể Nghiệp Vụ Sổ Điểm Môn Học (GradeBook Domain Entity)
 * Kiến trúc: Clean Architecture - Tầng Lõi Trung Tâm (Enterprise / Domain Entities)
 * Quy chuẩn: Quy chế Đánh giá học sinh THPT theo Thông tư 22/2021/TT-BGDĐT
 * Mô tả:
 *   - Đại diện cho một bản ghi điểm môn học của một học sinh trong một học kỳ.
 *   - Chứa phương thức miền `calculateAverage()` tự động tính Điểm trung bình môn học kỳ (ĐTBmhk)
 *     với các trọng số chuẩn: Miệng (1), 15p (1), 1 Tiết (2), Giữa kỳ (2), Cuối kỳ (3) chia cho 9.
 *   - Tự động xếp loại môn học (Xuất sắc, Giỏi, Khá, Trung bình, Yếu).
 * ==============================================================================
 */

/**
 * Lớp GradeBook - Thực thể miền sổ điểm môn học
 */
export class GradeBook {
  /**
   * Khởi tạo đối tượng sổ điểm
   * @param {Object} data - Dữ liệu điểm truyền vào
   */
  constructor(data = {}) {
    this.id = data.id;                                            // Khóa chính
    this.studentId = data.studentId || data.student_id;           // ID học sinh
    this.student_id = this.studentId;
    this.studentCode = data.studentCode || data.student_code;     // Mã định danh học sinh (HS001)
    this.student_code = this.studentCode;
    this.studentName = data.studentName || data.student_name;     // Họ tên học sinh
    this.student_name = this.studentName;
    this.className = data.className || data.class_name;           // Tên lớp (10A1)
    this.class_name = this.className;
    this.subjectName = data.subjectName || data.subject_name;     // Tên môn học (Toán, Ngữ văn)
    this.subject_name = this.subjectName;
    this.semester = data.semester || 'HK1';                       // Học kỳ: HK1 / HK2
    this.schoolYear = data.schoolYear || data.school_year || '2024-2025'; // Niên khóa
    this.school_year = this.schoolYear;

    // Các cột điểm thành phần theo Quy chế Thông tư 22
    this.scoreOral = parseFloat(data.scoreOral || data.score_oral || 0);          // Điểm kiểm tra miệng (hệ số 1)
    this.score_oral = this.scoreOral;
    this.score15m = parseFloat(data.score15m || data.score_15m || 0);            // Điểm kiểm tra 15 phút (hệ số 1)
    this.score_15m = this.score15m;
    this.score1Hour = parseFloat(data.score1Hour || data.score_1hour || 0);       // Điểm kiểm tra 1 tiết (hệ số 2)
    this.score_1hour = this.score1Hour;
    this.scoreMidTerm = parseFloat(data.scoreMidTerm || data.score_mid_term || 0);// Điểm kiểm tra giữa kỳ (hệ số 2)
    this.score_mid_term = this.scoreMidTerm;
    this.scoreFinalTerm = parseFloat(data.scoreFinalTerm || data.score_final_term || 0); // Điểm đánh giá cuối kỳ (hệ số 3)
    this.score_final_term = this.scoreFinalTerm;

    // Điểm trung bình và kết quả xếp loại môn
    this.averageScore = parseFloat(data.averageScore || data.average_score || 0); // Điểm trung bình môn (ĐTBmhk)
    this.average_score = this.averageScore;
    this.gradeLetter = data.gradeLetter || data.grade_letter || 'Chưa xếp loại'; // Đánh giá xếp loại môn học
    this.grade_letter = this.gradeLetter;
    this.status = data.status || 'APPROVED';                                      // Trạng thái: DRAFT / APPROVED / LOCKED
  }

  /**
   * Phương thức miền (Domain Method): Tính toán điểm trung bình môn học kỳ theo trọng số Thông tư 22
   * @returns {number} Điểm trung bình môn đã làm tròn 1 chữ số thập phân
   */
  calculateAverage() {
    // Trọng số Thông tư 22: Miệng*1 + 15p*1 + 1tiết*2 + GiữaKỳ*2 + CuốiKỳ*3 chia cho 9
    const avg = (this.scoreOral * 1 + this.score15m * 1 + this.score1Hour * 2 + this.scoreMidTerm * 2 + this.scoreFinalTerm * 3) / 9;
    this.averageScore = Math.round(avg * 10) / 10;
    this.average_score = this.averageScore;

    // Xếp loại môn học
    if (this.averageScore >= 9.0) this.gradeLetter = 'Xuất sắc';
    else if (this.averageScore >= 8.0) this.gradeLetter = 'Giỏi';
    else if (this.averageScore >= 6.5) this.gradeLetter = 'Khá';
    else if (this.averageScore >= 5.0) this.gradeLetter = 'Trung bình';
    else this.gradeLetter = 'Yếu';
    this.grade_letter = this.gradeLetter;

    return this.averageScore;
  }
}
