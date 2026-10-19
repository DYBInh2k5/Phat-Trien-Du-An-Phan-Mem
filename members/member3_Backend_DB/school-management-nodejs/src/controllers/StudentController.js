/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/controllers/StudentController.js
 * Vai trò: Bộ Điều Khiển Hồ Sơ Học Sinh (Student Interface Adapter / Controller)
 * Kiến trúc: Clean Architecture - Tầng Giao Tiếp Ngoại Vi (Interface Adapters)
 * Mẫu thiết kế: Slim Controller (Bộ điều khiển tinh gọn - Không chứa nghiệp vụ)
 * Mô tả:
 *   - Tiếp nhận yêu cầu HTTP từ client Express (GET, POST, PUT).
 *   - Trích xuất tham số từ req.query (className), req.params (id), req.body (dữ liệu học sinh).
 *   - Ủy quyền toàn bộ xử lý nghiệp vụ cho StudentService.
 *   - Đóng gói dữ liệu và phản hồi mã trạng thái HTTP chuẩn mực:
 *     + 200 OK: Truy vấn hoặc cập nhật thành công.
 *     + 201 Created: Thêm mới học sinh thành công.
 *     + 400 Bad Request: Dữ liệu gửi lên không hợp lệ.
 *     + 404 Not Found: Không tìm thấy học sinh với ID tương ứng.
 *     + 500 Internal Server Error: Lỗi hệ thống ngoài tầm kiểm soát.
 * ==============================================================================
 */

import { StudentService } from '../services/StudentService.js';

/**
 * Lớp StudentController - Xử lý các yêu cầu HTTP liên quan đến học sinh
 */
export class StudentController {
  /**
   * API GET /api/students
   * Lấy danh sách học sinh (hỗ trợ lọc theo query param ?className=10A1)
   * @async
   * @param {import('express').Request} req - Yêu cầu HTTP
   * @param {import('express').Response} res - Phản hồi HTTP
   */
  static async getStudents(req, res) {
    try {
      const { className } = req.query; // Trích xuất tham số ?className= từ query string
      const students = await StudentService.getAllStudents(className);
      return res.json(students);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * API GET /api/students/:id
   * Lấy chi tiết một học sinh theo mã định danh ID
   * @async
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async getStudentById(req, res) {
    try {
      const student = await StudentService.getStudentById(req.params.id);
      return res.json(student);
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  /**
   * API POST /api/students
   * Thêm mới một hồ sơ học sinh
   * @async
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async createStudent(req, res) {
    try {
      const created = await StudentService.createStudent(req.body);
      return res.status(201).json(created); // Trả về mã 201 Created khi tạo mới thành công
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * API PUT /api/students/:id
   * Cập nhật thông tin hồ sơ học sinh theo ID
   * @async
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async updateStudent(req, res) {
    try {
      const updated = await StudentService.updateStudent(req.params.id, req.body);
      return res.json(updated);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * API POST /api/students/:id/calculate-gpa
   * Kích hoạt quy trình tính toán GPA và cập nhật danh hiệu học lực
   * @async
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async calculateGPA(req, res) {
    try {
      const updated = await StudentService.calculateAcademicPerformance(req.params.id);
      return res.json(updated);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
