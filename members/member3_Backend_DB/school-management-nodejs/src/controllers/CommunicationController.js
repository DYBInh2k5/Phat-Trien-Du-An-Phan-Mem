import { CommunicationService } from '../services/CommunicationService.js';

/**
 * CommunicationController — Tầng HTTP cho Sổ liên lạc phụ huynh.
 * Nhận request, chuyển context user đã xác thực qua middleware cho Service, trả response và status code chuẩn (400, 403, 500).
 */
export class CommunicationController {

  /**
   * GET /api/communication/contacts
   * Lấy danh sách người có thể liên hệ theo role người dùng đăng nhập.
   * - PH: Ban Giám Hiệu + GVCN các lớp của con.
   * - GVCN: Lớp chủ nhiệm + danh sách phụ huynh lớp.
   * - BGH: Danh mục các lớp trong trường.
   */
  static async getContacts(req, res) {
    try {
      const data = await CommunicationService.getContacts(req.user);
      return res.json({ success: true, data });
    } catch (err) {
      console.error('[CommunicationController] getContacts error:', err);
      const status = err.status || 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/communication/page-data?className=10A1
   * Trả về: { classes, notifications } có lọc theo quyền.
   */
  static async getPageData(req, res) {
    try {
      const { className } = req.query;
      const data = await CommunicationService.getPageData(className || null, req.user);
      return res.json({ success: true, ...data });
    } catch (err) {
      console.error('[CommunicationController] getPageData error:', err);
      const status = err.status || 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/communication/students?className=10A1
   * Trả về danh sách học sinh (phụ huynh) theo lớp.
   * Trả về 403 nếu GVCN xem lớp khác hoặc Phụ huynh gọi API này.
   */
  static async getStudents(req, res) {
    try {
      const { className } = req.query;
      if (!className) {
        return res.status(400).json({ success: false, message: 'Thiếu tham số className' });
      }
      const students = await CommunicationService.getStudentsByClass(className, req.user);
      return res.json({ success: true, data: students });
    } catch (err) {
      console.error('[CommunicationController] getStudents error:', err);
      const status = err.status || 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/communication/notifications
   * Body: { title, content, type, senderId, recipients }
   * Gửi thông báo mới (Chỉ BGH/GVCN).
   */
  static async sendNotification(req, res) {
    try {
      const { title, content, type, senderId, recipients } = req.body;
      const notif = await CommunicationService.sendNotification({
        title, content, type, senderId, recipients, user: req.user,
      });
      return res.status(201).json({ success: true, data: notif });
    } catch (err) {
      console.error('[CommunicationController] sendNotification error:', err);
      const status = err.status || (err.message.startsWith('Thiếu') ? 400 : 500);
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/communication/messages?studentId=HS001&conversationType=GVCN
   * Lấy thread tin nhắn của một học sinh theo kênh.
   * Trả về 403 nếu Phụ huynh truy cập học sinh khác hoặc GVCN truy cập lớp khác.
   */
  static async getThread(req, res) {
    try {
      const { studentId, conversationType } = req.query;
      if (!studentId) {
        return res.status(400).json({ success: false, message: 'Thiếu tham số studentId' });
      }
      const messages = await CommunicationService.getThread(
        studentId,
        conversationType || 'GVCN',
        req.user
      );
      return res.json({ success: true, data: messages });
    } catch (err) {
      console.error('[CommunicationController] getThread error:', err);
      const status = err.status || 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/communication/messages
   * Body: { studentId, className, fromRole, message, conversationType }
   * Gửi tin nhắn mới vào thread.
   */
  static async sendMessage(req, res) {
    try {
      const { studentId, className, fromRole, message, conversationType } = req.body;
      const msg = await CommunicationService.sendMessage({
        studentId,
        className,
        fromRole,
        message,
        conversationType: conversationType || 'GVCN',
        user: req.user,
      });
      return res.status(201).json({ success: true, data: msg });
    } catch (err) {
      console.error('[CommunicationController] sendMessage error:', err);
      const status = err.status || (err.message.startsWith('Thiếu') ? 400 : 500);
      return res.status(status).json({ success: false, message: err.message });
    }
  }
}
