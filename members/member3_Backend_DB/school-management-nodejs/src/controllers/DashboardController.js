import { DashboardService } from '../services/DashboardService.js';

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
}
