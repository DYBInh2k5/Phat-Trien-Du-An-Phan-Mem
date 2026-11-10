import { AttendanceService } from '../services/AttendanceService.js';

export class AttendanceController {
  static async getAttendance(req, res) {
    try {
      // GVCN scope: force className to their assigned class
      if (req.user?.role === 'GVCN') {
        if (req.gvcnClassName === '__NO_CLASS__') {
          return res.status(403).json({ success: false, message: 'GVCN chưa được phân công lớp chủ nhiệm.', code: 'GVCN_NOT_ASSIGNED' });
        }
        // Override any className from query with the trusted assigned class
        const forcedQuery = { ...req.query, className: req.gvcnClassName };
        delete forcedQuery.studentCode; // GVCN sees class-level data, not individual lookup bypass
        const records = await AttendanceService.getAttendance(forcedQuery);
        return res.json(records);
      }
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
      console.log('[AttendanceController] saveAttendance raw body:', JSON.stringify(payload));

      // ── Chuẩn hóa thành mảng flat records ──────────────────────────────────
      // Frontend gửi: { className, attDate, entries: [{ studentCode, studentName, status }] }
      // Hoặc legacy:  [{ className, attDate, studentCode, status }, ...]
      let records = [];

      if (Array.isArray(payload)) {
        // Legacy array format
        records = payload;
      } else if (Array.isArray(payload.entries)) {
        // New format: bóc entries ra, gắn className + attDate từ wrapper
        records = payload.entries.map((entry) => ({
          studentCode: entry.studentCode || entry.student_code,
          studentName: entry.studentName || entry.student_name || '',
          status:      entry.status,
          className:   entry.className   || entry.class_name   || payload.className || payload.class_name,
          attDate:     entry.attDate     || entry.att_date     || payload.attDate   || payload.att_date,
        }));
      } else {
        // Single record
        records = [payload];
      }

      if (records.length === 0) {
        return res.status(400).json({ success: false, message: 'Không có dữ liệu điểm danh để lưu.' });
      }

      // ── GVCN scope check ────────────────────────────────────────────────────
      if (req.user?.role === 'GVCN') {
        if (req.gvcnClassName === '__NO_CLASS__') {
          return res.status(403).json({ success: false, message: 'GVCN chưa được phân công lớp chủ nhiệm.', code: 'GVCN_NOT_ASSIGNED' });
        }
        for (const item of records) {
          const itemClass = item.className || item.class_name;
          if (itemClass && itemClass !== req.gvcnClassName) {
            return res.status(403).json({ success: false, message: 'GVCN chỉ được điểm danh lớp chủ nhiệm của mình.', code: 'GVCN_SCOPE_VIOLATION' });
          }
        }
      }

      const saved = await AttendanceService.saveAllAttendance(records);

      return res.json({
        success: true,
        message: 'Đã lưu thông tin điểm danh thành công vào PostgreSQL!',
        count: saved.length,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
