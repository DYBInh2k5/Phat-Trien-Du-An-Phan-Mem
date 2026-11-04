import { TuitionService } from '../services/TuitionService.js';
import { querySafe } from '../config/db.js';

export class TuitionController {
  static async getTuitions(req, res) {
    try {
      let { studentCode, className } = req.query;

      // PH scope: resolve studentCode qua parent_students
      if (req.user?.role === 'PH') {
        const res2 = await querySafe(
          `SELECT s.student_code
           FROM students s
           JOIN parent_students ps ON ps.student_code = s.student_code
           WHERE ps.parent_user_id = $1
           LIMIT 1`,
          [req.user.id]
        );
        const resolved = res2?.rows?.[0]?.student_code ?? null;
        if (resolved) studentCode = resolved;
      }

      // HS scope: resolve studentCode từ full_name
      if (req.user?.role === 'HS') {
        const userRes = await querySafe(
          `SELECT full_name FROM users WHERE id = $1 LIMIT 1`,
          [req.user.id]
        );
        const fullName = userRes?.rows?.[0]?.full_name ?? null;
        if (fullName) {
          const studentRes = await querySafe(
            `SELECT student_code FROM students WHERE LOWER(full_name) = LOWER($1) LIMIT 1`,
            [fullName]
          );
          const resolved = studentRes?.rows?.[0]?.student_code ?? null;
          if (resolved) studentCode = resolved;
        }
      }

      const records = await TuitionService.getTuitions({ studentCode, className });
      return res.json(records);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async payTuition(req, res) {
    try {
      const { studentCode, amount } = req.body;
      const parsedAmount = parseFloat(amount || 0);

      const { saved, receiptNo } = await TuitionService.payTuition(studentCode, parsedAmount);

      return res.json({
        success: true,
        message: 'Thanh toán học phí thành công! Đã ghi nhận biên lai điện tử.',
        receiptNo,
        data: saved,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
