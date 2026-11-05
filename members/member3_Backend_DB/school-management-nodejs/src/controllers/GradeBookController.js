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
   * GET /api/gradebook/page-data?className=10A1&semester=HK1&schoolYear=2024-2025
   * Trả về classes, subjects, students, gradeRows cho GradebookPage.
   */
  static async getPageData(req, res) {
    try {
      let { className, semester = 'HK1', schoolYear = '2024-2025' } = req.query;
      // GVCN scope: override className bằng lớp được phân công (trusted)
      if (req.user?.role === 'GVCN') {
        if (req.gvcnClassName === '__NO_CLASS__') {
          return res.status(403).json({ success: false, message: 'GVCN chưa được phân công lớp chủ nhiệm.', code: 'GVCN_NOT_ASSIGNED' });
        }
        className = req.gvcnClassName;
      }
      if (!className) {
        return res.status(400).json({ success: false, message: 'Thiếu tham số className' });
      }
      const data = await GradeBookService.getGradebookPageData(className, semester, schoolYear);
      return res.json({ success: true, ...data });
    } catch (err) {
      console.error('[GradeBookController] getPageData error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * API GET /api/gradebook
   * Lấy dữ liệu sổ điểm theo các tham số truy vấn trên URL (?className=10A1&subjectName=Toán)
   * @async
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async getGradeBook(req, res) {
    try {
      let query = { ...req.query };

      // GVCN scope: force className
      if (req.user?.role === 'GVCN') {
        if (req.gvcnClassName === '__NO_CLASS__') {
          return res.status(403).json({ success: false, message: 'GVCN chưa được phân công lớp chủ nhiệm.', code: 'GVCN_NOT_ASSIGNED' });
        }
        query.className = req.gvcnClassName;
      }

      // HS scope: resolve studentCode thật từ JWT thay vì tin query string
      // (vì HS đăng nhập bằng username, không phải student_code)
      if (req.user?.role === 'HS') {
        const { querySafe } = await import('../config/db.js');
        // Lấy full_name từ bảng users theo id (JWT chỉ chứa id, username, role)
        const userRes = await querySafe(
          `SELECT full_name FROM users WHERE id = $1 LIMIT 1`,
          [req.user.id]
        );
        const fullName = userRes?.rows?.[0]?.full_name ?? null;

        let resolvedCode = null;
        if (fullName) {
          // Tìm student_code theo full_name
          const studentRes = await querySafe(
            `SELECT student_code FROM students WHERE LOWER(full_name) = LOWER($1) LIMIT 1`,
            [fullName]
          );
          resolvedCode = studentRes?.rows?.[0]?.student_code ?? null;
        }

        // Fallback: thử dùng username trực tiếp nếu trùng với student_code
        if (!resolvedCode) {
          const byCodeRes = await querySafe(
            `SELECT student_code FROM students WHERE student_code = $1 LIMIT 1`,
            [req.user.username]
          );
          resolvedCode = byCodeRes?.rows?.[0]?.student_code ?? null;
        }

        if (resolvedCode) {
          query.studentCode = resolvedCode;
        }
      }

      // PH scope: resolve studentCode qua bảng parent_students
      if (req.user?.role === 'PH') {
        const { querySafe } = await import('../config/db.js');
        const res = await querySafe(
          `SELECT s.student_code
           FROM students s
           JOIN parent_students ps ON ps.student_code = s.student_code
           WHERE ps.parent_user_id = $1
           LIMIT 1`,
          [req.user.id]
        );
        const resolvedCode = res?.rows?.[0]?.student_code ?? null;
        if (resolvedCode) {
          query.studentCode = resolvedCode;
        }
      }

      const grades = await GradeBookService.getGrades(query);
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
      // GVCN scope check
      if (req.user?.role === 'GVCN') {
        if (req.gvcnClassName === '__NO_CLASS__') {
          return res.status(403).json({ success: false, message: 'GVCN chưa được phân công lớp chủ nhiệm.', code: 'GVCN_NOT_ASSIGNED' });
        }
        const items = Array.isArray(payload) ? payload : [payload];
        for (const item of items) {
          const itemClass = item.className || item.class_name;
          if (itemClass && itemClass !== req.gvcnClassName) {
            return res.status(403).json({ success: false, message: 'GVCN chỉ được nhập điểm lớp chủ nhiệm của mình.', code: 'GVCN_SCOPE_VIOLATION' });
          }
        }
      }
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
   * POST /api/gradebook/save-spreadsheet
   * Body: { className, semester, schoolYear, items: [...] }
   * Lưu hàng loạt từ trang spreadsheet GradebookPage.
   */
  static async saveSpreadsheet(req, res) {
    try {
      const { items } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Không có dữ liệu để lưu' });
      }
      // GVCN scope check
      if (req.user?.role === 'GVCN') {
        if (req.gvcnClassName === '__NO_CLASS__') {
          return res.status(403).json({ success: false, message: 'GVCN chưa được phân công lớp chủ nhiệm.', code: 'GVCN_NOT_ASSIGNED' });
        }
        for (const item of items) {
          const itemClass = item.className || item.class_name;
          if (itemClass && itemClass !== req.gvcnClassName) {
            return res.status(403).json({ success: false, message: 'GVCN chỉ được nhập điểm lớp chủ nhiệm của mình.', code: 'GVCN_SCOPE_VIOLATION' });
          }
        }
      }
      const saved = await GradeBookService.saveGradesFromSpreadsheet(items);
      return res.json({
        success: true,
        message: `Đã lưu ${saved.length} dòng điểm vào PostgreSQL!`,
        count: saved.length,
      });
    } catch (err) {
      console.error('[GradeBookController] saveSpreadsheet error:', err);
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

  /**
   * POST /api/gradebook/review-request
   * Body: { studentCode, subjectName, semester, schoolYear, reason, currentScore }
   * Học sinh nộp đơn phúc khảo điểm.
   */
  static async submitReviewRequest(req, res) {
    try {
      const { studentCode, subjectName, semester, schoolYear, reason, currentScore } = req.body;
      if (!studentCode || !subjectName || !semester) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu tham số: studentCode, subjectName, semester',
        });
      }
      // Use in-memory store (same pattern as other controllers that lack a dedicated table)
      const id = `REVIEW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const record = {
        id,
        studentCode,
        subjectName,
        semester: semester ?? 'HK1',
        schoolYear: schoolYear ?? '2024-2025',
        reason: reason ?? '',
        currentScore: currentScore ?? null,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        requestType: 'GRADE_REVIEW',
      };

      // Push into shared in-memory list (initialised once per process)
      if (!global._gradeReviewRequests) global._gradeReviewRequests = [];
      global._gradeReviewRequests.push(record);

      // Try to persist via notifications table so GVBM gets notified
      try {
        const { NotificationService } = await import('../services/NotificationService.js');
        await NotificationService.notify({
          title:           `Phúc khảo điểm: ${subjectName}`,
          content:         `Học sinh ${studentCode} yêu cầu phúc khảo môn ${subjectName} ${semester}. Lý do: ${reason ?? '(không có)'}`,
          type:            'GRADE_REVIEW_REQUEST',
          senderId:        studentCode,
          senderRole:      'STUDENT',
          recipients:      ['GV', 'GVBM'],
          relatedClass:    null,
          relatedSemester: semester,
        });
      } catch (_notifyErr) {
        // Notification failure is non-blocking
        console.warn('[GradeBookController] submitReviewRequest: notification không gửi được:', _notifyErr?.message);
      }

      return res.json({ success: true, data: { id, status: 'PENDING' } });
    } catch (err) {
      console.error('[GradeBookController] submitReviewRequest error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/gradebook/review-requests
   * GV/GVCN xem danh sách đơn phúc khảo đang chờ.
   * Filter theo subjectName (query) hoặc className từ JWT.
   */
  static async getReviewRequests(req, res) {
    try {
      const { subjectName, className } = req.query;
      const role = req.user?.role;

      let list = global._gradeReviewRequests ?? [];

      // Filter: GVCN thấy lớp chủ nhiệm; GV/GVBM lọc thêm theo môn nếu có
      if (subjectName) {
        list = list.filter(r => r.subjectName === subjectName);
      }
      // Always return only pending by default (show active review queue)
      const pending = list.filter(r => r.status === 'PENDING');

      return res.json({ success: true, data: pending });
    } catch (err) {
      console.error('[GradeBookController] getReviewRequests error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
