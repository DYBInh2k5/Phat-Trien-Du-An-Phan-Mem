import { NotificationRepository } from '../repositories/NotificationRepository.js';

/**
 * NotificationService — Business logic cho notifications.
 * Không chứa SQL.
 */
export class NotificationService {
  /**
   * Tạo và gửi notification.
   */
  static async notify({ title, content, type, senderId, senderRole, recipients, relatedClass, relatedSemester }) {
    return NotificationRepository.insert({
      title,
      content,
      type,
      senderId,
      senderRole,
      recipients,
      relatedClass,
      relatedSemester,
    });
  }

  /**
   * Lấy danh sách notifications của một user.
   * Khớp theo username HOẶC role (để BGH nhận thông báo gửi tới recipients=['BGH']).
   * Trả về mảng DTO với camelCase keys.
   */
  static async getForUser(username, role) {
    const rows = await NotificationRepository.findByRecipient(username, role);
    return rows.map(row => ({
      id:              row.id,
      title:           row.title,
      content:         row.content,
      type:            row.type,
      senderId:        row.sender_id,
      senderRole:      row.sender_role,
      relatedClass:    row.related_class,
      relatedSemester: row.related_semester,
      sentAt:          row.sent_at,
      readAt:          row.read_at,
    }));
  }

  /**
   * Đánh dấu notification đã đọc.
   */
  static async markRead(id) {
    return NotificationRepository.markRead(id);
  }

  /**
   * Lấy số notifications chưa đọc.
   * Khớp theo username HOẶC role.
   */
  static async getUnreadCount(username, role) {
    const raw = await NotificationRepository.findUnreadCount(username, role);
    return parseInt(raw, 10) || 0;
  }
}
