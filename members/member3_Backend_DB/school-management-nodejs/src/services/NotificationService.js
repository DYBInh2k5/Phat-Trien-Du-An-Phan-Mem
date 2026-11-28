import { NotificationRepository } from '../repositories/NotificationRepository.js';

/**
 * NotificationService — Business logic cho notifications.
 * Không chứa SQL.
 */
export class NotificationService {
  /**
   * Đánh dấu TẤT CẢ notification chưa đọc của user đã đọc.
   * @param {string} username
   * @param {string} role
   * @returns {Promise<number>} số bản ghi được cập nhật
   */
  static async markAllRead(username, role) {
    return NotificationRepository.markAllRead(username, role);
  }

  /**
   * BGH gửi broadcast thông báo theo nhóm đối tượng.
   * recipients được giải quyết từ targetGrade / targetRole / specificClass:
   *   - targetGrade '10'/'11'/'12' → thêm grade vào recipients (backend/frontend resolve sau)
   *   - targetRole 'GV'/'GVCN'/'HS'/'PH'/'ALL' → thêm role vào recipients
   *   - specificClass '10A1' → thêm tên lớp vào recipients
   * Luôn thêm 'BGH' để BGH cũng nhận bản sao.
   *
   * @param {{ title, content, senderId, senderRole, targetGrade, targetRole, specificClass, relatedSemester }} opts
   * @returns {Promise<Object>} notification vừa tạo
   * @throws {Error} khi title rỗng hoặc không có nhóm nhận nào
   */
  static async broadcast({ title, content, senderId, senderRole, targetGrade, targetRole, specificClass, relatedSemester }) {
    if (!title?.trim()) {
      const err = new Error('Tiêu đề thông báo không được để trống.');
      err.code = 'INVALID_INPUT';
      throw err;
    }

    // Xây dựng mảng recipients từ các lựa chọn của BGH
    const recipients = new Set(['BGH']); // BGH luôn nhận bản sao

    if (targetRole && targetRole !== 'ALL') {
      recipients.add(targetRole);                 // VD: 'GV', 'GVCN', 'HS', 'PH'
    } else if (targetRole === 'ALL') {
      ['GV', 'GVCN', 'HS', 'PH', 'BGH'].forEach(r => recipients.add(r));
    }

    if (targetGrade) {
      recipients.add(`grade_${targetGrade}`);     // VD: 'grade_10', 'grade_11', 'grade_12'
    }

    if (specificClass && specificClass.trim()) {
      recipients.add(specificClass.trim());       // VD: '10A1', '11B2'
    }

    if (recipients.size === 1 && recipients.has('BGH') && !targetRole && !targetGrade && !specificClass) {
      const err = new Error('Vui lòng chọn ít nhất một nhóm nhận thông báo (Khối/Lớp/Vai trò).');
      err.code = 'INVALID_INPUT';
      throw err;
    }

    return NotificationRepository.insertBroadcast({
      title:           title.trim(),
      content:         content?.trim() ?? null,
      type:            'broadcast',
      senderId,
      senderRole,
      recipients:      [...recipients],
      relatedClass:    specificClass?.trim() ?? null,
      relatedSemester: relatedSemester ?? null,
      targetGrade:     targetGrade ?? null,
      targetRole:      targetRole  ?? null,
    });
  }

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
