import { AttendanceService } from '../services/AttendanceService.js';

export class AttendanceController {
  static async getAttendance(req, res) {
    try {
      const records = await AttendanceService.getAttendance(req.query);
      return res.json(records);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/attendance/summary
   * Tổng hợp chuyên cần theo lớp cho BGH.
   * Query params: dateFrom, dateTo, className
   */
  static async getAttendanceSummary(req, res) {
    try {
      const { dateFrom, dateTo, className } = req.query;
      const result = await AttendanceService.getAttendanceSummaryForBGH({
        dateFrom,
        dateTo,
        className,
      });
      return res.json({ success: true, ...result });
    } catch (err) {
      console.error('[AttendanceController] getAttendanceSummary error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async saveAttendance(req, res) {
    try {
      const payload = req.body;
      let count = 0;

      if (Array.isArray(payload)) {
        const saved = await AttendanceService.saveAllAttendance(payload);
        count = saved.length;
      } else {
        await AttendanceService.saveAttendance(payload);
        count = 1;
      }

      return res.json({
        success: true,
        message: 'Đã lưu thông tin điểm danh thành công vào PostgreSQL!',
        count,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
