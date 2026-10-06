import { TuitionService } from '../services/TuitionService.js';

export class TuitionController {
  static async getTuitions(req, res) {
    try {
      const records = await TuitionService.getTuitions(req.query);
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
