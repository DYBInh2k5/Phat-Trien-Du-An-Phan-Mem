import { NotificationService } from '../services/NotificationService.js';

/**
 * NotificationController — Tầng HTTP cho notifications.
 * Chỉ nhận request, gọi Service, trả response — không chứa SQL hay business logic.
 */
export class NotificationController {
  /**
   * PATCH /api/notifications/read-all
   * Đánh dấu tất cả notification chưa đọc của user hiện tại là đã đọc.
   *
   * Response 200: { success, updatedCount }
   */
  static async markAllRead(req, res) {
    try {
      const username = req.user?.username;
      const role     = req.user?.role;
      const count    = await NotificationService.markAllRead(username, role);
      return res.json({ success: true, updatedCount: count });
    } catch (err) {
      console.error('[NotificationController] markAllRead error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/notifications/broadcast — chỉ BGH.
   * Body: { title, content, targetGrade?, targetRole?, specificClass?, relatedSemester? }
   * Response 201: { success, data: notification }
   * Response 400: title rỗng hoặc không chọn nhóm nhận
   */
  static async broadcast(req, res) {
    try {
      const { title, content, targetGrade, targetRole, specificClass, relatedSemester } = req.body ?? {};
      const notification = await NotificationService.broadcast({
        title, content,
        senderId:    req.user?.id,
        senderRole:  req.user?.role ?? 'BGH',
        targetGrade, targetRole, specificClass, relatedSemester,
      });
      return res.status(201).json({ success: true, data: notification });
    } catch (err) {
      if (err.code === 'INVALID_INPUT') {
        return res.status(400).json({ success: false, message: err.message, code: err.code });
      }
      console.error('[NotificationController] broadcast error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/notifications
   * Lấy danh sách notifications của user đang đăng nhập.
   * Tìm theo username VÀ role (vì ClosureService gửi tới recipients=['BGH'] thay vì username cụ thể).
   */
  static async getNotifications(req, res) {
    try {
      const username = req.user?.username;
      const role     = req.user?.role;
      const data = await NotificationService.getForUser(username, role);
      return res.json({ success: true, data });
    } catch (err) {
      console.error('[NotificationController] getNotifications error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Đánh dấu notification đã đọc.
   */
  static async markRead(req, res) {
    try {
      const { id } = req.params;
      await NotificationService.markRead(id);
      return res.json({ success: true });
    } catch (err) {
      console.error('[NotificationController] markRead error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Lấy số notifications chưa đọc của user đang đăng nhập.
   * Tìm theo username VÀ role (vì ClosureService gửi tới recipients=['BGH'] thay vì username cụ thể).
   */
  static async getUnreadCount(req, res) {
    try {
      const username = req.user?.username;
      const role     = req.user?.role;
      const count = await NotificationService.getUnreadCount(username, role);
      return res.json({ success: true, count });
    } catch (err) {
      console.error('[NotificationController] getUnreadCount error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
