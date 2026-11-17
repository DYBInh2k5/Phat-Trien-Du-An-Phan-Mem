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
   * Ghi nhận một sự kiện kiểm toán mới (Hỗ trợ cả định dạng Object hoặc các tham số rời)
   * @param {Object|string} entryOrUser - Dữ liệu sự kiện dạng Object hoặc đối tượng người dùng
   * @param {string} [actionArg] - Hành động thực hiện (nếu truyền dạng tham số rời)
   * @param {string} [entityArg] - Tên thực thể bị tác động (nếu truyền dạng tham số rời)
   * @param {number|string} [entityIdArg] - ID thực thể bị tác động
   * @param {Object} [extraArg={}] - Thông tin bổ sung / giá trị mới
   * @returns {Object} Bản ghi kiểm toán vừa tạo
   */
  static log(entryOrUser, actionArg, entityArg, entityIdArg, extraArg = {}) {
    let action, user, role, entity, entityId, previousValue, newValue, ipAddress;

    if (entryOrUser && typeof entryOrUser === 'object' && entryOrUser.action) {
      // Kiểu 1: Truyền đối tượng cấu hình { action, user, role, entity, entityId, previousValue, newValue, ipAddress }
      ({ action, user, role, entity, entityId, previousValue, newValue, ipAddress } = entryOrUser);
    } else {
      // Kiểu 2: Truyền tham số rời (userObj, action, entity, entityId, extra)
      const userObj = entryOrUser || {};
      user = userObj.username || userObj.user || userObj.name || 'system';
      role = userObj.role || 'SYSTEM';
      action = actionArg || 'UNKNOWN_ACTION';
      entity = entityArg || 'general';
      entityId = entityIdArg ?? 'N/A';
      newValue = extraArg.newValue !== undefined ? extraArg.newValue : extraArg;
      previousValue = extraArg.previousValue || null;
      ipAddress = extraArg.ipAddress || userObj.ipAddress || '127.0.0.1';
    }

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
