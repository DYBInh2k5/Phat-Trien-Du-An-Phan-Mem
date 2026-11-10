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

const SENTINEL = '__NO_CLASS__';

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
      const students = await StudentService.getAllStudents(className, req.gvcnClassName ?? null);
      return res.json(students);
    } catch (err) {
      if (err.code === 'GVCN_NOT_ASSIGNED') {
        return res.status(403).json({ success: false, message: err.message, code: err.code });
      }
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
      // GVCN chưa phân công → từ chối
      if (req.gvcnClassName === SENTINEL) {
        return res.status(403).json({ success: false, message: 'GVCN chưa được phân công lớp chủ nhiệm.', code: 'GVCN_NOT_ASSIGNED' });
      }
      const student = await StudentService.getStudentById(req.params.id);
      // GVCN đã phân công → chỉ được xem học sinh lớp mình
      if (req.gvcnClassName !== null && req.gvcnClassName !== undefined) {
        const studentClass = student.class_name || student.className;
        if (studentClass !== req.gvcnClassName) {
          return res.status(403).json({ success: false, message: 'Không có quyền truy cập dữ liệu học sinh ngoài lớp chủ nhiệm.', code: 'GVCN_SCOPE_VIOLATION' });
        }
      }
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
      // GVCN chưa phân công → từ chối
      if (req.gvcnClassName === SENTINEL) {
        return res.status(403).json({ success: false, message: 'GVCN chưa được phân công lớp chủ nhiệm.', code: 'GVCN_NOT_ASSIGNED' });
      }
      // GVCN đã phân công → chỉ được tạo học sinh vào lớp mình
      if (req.gvcnClassName !== null && req.gvcnClassName !== undefined) {
        const targetClass = req.body.className || req.body.class_name;
        if (targetClass !== req.gvcnClassName) {
          return res.status(403).json({ success: false, message: 'GVCN chỉ được tạo học sinh thuộc lớp chủ nhiệm.', code: 'GVCN_SCOPE_VIOLATION' });
        }
      }
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
      // GVCN chưa phân công → từ chối
      if (req.gvcnClassName === SENTINEL) {
        return res.status(403).json({ success: false, message: 'GVCN chưa được phân công lớp chủ nhiệm.', code: 'GVCN_NOT_ASSIGNED' });
      }
      // GVCN đã phân công → kiểm tra học sinh có thuộc lớp mình không
      if (req.gvcnClassName !== null && req.gvcnClassName !== undefined) {
        const student = await StudentService.getStudentById(req.params.id);
        const studentClass = student.class_name || student.className;
        if (studentClass !== req.gvcnClassName) {
          return res.status(403).json({ success: false, message: 'Không có quyền sửa dữ liệu học sinh ngoài lớp chủ nhiệm.', code: 'GVCN_SCOPE_VIOLATION' });
        }
      }
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

  static async updateConduct(req, res) {
    try {
      // GVCN chưa phân công → từ chối
      if (req.gvcnClassName === '__NO_CLASS__') {
        return res.status(403).json({ success: false, message: 'GVCN chưa được phân công lớp chủ nhiệm.', code: 'GVCN_NOT_ASSIGNED' });
      }
      // GVCN đã phân công → kiểm tra học sinh có thuộc lớp mình không
      if (req.gvcnClassName !== null && req.gvcnClassName !== undefined) {
        const student = await StudentService.getStudentById(req.params.id);
        const studentClass = student.class_name || student.className;
        if (studentClass !== req.gvcnClassName) {
          return res.status(403).json({ success: false, message: 'Không có quyền cập nhật hạnh kiểm học sinh ngoài lớp chủ nhiệm.', code: 'GVCN_SCOPE_VIOLATION' });
        }
      }
      const { conductRank, schoolYear, semester } = req.body;
      const validRanks = ['Tốt', 'Khá', 'Trung bình', 'Yếu'];
      if (!conductRank || !validRanks.includes(conductRank)) {
        return res.status(400).json({ success: false, message: 'Hạnh kiểm không hợp lệ. Các giá trị cho phép: Tốt, Khá, Trung bình, Yếu' });
      }
      const result = await StudentService.updateStudent(req.params.id, { conductRank, schoolYear, semester });
      return res.json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
