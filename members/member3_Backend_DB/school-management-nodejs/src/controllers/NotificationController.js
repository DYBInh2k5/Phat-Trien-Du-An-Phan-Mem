import { NotificationService } from '../services/NotificationService.js';

/**
 * NotificationController — Tầng HTTP cho notifications.
 * Chỉ nhận request, gọi Service, trả response — không chứa SQL hay business logic.
 */
export class NotificationController {
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
