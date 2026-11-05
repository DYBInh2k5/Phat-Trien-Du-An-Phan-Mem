import { ClosureService } from '../services/ClosureService.js';

/**
 * ClosureController — Tầng HTTP cho chốt sổ điểm.
 * Chỉ nhận request, gọi Service, trả response — không chứa SQL hay business logic.
 */
export class ClosureController {
  /**
   * POST /api/gradebook/closure/submit
   * Body: { classId, className, gvcnName, semester, schoolYear }
   */
  static async submitClosure(req, res) {
    try {
      const { classId, className, gvcnName, semester, schoolYear } = req.body;
      if (!classId || !semester || !schoolYear) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu tham số: classId, semester, schoolYear',
        });
      }
      const gvcnUsername = req.user?.username;
      const result = await ClosureService.submitClosure({
        classId,
        className: className ?? classId,
        gvcnName:  gvcnName ?? gvcnUsername,
        gvcnUsername,
        semester,
        schoolYear,
      });
      return res.json({ success: true, data: result });
    } catch (err) {
      console.error('[ClosureController] submitClosure error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/gradebook/closure/request-unlock
   * Body: { classId, className, gvcnName, semester, schoolYear, reason }
   */
  static async requestUnlock(req, res) {
    try {
      const { classId, className, gvcnName, semester, schoolYear, reason } = req.body;
      if (!classId || !semester || !schoolYear) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu tham số: classId, semester, schoolYear',
        });
      }
      const gvcnUsername = req.user?.username;
      const result = await ClosureService.requestUnlock({
        classId,
        className:   className ?? classId,
        gvcnName:    gvcnName ?? gvcnUsername,
        gvcnUsername,
        semester,
        schoolYear,
        reason:      reason ?? '',
      });
      return res.json(result);
    } catch (err) {
      console.error('[ClosureController] requestUnlock error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/gradebook/closure?classId=&semester=&schoolYear=
   */
  static async getStatus(req, res) {
    try {
      const { classId, semester, schoolYear } = req.query;
      if (!classId || !semester || !schoolYear) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu tham số: classId, semester, schoolYear',
        });
      }
      const closure = await ClosureService.getStatus({ classId, semester, schoolYear });
      return res.json({ success: true, data: closure });
    } catch (err) {
      console.error('[ClosureController] getStatus error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
