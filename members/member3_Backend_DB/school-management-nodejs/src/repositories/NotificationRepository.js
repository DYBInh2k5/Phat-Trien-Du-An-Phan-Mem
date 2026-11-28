/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: NotificationRepository.js
 * Vai trò: Kho Dữ Liệu Thông Báo (Notification Data Access Repository)
 * Kiến trúc: Clean Architecture - Data Access Layer
 * Mô tả:
 *   - SQL CRUD cho bảng notifications (PostgreSQL).
 *   - In-Memory Fallback hoàn chỉnh: memNotifications[] dùng chung cho
 *     insert, insertBroadcast, findByRecipient, markRead, markAllRead,
 *     findUnreadCount — đảm bảo thông báo gửi đi có thể đọc lại ngay
 *     trong cùng phiên server ngay cả khi DB chưa kết nối.
 * ==============================================================================
 */

import { querySafe as query, query as queryStrict } from '../config/db.js';

/**
 * Kho lưu trữ thông báo in-memory.
 * Được chia sẻ giữa tất cả các method fallback trong class này.
 * Reset mỗi khi server khởi động lại — chỉ dùng cho dev/demo.
 * @type {Array<Object>}
 */
const memNotifications = [];

/** Tạo ID tăng dần an toàn cho in-memory */
let _nextId = 1;
function nextMemId() { return _nextId++; }

/**
 * Kiểm tra xem một notification có khớp username HOẶC role của người nhận không.
 * recipients là mảng string chứa username, role, tên lớp, 'grade_10'...
 *
 * @param {Object} notif - Bản ghi notification
 * @param {string} username
 * @param {string} role
 * @returns {boolean}
 */
function matchesRecipient(notif, username, role) {
  const recs = notif.recipients ?? [];
  return recs.includes(username) || (role && recs.includes(role));
}

export class NotificationRepository {
  /**
   * Tạo một notification mới (gửi đơn lẻ).
   * Fallback lưu vào memNotifications khi DB offline.
   *
   * @param {{ title, content, type, senderId, senderRole, recipients, relatedClass, relatedSemester }} opts
   * @returns {Promise<Object>}
   */
  static async insert({ title, content, type, senderId, senderRole, recipients, relatedClass, relatedSemester }) {
    // Thử PostgreSQL
    try {
      const res = await queryStrict(
        `INSERT INTO notifications
           (title, content, type, sender_id, sender_role, recipients, related_class, related_semester, sent_at, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), 'sent')
         RETURNING *`,
        [title, content ?? null, type, senderId ?? null, senderRole ?? null,
         recipients ?? [], relatedClass ?? null, relatedSemester ?? null]
      );
      if (res && res.rows && res.rows.length > 0) return res.rows[0];
    } catch { /* DB offline */ }

    // Fallback in-memory
    const notif = {
      id:               nextMemId(),
      title,
      content:          content ?? null,
      type,
      sender_id:        senderId ?? null,
      sender_role:      senderRole ?? null,
      recipients:       recipients ?? [],
      related_class:    relatedClass ?? null,
      related_semester: relatedSemester ?? null,
      sent_at:          new Date().toISOString(),
      read_at:          null,
      status:           'sent',
    };
    memNotifications.unshift(notif); // thêm vào đầu (mới nhất trước)
    return notif;
  }

