/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/controllers/GradeBookController.js
 * Vai trò: Bộ Điều Khiển Sổ Điểm Điện Tử (GradeBook Interface Adapter / Controller)
 * Kiến trúc: Clean Architecture - Tầng Giao Tiếp Ngoại Vi (Interface Adapters)
 * Mẫu thiết kế: Slim Controller
 * Mô tả:
 *   - Tiếp nhận yêu cầu HTTP liên quan đến sổ điểm môn học.
 *   - Hỗ trợ lấy sổ điểm theo bộ lọc query (className, subjectName, studentCode).
 *   - Hỗ trợ lưu điểm đơn lẻ hoặc lưu đồng loạt mảng đối tượng cả lớp (Batch Save).
 *   - Hỗ trợ các hành động nghiệp vụ đặc thù: Khóa sổ điểm (Lock) và Mở khóa sổ điểm (Unlock).
 * ==============================================================================
 */

import { GradeBookService } from '../services/GradeBookService.js';

/**
 * Lớp GradeBookController - Xử lý các yêu cầu HTTP liên quan đến sổ điểm
 */
export class GradeBookController {
  /**
   * API GET /api/gradebook
   * Lấy dữ liệu sổ điểm theo các tham số truy vấn trên URL (?className=10A1&subjectName=Toán)
   * @async
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async getGradeBook(req, res) {
    try {
      const grades = await GradeBookService.getGrades(req.query);
      return res.json(grades);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * API POST /api/gradebook/save
   * Lưu điểm học sinh. Hỗ trợ cả 2 định dạng:
   * 1. Đối tượng đơn lẻ: { studentCode: 'HS001', scoreOral: 9, ... }
   * 2. Mảng đối tượng cả lớp: [ { studentCode: 'HS001', ... }, { studentCode: 'HS002', ... } ]
   * @async
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async saveGrades(req, res) {
    try {
      const payload = req.body;
      let count = 0;

      // Phân nhánh: Nếu gửi mảng -> Lưu hàng loạt
      if (Array.isArray(payload)) {
        const saved = await GradeBookService.saveAllGrades(payload);
        count = saved.length;
      } else {
        // Nếu gửi đối tượng đơn lẻ -> Lưu 1 em
        await GradeBookService.saveGrade(payload);
        count = 1;
      }

      return res.json({
        success: true,
        message: 'Đã lưu thông tin sổ điểm thành công vào Node.js & PostgreSQL!',
        count,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * API POST /api/gradebook/lock
   * Khóa sổ điểm của một lớp và môn học (Chặn giáo viên sửa điểm sau hạn chót)
   * @async
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async lockGradeSheet(req, res) {
    try {
      const { className, subjectName } = req.query;
      await GradeBookService.lockGradeSheet(className, subjectName);
      return res.json({
        success: true,
        message: `Đã khóa sổ điểm lớp ${className} môn ${subjectName}`,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * API POST /api/gradebook/unlock
   * Mở khóa sổ điểm cho phép giáo viên chỉnh sửa lại theo phê duyệt của Ban Giám Hiệu
   * @async
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async unlockGradeSheet(req, res) {
    try {
      const { className, subjectName } = req.query;
      await GradeBookService.unlockGradeSheet(className, subjectName);
      return res.json({
        success: true,
        message: `Đã mở khóa sổ điểm lớp ${className} môn ${subjectName}`,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
