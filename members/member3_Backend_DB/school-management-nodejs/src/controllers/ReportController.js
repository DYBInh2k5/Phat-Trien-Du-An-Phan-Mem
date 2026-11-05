import { ReportService } from '../services/ReportService.js';
import { NotificationService } from '../services/NotificationService.js';
import { ClosureRepository } from '../repositories/ClosureRepository.js';

/**
 * ReportController — Tầng HTTP cho trang Báo cáo BGH.
 * Chỉ nhận request, gọi Service, trả response — không chứa SQL hay business logic.
 */
export class ReportController {
  /**
   * GET /api/reports/bgh?semester=HK1&schoolYear=2024-2025
   * Trả về toàn bộ dữ liệu cần thiết cho trang báo cáo BGH.
   */
  static async getReportData(req, res) {
    try {
      const { semester = 'HK1', schoolYear = '2024-2025' } = req.query;
      const data = await ReportService.getReportData(semester, schoolYear);
      return res.json({ success: true, ...data });
    } catch (err) {
      console.error('[ReportController] getReportData error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/reports/bgh/approve
   * Body: { classId, semester, schoolYear }
   * Ký duyệt sổ điểm một lớp.
   */
  static async approveClass(req, res) {
    try {
      const { classId, semester, schoolYear } = req.body;
      if (!classId || !semester || !schoolYear) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu tham số: classId, semester, schoolYear',
        });
      }
      const result = await ReportService.approveClass(classId, semester, schoolYear);
      return res.json({ success: true, data: result });
    } catch (err) {
      console.error('[ReportController] approveClass error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/reports/bgh/lock-all
   * Body: { semester, schoolYear }
   * Khóa sổ toàn trường.
   */
  static async lockAll(req, res) {
    try {
      const { semester, schoolYear } = req.body;
      if (!semester || !schoolYear) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu tham số: semester, schoolYear',
        });
      }
      const result = await ReportService.lockAll(semester, schoolYear);
      return res.json({
        success: true,
        message: `Đã khóa sổ ${result.lockedCount} lớp.`,
        ...result,
      });
    } catch (err) {
      console.error('[ReportController] lockAll error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/reports/bgh/approve-unlock
   * Body: { notificationId, classId, className, gvcnUsername, semester, schoolYear }
   * BGH duyệt yêu cầu mở khóa sổ điểm.
   */
  static async approveBGHUnlock(req, res) {
    try {
      const { notificationId, classId, className, gvcnUsername, semester, schoolYear } = req.body;
      if (!classId || !semester || !schoolYear || !gvcnUsername) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu tham số: classId, semester, schoolYear, gvcnUsername',
        });
      }

      // Reset closure về 'approved' để GVCN có thể chỉnh sửa lại
      // (không reset về 'submitted' vì submitted cũng là read-only với GVCN)
      await ClosureRepository.updateStatus(classId, semester, schoolYear, 'approved');

      // Đánh dấu notification đã xử lý nếu có
      if (notificationId) {
        await NotificationService.markRead(notificationId);
      }

      // Gửi notification cho GVCN biết đã được duyệt
      await NotificationService.notify({
        title:           `BGH đã duyệt mở khóa sổ điểm lớp ${className ?? classId}`,
        type:            'unlock_approved',
        senderId:        req.user?.username,
        senderRole:      'BGH',
        recipients:      [gvcnUsername],
        relatedClass:    classId,
        relatedSemester: semester,
      });

      return res.json({ success: true, message: 'Đã duyệt mở khóa sổ điểm thành công.' });
    } catch (err) {
      console.error('[ReportController] approveBGHUnlock error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
