import { DashboardService } from '../services/DashboardService.js';
import { LeaveRequestService } from '../services/LeaveRequestService.js';

/**
 * DashboardController — Tầng xử lý HTTP cho Dashboard.
 * Chỉ nhận request, gọi Service, và trả response — không chứa SQL hay business logic.
 */
export class DashboardController {
  /**
   * GET /api/dashboard/bgh
   * Dashboard tổng quan cho Ban Giám Hiệu.
   */
  static async getBGHDashboard(req, res) {
    try {
      const data = await DashboardService.getBGHSummary();
      return res.json({ success: true, data });
    } catch (err) {
      console.error('[DashboardController] getBGHDashboard error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Lỗi khi lấy dữ liệu dashboard BGH',
      });
    }
  }

  /**
   * GET /api/dashboard/gvcn
   * Dashboard tổng quan cho Giáo Viên Chủ Nhiệm.
   * Yêu cầu JWT — lấy user.id (trusted) để tìm lớp chủ nhiệm qua homeroom_teacher_id FK.
   */
  static async getGVCNDashboard(req, res) {
    try {
      const gvcnUserId = req.user?.id;
      if (!gvcnUserId) {
        return res.status(401).json({ success: false, message: 'Không xác định được tài khoản GVCN' });
      }
      const data = await DashboardService.getGVCNSummary(gvcnUserId);
      return res.json({ success: true, data });
    } catch (err) {
      console.error('[DashboardController] getGVCNDashboard error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Lỗi khi lấy dữ liệu dashboard GVCN',
      });
    }
  }

  /**
   * PATCH /api/dashboard/gvcn/leave-requests/:id
   * Duyệt hoặc từ chối đơn xin nghỉ học.
   * Body: { action: 'approve' | 'reject' }
   */
  static async processLeaveRequest(req, res) {
    try {
      const { id } = req.params;
      const { action } = req.body;
      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ success: false, message: 'action phải là approve hoặc reject' });
      }
      const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
      const updated = await LeaveRequestService.approveLeaveRequest(Number(id), status);
      return res.json({ success: true, data: updated });
    } catch (err) {
      console.error('[DashboardController] processLeaveRequest error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