  /**
   * Tạo thông báo broadcast theo nhóm đối tượng (BGH → Khối/Lớp/Vai trò).
   * Fallback lưu vào memNotifications khi DB offline để có thể đọc lại ngay.
   *
   * @param {{ title, content, type, senderId, senderRole, recipients, relatedClass, relatedSemester }} opts
   * @returns {Promise<Object>}
   */
  static async insertBroadcast({ title, content, type, senderId, senderRole, recipients, relatedClass, relatedSemester }) {
    // Thử PostgreSQL
    try {
      const res = await queryStrict(
        `INSERT INTO notifications
           (title, content, type, sender_id, sender_role, recipients, related_class, related_semester, sent_at, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), 'sent')
         RETURNING *`,
        [title, content ?? null, type ?? 'broadcast', senderId ?? null, senderRole ?? null,
         recipients ?? [], relatedClass ?? null, relatedSemester ?? null]
      );
      if (res && res.rows && res.rows.length > 0) return res.rows[0];
    } catch { /* DB offline */ }

    // Fallback in-memory: LƯU vào memNotifications để findByRecipient tìm thấy
    const notif = {
      id:               nextMemId(),
      title,
      content:          content ?? null,
      type:             type ?? 'broadcast',
      sender_id:        senderId ?? null,
      sender_role:      senderRole ?? null,
      recipients:       recipients ?? [],
      related_class:    relatedClass ?? null,
      related_semester: relatedSemester ?? null,
      sent_at:          new Date().toISOString(),
      read_at:          null,
      status:           'sent',
    };
    memNotifications.unshift(notif);
    return notif;
  }

  /**
   * Lấy danh sách notifications của một user, sắp xếp mới nhất trước.
   * Khớp username HOẶC role.
   * Fallback memNotifications khi DB offline.
   *
   * @param {string} username
   * @param {string} role
   * @returns {Promise<Array>}
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

    // Fallback: lọc từ memNotifications
    return memNotifications
      .filter(n => matchesRecipient(n, username, role))
      .slice(0, 50);
  }

  /**
   * Đánh dấu một notification đã đọc theo ID.
   * Fallback memNotifications khi DB offline.
   *
   * @param {number|string} id
   * @returns {Promise<Object|null>}
   */
  static async markRead(id) {
    // Thử PostgreSQL
    try {
      const res = await queryStrict(
        `UPDATE notifications SET read_at = NOW() WHERE id = $1 RETURNING *`,
        [id]
      );
      if (res && res.rows && res.rows.length > 0) return res.rows[0];
    } catch { /* DB offline */ }

    // Fallback in-memory
    const idx = memNotifications.findIndex(n => String(n.id) === String(id));
    if (idx !== -1) {
      memNotifications[idx] = { ...memNotifications[idx], read_at: new Date().toISOString() };
      return memNotifications[idx];
    }
    return null;
  }

  /**
   * Đánh dấu TẤT CẢ notification chưa đọc của một user là đã đọc.
   * Fallback memNotifications khi DB offline.
   *
   * @param {string} username
   * @param {string} role
   * @returns {Promise<number>} số bản ghi được cập nhật
   */
  static async markAllRead(username, role) {
    // Thử PostgreSQL
    try {
      const params = role ? [username, role] : [username, username];
      const res = await queryStrict(
        `UPDATE notifications
         SET read_at = NOW()
         WHERE ($1 = ANY(recipients) OR $2 = ANY(recipients))
           AND read_at IS NULL`,
        params
      );
      if (res && res.rowCount !== undefined) return res.rowCount;
    } catch { /* DB offline */ }

    // Fallback in-memory
    const now = new Date().toISOString();
    let count = 0;
    memNotifications.forEach((n, i) => {
      if (!n.read_at && matchesRecipient(n, username, role)) {
        memNotifications[i] = { ...n, read_at: now };
        count++;
      }
    });
    return count;
  }

  /**
   * Đếm số notifications chưa đọc của một user.
   * Khớp username HOẶC role.
   * Fallback memNotifications khi DB offline.
   *
   * @param {string} username
   * @param {string} role
   * @returns {Promise<string|number>}
   */
  static async findUnreadCount(username, role) {
    const params = role ? [username, role] : [username, username];
    const res = await query(
      `SELECT COUNT(*) FROM notifications
       WHERE ($1 = ANY(recipients) OR $2 = ANY(recipients)) AND read_at IS NULL`,
      params
    );
    if (res && res.rows) return res.rows[0].count;

    // Fallback in-memory
    return memNotifications.filter(n => !n.read_at && matchesRecipient(n, username, role)).length;
  }
}
