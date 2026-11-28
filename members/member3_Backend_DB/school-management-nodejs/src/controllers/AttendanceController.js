import { AttendanceService } from '../services/AttendanceService.js';

export class AttendanceController {
  static async getAttendance(req, res) {
    try {
      // GVCN scope: force className to their assigned class
      if (req.user?.role === 'GVCN') {
        if (req.gvcnClassName === '__NO_CLASS__') {
          return res.status(403).json({ success: false, message: 'GVCN chưa được phân công lớp chủ nhiệm.', code: 'GVCN_NOT_ASSIGNED' });
        }
        const forcedQuery = { ...req.query, className: req.gvcnClassName };
        delete forcedQuery.studentCode;
        const records = await AttendanceService.getAttendance(forcedQuery);
        return res.json(records);
      }
      // Truyền thêm period (nếu có) cho filter theo tiết
      const records = await AttendanceService.getAttendance(req.query);
      return res.json(records);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getAttendanceSummary(req, res) {
    try {
      const { dateFrom, dateTo, className } = req.query;
      const result = await AttendanceService.getAttendanceSummaryForBGH({ dateFrom, dateTo, className });
      return res.json({ success: true, ...result });
    } catch (err) {
      console.error('[AttendanceController] getAttendanceSummary error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async saveAttendance(req, res) {
    try {
      const payload = req.body;
      // username người điểm danh lấy từ JWT (trusted) — không lấy từ body
      const recordedBy = req.user?.username ?? null;

      // ── Chuẩn hóa thành mảng flat records ──
      let records = [];
      if (Array.isArray(payload)) {
        records = payload;
      } else if (Array.isArray(payload.entries)) {
        records = payload.entries.map((entry) => ({
          studentCode:  entry.studentCode  || entry.student_code,
          studentName:  entry.studentName  || entry.student_name  || '',
          status:       entry.status,
          lateMinutes:  entry.lateMinutes  != null ? Number(entry.lateMinutes)  : 0,
          className:    entry.className    || entry.class_name    || payload.className || payload.class_name,
          attDate:      entry.attDate      || entry.att_date      || payload.attDate   || payload.att_date,
          // period từ wrapper (áp dụng cho tất cả entries) hoặc từng entry (nếu mixed)
          period:       entry.period       != null ? Number(entry.period)       : (payload.period != null ? Number(payload.period) : 0),
          subjectName:  entry.subjectName  || entry.subject_name  || payload.subjectName || null,
          recordedBy,   // luôn lấy từ JWT
        }));
      } else {
        records = [{ ...payload, recordedBy }];
      }

      if (records.length === 0) {
        return res.status(400).json({ success: false, message: 'Không có dữ liệu điểm danh để lưu.' });
      }

      // ── GVCN scope check ──
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
        message: `Đã lưu ${saved.length} bản ghi điểm danh thành công!`,
        count: saved.length,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
