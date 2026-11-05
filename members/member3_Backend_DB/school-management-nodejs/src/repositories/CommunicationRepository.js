import { querySafe as query } from '../config/db.js';

/**
 * CommunicationRepository — Tầng truy cập dữ liệu cho Sổ liên lạc.
 * Chỉ chứa SQL thuần, không có business logic.
 */
export class CommunicationRepository {

  // ── Notifications ────────────────────────────────────────────────────────

  /**
   * Lấy toàn bộ thông báo, lọc theo lớp nếu cần.
   * @param {string|null} className - lọc theo lớp nhận (optional)
   */
  static async findAllNotifications(className = null) {
    let res;
    if (className) {
      res = await query(
        `SELECT * FROM notifications
         WHERE $1 = ANY(recipients)
         ORDER BY sent_at DESC`,
        [className]
      );
    } else {
      res = await query(
        `SELECT * FROM notifications ORDER BY sent_at DESC`
      );
    }
    if (!res) return [];
    return res.rows;
  }

  /**
   * Tạo thông báo mới.
   * @param {{ title, content, type, senderId, recipients, status }} notif
   */
  static async createNotification(notif) {
    const res = await query(
      `INSERT INTO notifications (title, content, type, sender_id, recipients, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        notif.title,
        notif.content,
        notif.type    || 'general',
        notif.senderId || null,
        notif.recipients || [],
        notif.status  || 'sent',
      ]
    );
    if (!res) return null;
    return res.rows[0];
  }

  // ── Parent messages (chat threads) ───────────────────────────────────────

  /**
   * Lấy toàn bộ tin nhắn của một học sinh theo kênh trao đổi (GVCN hoặc BGH).
   * @param {string} studentId - student_code
   * @param {string} [conversationType='GVCN'] - 'GVCN' | 'BGH'
   */
  static async findMessagesByStudent(studentId, conversationType = 'GVCN') {
    const res = await query(
      `SELECT * FROM parent_messages
       WHERE student_id = $1 
         AND (conversation_type = $2 OR (conversation_type IS NULL AND $2 = 'GVCN'))
       ORDER BY sent_at ASC`,
      [studentId, conversationType || 'GVCN']
    );
    if (!res) return [];
    return res.rows;
  }

  /**
   * Lưu một tin nhắn mới vào thread.
   * @param {{ studentId, className, fromRole, message, conversationType, senderId }} msg
   */
  static async createMessage(msg) {
    const res = await query(
      `INSERT INTO parent_messages (student_id, class_name, from_role, message, conversation_type, sender_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        msg.studentId,
        msg.className || null,
        msg.fromRole || 'gv',
        msg.message,
        msg.conversationType || 'GVCN',
        msg.senderId || null,
      ]
    );
    if (!res) return null;
    return res.rows[0];
  }

  /**
   * Đánh dấu đã đọc các tin nhắn từ đối phương gửi tới.
   */
  static async markAsRead(studentId, conversationType = 'GVCN', readerRole = 'gv') {
    const fromRoleExclude = readerRole === 'PH' ? 'ph' : (readerRole === 'BGH' ? 'bgh' : 'gv');
    const res = await query(
      `UPDATE parent_messages
       SET read_at = NOW()
       WHERE student_id = $1
         AND (conversation_type = $2 OR (conversation_type IS NULL AND $2 = 'GVCN'))
         AND from_role != $3
         AND read_at IS NULL
       RETURNING id`,
      [studentId, conversationType || 'GVCN', fromRoleExclude]
    );
    return res?.rowCount ?? 0;
  }

  /**
   * Đếm số tin nhắn chưa đọc của từng học sinh trong lớp (dành cho GVCN / BGH).
   */
  static async getUnreadCountsByClass(className, conversationType = 'GVCN') {
    const res = await query(
      `SELECT student_id, COUNT(*)::int AS unread_count
       FROM parent_messages
       WHERE (class_name = $1 OR class_name IS NULL)
         AND from_role = 'ph'
         AND (conversation_type = $2 OR (conversation_type IS NULL AND $2 = 'GVCN'))
         AND read_at IS NULL
       GROUP BY student_id`,
      [className, conversationType || 'GVCN']
    );
    if (!res || !res.rows) return {};
    const map = {};
    for (const r of res.rows) {
      map[r.student_id] = r.unread_count;
    }
    return map;
  }

  /**
   * Đếm số tin nhắn chưa đọc gửi đến cho Phụ huynh (từ BGH hoặc GVCN).
   */
  static async getUnreadCountsForParent(studentCodes) {
    if (!studentCodes || studentCodes.length === 0) return { bgh: 0, gvcn: {} };
    const res = await query(
      `SELECT student_id, conversation_type, COUNT(*)::int AS unread_count
       FROM parent_messages
       WHERE student_id = ANY($1)
         AND from_role != 'ph'
         AND read_at IS NULL
       GROUP BY student_id, conversation_type`,
      [studentCodes]
    );
    const result = { bgh: 0, gvcn: {} };
    if (!res || !res.rows) return result;
    for (const r of res.rows) {
      if (r.conversation_type === 'BGH') {
        result.bgh += r.unread_count;
      } else {
        result.gvcn[r.student_id] = (result.gvcn[r.student_id] || 0) + r.unread_count;
      }
    }
    return result;
  }
}
