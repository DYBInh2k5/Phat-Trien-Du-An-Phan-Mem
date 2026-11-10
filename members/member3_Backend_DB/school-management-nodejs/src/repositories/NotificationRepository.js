import { querySafe as query, query as queryStrict } from '../config/db.js';

/**
 * NotificationRepository — Tầng SQL cho bảng notifications.
 * Chỉ chứa SQL, không có business logic.
 */
export class NotificationRepository {
  /**
   * Tạo một notification mới.
   */
  static async insert({ title, content, type, senderId, senderRole, recipients, relatedClass, relatedSemester }) {
    const res = await queryStrict(
      `INSERT INTO notifications
         (title, content, type, sender_id, sender_role, recipients, related_class, related_semester, sent_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), 'sent')
       RETURNING *`,
      [title, content ?? null, type, senderId ?? null, senderRole ?? null,
       recipients ?? [], relatedClass ?? null, relatedSemester ?? null]
    );
    return res.rows[0];
  }

  /**
   * Lấy danh sách notifications của một user, sắp xếp mới nhất trước.
   * Khớp username HOẶC role (để BGH nhận thông báo gửi tới recipients=['BGH']).
   */
  static async findByRecipient(username, role) {
    const params = role ? [username, role] : [username, username];
    const res = await query(
      `SELECT * FROM notifications
       WHERE $1 = ANY(recipients) OR $2 = ANY(recipients)
       ORDER BY sent_at DESC
       LIMIT 50`,
      params
    );
    if (res && res.rows) return res.rows;
    return [];
  }

  /**
   * Đánh dấu notification đã đọc.
   */
  static async markRead(id) {
    const res = await queryStrict(
      `UPDATE notifications SET read_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return res.rows[0] ?? null;
  }

  /**
   * Đếm số notifications chưa đọc của một user.
   * Khớp username HOẶC role (để BGH nhận thông báo gửi tới recipients=['BGH']).
   */
  static async findUnreadCount(username, role) {
    const params = role ? [username, role] : [username, username];
    const res = await query(
      `SELECT COUNT(*) FROM notifications
       WHERE ($1 = ANY(recipients) OR $2 = ANY(recipients)) AND read_at IS NULL`,
      params
    );
    if (res && res.rows) return res.rows[0].count;
    return '0';
  }
}
