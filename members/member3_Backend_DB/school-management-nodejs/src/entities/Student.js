/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/entities/Student.js
 * Vai trò: Thực Thể Nghiệp Vụ Hồ Sơ Học Sinh (Student Domain Entity)
 * Kiến trúc: Clean Architecture - Tầng Lõi Trung Tâm (Enterprise / Domain Entities)
 * Mô tả:
 *   - Đại diện cho đối tượng Học sinh trong toàn bộ hệ thống.
 *   - Chuẩn hóa hai kiểu định dạng đặt tên thuộc tính: camelCase (Javascript) và snake_case (PostgreSQL).
 *   - Độc lập 100% với bất kỳ framework HTTP hay cơ sở dữ liệu cụ thể nào.
 * ==============================================================================
 */

/**
 * Lớp Student - Thực thể miền học sinh
 */
export class Student {
  /**
   * Khởi tạo đối tượng học sinh
   * @param {Object} data - Dữ liệu thô truyền vào từ Repository hoặc Controller
   */
  constructor(data = {}) {
    this.id = data.id;                                      // Khóa chính tự tăng trong CSDL
    this.studentCode = data.studentCode || data.student_code;// Mã định danh học sinh (HS001)
    this.student_code = this.studentCode;
    this.fullName = data.fullName || data.full_name;        // Họ và tên đầy đủ
    this.full_name = this.fullName;
    this.gender = data.gender;                              // Giới tính: 'Nam' hoặc 'Nữ'
    this.dob = data.dob;                                    // Ngày tháng năm sinh (YYYY-MM-DD)
    this.className = data.className || data.class_name;     // Tên lớp học hiện tại (10A1)
    this.class_name = this.className;
    this.parentName = data.parentName || data.parent_name;  // Họ tên phụ huynh học sinh
    this.parent_name = this.parentName;
    this.parentPhone = data.parentPhone || data.parent_phone;// Số điện thoại liên hệ phụ huynh
    this.parent_phone = this.parentPhone;
    this.gpa = parseFloat(data.gpa || 0.0);                 // Điểm trung bình học kỳ toàn diện
    this.academicRank = data.academicRank || data.academic_rank;// Học lực: Xuất sắc, Giỏi, Khá, Trung bình, Yếu
    this.academic_rank = this.academicRank;
    this.status = data.status || 'ACTIVE';                  // Trạng thái hồ sơ: ACTIVE / INACTIVE / RESERVED
  }
}
