/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/services/StudentService.js
 * Vai trò: Tầng Nghiệp Vụ Hồ Sơ & Học Lực Học Sinh (Business Logic / Use Cases)
 * Kiến trúc: Clean Architecture - Tầng Ứng Dụng (Application Business Rules)
 * Quy chuẩn giáo dục: Quy chế đánh giá xếp loại học sinh theo Thông tư 22/2021/TT-BGDĐT
 * Mô tả:
 *   - Tiếp nhận dữ liệu sạch từ StudentController và thực hiện kiểm tra logic nghiệp vụ.
 *   - Tự động quy đổi điểm trung bình (GPA) sang Danh hiệu học lực: Xuất sắc, Giỏi, Khá, Trung bình, Yếu.
 *   - Tính toán tổng hợp điểm GPA toàn diện dựa trên điểm trung bình các môn từ GradeBookRepository.
 *   - Độc lập hoàn toàn với framework HTTP (Express) và thư viện truy vấn SQL (pg).
 * ==============================================================================
 */

import { StudentRepository } from '../repositories/StudentRepository.js';
import { GradeBookRepository } from '../repositories/GradeBookRepository.js';

/**
 * Lớp StudentService - Điều phối logic nghiệp vụ học sinh
 */
export class StudentService {
  /**
   * Lấy danh sách học sinh (có thể lọc theo lớp học)
   * @async
   * @param {string} [className] - Tên lớp cần lọc (ví dụ: '10A1'). Nếu bỏ trống sẽ lấy toàn bộ trường.
   * @returns {Promise<Array<Object>>} Danh sách học sinh
   */
  static async getAllStudents(className) {
    if (className) {
      return await StudentRepository.findByClassName(className);
    }
    return await StudentRepository.findAll();
  }

  /**
   * Lấy thông tin chi tiết một học sinh theo ID
   * @async
   * @param {number|string} id - Khóa chính học sinh
   * @returns {Promise<Object>} Bản ghi học sinh
   * @throws {Error} Nếu không tìm thấy học sinh với ID tương ứng
   */
  static async getStudentById(id) {
    const s = await StudentRepository.findById(id);
    if (!s) throw new Error(`Không tìm thấy hồ sơ học sinh với mã định danh ID: ${id}`);
    return s;
  }

  /**
   * Tạo mới một học sinh kèm tự động xếp loại học lực
   * @async
   * @param {Object} data - Dữ liệu học sinh gửi lên
   * @returns {Promise<Object>} Học sinh vừa tạo
   */
  static async createStudent(data) {
    // Nếu có điểm GPA ban đầu -> Tự động tính học lực theo Thông tư 22
    if (data.gpa != null) {
      data.academicRank = this.evaluateAcademicRank(data.gpa);
    }
    return await StudentRepository.create(data);
  }

  /**
   * Cập nhật thông tin học sinh và tự động tính lại học lực nếu GPA thay đổi
   * @async
   * @param {number|string} id - Khóa chính học sinh
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Object>} Học sinh sau khi sửa
   */
  static async updateStudent(id, data) {
    const existing = await this.getStudentById(id);
    const updatedData = { ...existing, ...data };
    if (updatedData.gpa != null) {
      updatedData.academicRank = this.evaluateAcademicRank(updatedData.gpa);
    }
    return await StudentRepository.update(id, updatedData);
  }

  /**
   * Tính toán điểm trung bình học kỳ (GPA) và danh hiệu học lực dựa trên bảng điểm các môn
   * @async
   * @param {number|string} studentId - Khóa chính học sinh
   * @returns {Promise<Object>} Bản ghi học sinh với GPA và học lực mới nhất
   */
  static async calculateAcademicPerformance(studentId) {
    const student = await this.getStudentById(studentId);
    // Lấy bảng điểm tất cả các môn của học sinh này
    const grades = await GradeBookRepository.findByStudentCode(student.student_code || student.studentCode);

    if (!grades || grades.length === 0) return student;

    let sum = 0;
    let count = 0;
    // Cộng dồn điểm trung bình từng môn học
    for (const gb of grades) {
      if (gb.average_score != null) {
        sum += parseFloat(gb.average_score);
        count++;
      }
    }

    if (count > 0) {
      // Làm tròn 1 chữ số thập phân theo chuẩn học bạ THPT
      const gpa = Math.round((sum / count) * 10) / 10;
      const academicRank = this.evaluateAcademicRank(gpa);
      // Lưu điểm GPA và Danh hiệu mới vào hồ sơ học sinh
      return await StudentRepository.update(studentId, { ...student, gpa, academicRank });
    }

    return student;
  }

  /**
   * Quy tắc xếp loại học lực theo Quy chế Đánh giá học sinh THPT (Thông tư 22/2021/TT-BGDĐT)
   * @param {number} gpa - Điểm trung bình các môn
   * @returns {'Xuất sắc'|'Giỏi'|'Khá'|'Trung bình'|'Yếu'} Danh hiệu xếp loại
   */
  static evaluateAcademicRank(gpa) {
    if (gpa >= 9.0) return 'Xuất sắc';     // GPA từ 9.0 đến 10.0
    if (gpa >= 8.0) return 'Giỏi';         // GPA từ 8.0 đến dưới 9.0
    if (gpa >= 6.5) return 'Khá';          // GPA từ 6.5 đến dưới 8.0
    if (gpa >= 5.0) return 'Trung bình';   // GPA từ 5.0 đến dưới 6.5
    return 'Yếu';                          // GPA dưới 5.0
  }
}
