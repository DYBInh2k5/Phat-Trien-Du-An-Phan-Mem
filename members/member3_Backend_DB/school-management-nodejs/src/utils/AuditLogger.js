/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/utils/AuditLogger.js
 * Vai trò: Dịch Vụ Ghi Vết Kiểm Toán Học Vụ Tập Trung (Centralized Audit Logger)
 * Tiêu chuẩn bảo mật: Tính toàn vẹn và trách nhiệm giải trình (Accountability & Non-repudiation)
 * Nghiệp vụ quan trọng:
 *   - Ghi lại lịch sử mỗi khi có hành vi chỉnh sửa điểm số học sinh (ai sửa, lúc mấy giờ, từ điểm nào sang điểm nào).
 *   - Ghi lại các sự kiện phê duyệt đơn xin phép của Giáo viên Chủ nhiệm hoặc Ban Giám Hiệu.
 *   - Lưu trữ địa chỉ IP máy trạm thực hiện thao tác để phục vụ đối soát, thanh tra học vụ.
 * ==============================================================================
 */

// Bộ nhớ nhật ký kiểm toán trong phiên làm việc
const auditLogs = [];

/**
 * Lớp AuditLogger - Ghi nhận và truy vấn nhật ký kiểm toán hệ thống
 */
export class AuditLogger {
  /**
   * Ghi nhận một sự kiện kiểm toán mới
   * @param {Object} entry - Dữ liệu sự kiện
   * @param {string} entry.action - Hành động thực hiện (ví dụ: 'UPDATE_GRADE', 'LOCK_GRADEBOOK', 'APPROVE_LEAVE')
   * @param {string} entry.user - Tên tài khoản người thực hiện
   * @param {string} entry.role - Vai trò của người thực hiện (BGH, GVCN, GV)
   * @param {string} entry.entity - Tên thực thể bị tác động (ví dụ: 'grade_books', 'leave_requests')
   * @param {number|string} entry.entityId - ID của bản ghi bị tác động
   * @param {any} [entry.previousValue] - Giá trị cũ trước khi sửa (ví dụ: điểm cũ là 7.0)
   * @param {any} [entry.newValue] - Giá trị mới sau khi sửa (ví dụ: điểm mới là 8.5)
   * @param {string} [entry.ipAddress='127.0.0.1'] - Địa chỉ IP máy trạm yêu cầu
   * @returns {Object} Bản ghi kiểm toán vừa tạo
   */
  static log({ action, user, role, entity, entityId, previousValue, newValue, ipAddress }) {
    const logEntry = {
      id: auditLogs.length + 1,
      timestamp: new Date().toISOString(), // Dấu thời gian ISO 8601 chuẩn quốc tế
      action,
      user,
      role,
      entity,
      entityId,
      previousValue: previousValue || null,
      newValue: newValue || null,
      ipAddress: ipAddress || '127.0.0.1'
    };

    auditLogs.push(logEntry);
    console.log(`[AUDIT LOG] [${logEntry.timestamp}] Người dùng "${user}" (${role}) thực hiện "${action}" trên ${entity} #${entityId}`);
    return logEntry;
  }

  /**
   * Truy vấn danh sách lịch sử kiểm toán có lọc theo thực thể hoặc người thực hiện
   * @param {Object} [filter={}] - Bộ lọc
   * @param {string} [filter.entity] - Lọc theo tên bảng thực thể
   * @param {string} [filter.user] - Lọc theo tài khoản người dùng
   * @returns {Array<Object>}
   */
  static getAuditLogs(filter = {}) {
    let result = [...auditLogs];
    if (filter.entity) result = result.filter(l => l.entity === filter.entity);
    if (filter.user) result = result.filter(l => l.user === filter.user);
    return result;
  }
}
