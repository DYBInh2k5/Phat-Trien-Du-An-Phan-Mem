import { LeaveRequestRepository } from '../repositories/LeaveRequestRepository.js';
import { StudentRepository } from '../repositories/StudentRepository.js';
import { querySafe } from '../config/db.js';

export class LeaveRequestService {
  static async getLeaveRequests({ className, studentCode }) {
    if (studentCode) {
      return await LeaveRequestRepository.findByStudentCode(studentCode);
    }
    if (className) {
      return await LeaveRequestRepository.findByClassName(className);
    }
    return await LeaveRequestRepository.findAll();
  }

  /**
   * Resolve học sinh thực sự từ userId của phụ huynh qua bảng parent_students.
   * Trả về student row hoặc null.
   */
  static async _resolveStudentForParent(parentUserId) {
    if (!parentUserId) return null;
    const res = await querySafe(
      `SELECT s.*
       FROM students s
       JOIN parent_students ps ON ps.student_code = s.student_code
       WHERE ps.parent_user_id = $1
       LIMIT 1`,
      [parentUserId]
    );
    return res?.rows?.[0] ?? null;
  }

  static async submitLeaveRequest(data) {
    // Bước 1: Nếu caller là PH (có parentUserId), resolve học sinh qua parent_students
    if (data.parentUserId) {
      const student = await this._resolveStudentForParent(data.parentUserId);
      if (student) {
        data.studentCode = student.student_code;
        data.studentName = student.full_name;
        data.className   = student.class_name;
        data.studentId   = student.id;
      }
    }

    // Bước 2: Nếu vẫn thiếu className/studentName (gọi từ HS trực tiếp),
    // tra cứu thêm từ studentCode
    if (data.studentCode && (!data.className || !data.studentName)) {
      const student = await StudentRepository.findByStudentCode(data.studentCode);
      if (student) {
        data.className   = data.className   || student.class_name  || student.className;
        data.studentName = data.studentName || student.full_name   || student.fullName;
        data.studentId   = data.studentId   || student.id;
      }
    }

    data.status = data.status || 'PENDING';
    return await LeaveRequestRepository.create(data);
  }

  static async approveLeaveRequest(id, status = 'APPROVED') {
    const existing = await LeaveRequestRepository.findById(id);
    if (!existing) throw new Error(`Leave request not found with id: ${id}`);
    return await LeaveRequestRepository.updateStatus(id, status);
  }
}
