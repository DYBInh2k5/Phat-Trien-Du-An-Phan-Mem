import { ScheduleService } from '../services/ScheduleService.js';

/**
 * ScheduleController — Tầng HTTP cho thời khóa biểu.
 * Chỉ nhận request, gọi Service, trả response — không chứa SQL hay business logic.
 */
export class ScheduleController {
  /**
   * GET /api/schedules?classId=10A1&weekStart=2024-11-11
   * Trả về: { slots, allWeekSlots, classes, subjects, teacherNames }
   */
  static async getSchedulePageData(req, res) {
    try {
      const { classId, weekStart } = req.query;
      if (!classId || !weekStart) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu tham số classId hoặc weekStart',
        });
      }
      const data = await ScheduleService.getSchedulePageData(classId, weekStart);
      return res.json({ success: true, ...data });
    } catch (err) {
      console.error('[ScheduleController] getSchedulePageData error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/schedules
   * Body: { classId, weekStart, dayOfWeek, period, subjectName, teacherName, room, timeRange? }
   * Trả về slot đã upsert.
   */
  static async saveSlot(req, res) {
    try {
      const { classId, weekStart, dayOfWeek, period, subjectName, teacherName, room } = req.body;
      if (!classId || !weekStart || !dayOfWeek || !period || !subjectName || !teacherName || !room) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc: classId, weekStart, dayOfWeek, period, subjectName, teacherName, room',
        });
      }
      const saved = await ScheduleService.saveSlot(req.body);
      return res.json({ success: true, data: saved });
    } catch (err) {
      console.error('[ScheduleController] saveSlot error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * DELETE /api/schedules
   * Body: { classId, weekStart, dayOfWeek, period }
   */
  static async deleteSlot(req, res) {
    try {
      const { classId, weekStart, dayOfWeek, period } = req.body;
      if (!classId || !weekStart || !dayOfWeek || !period) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin: classId, weekStart, dayOfWeek, period',
        });
      }
      await ScheduleService.deleteSlot(classId, weekStart, dayOfWeek, period);
      return res.json({ success: true, message: 'Đã xóa tiết học.' });
    } catch (err) {
      console.error('[ScheduleController] deleteSlot error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/schedules/templates?classId=10A1
   * Trả về lịch cố định hàng tuần của một lớp.
   */
  static async getTemplates(req, res) {
    try {
      const { classId } = req.query;
      if (!classId) {
        return res.status(400).json({ success: false, message: 'Thiếu tham số classId' });
      }
      const templates = await ScheduleService.getTemplatesByClass(classId);
      return res.json({ success: true, templates });
    } catch (err) {
      console.error('[ScheduleController] getTemplates error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
