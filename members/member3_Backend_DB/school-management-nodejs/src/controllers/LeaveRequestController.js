import { LeaveRequestService } from '../services/LeaveRequestService.js';

export class LeaveRequestController {
  static async getLeaveRequests(req, res) {
    try {
      const requests = await LeaveRequestService.getLeaveRequests(req.query);
      return res.json(requests);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async submitLeaveRequest(req, res) {
    try {
      const created = await LeaveRequestService.submitLeaveRequest(req.body);
      return res.status(201).json({
        success: true,
        message: 'Đã nộp đơn xin nghỉ học thành công!',
        data: created,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async approveLeaveRequest(req, res) {
    try {
      const { status } = req.query;
      const updated = await LeaveRequestService.approveLeaveRequest(req.params.id, status || 'APPROVED');
      return res.json({
        success: true,
        message: 'Đã cập nhật trạng thái đơn xin nghỉ học thành công!',
        data: updated,
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
