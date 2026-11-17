/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member4_Logic_Security/rbacMiddleware.js
 * Vai trò: Middleware Phân Quyền Theo Vai Trò (Role-Based Access Control - RBAC 5 Roles)
 * Kiến trúc: Clean Architecture - Authorization Middleware
 * Tác giả: Trần Quang Vinh (Logic & Security Lead)
 * Ngày cập nhật: 17/11/2026
 * Mô tả:
 *   - Kiểm soát đặc quyền truy cập trên từng điểm cuối REST API.
 *   - Hỗ trợ 5 nhóm vai trò người dùng: BGH, GVCN, GV, HS, PH.
 * ==============================================================================
 */

export const ROLES = Object.freeze({
  ADMIN: 'ROLE_ADMIN',
  HOMEROOM_TEACHER: 'ROLE_HOMEROOM_TEACHER',
  SUBJECT_TEACHER: 'ROLE_SUBJECT_TEACHER',
  STUDENT: 'ROLE_STUDENT',
  PARENT: 'ROLE_PARENT',
  BGH: 'BGH',
  GVCN: 'GVCN',
  GV: 'GV',
  HS: 'HS',
  PH: 'PH'
});

/**
 * Middleware kiểm tra danh sách vai trò được phép truy cập
 * @param  {...string} allowedRoles - Danh sách các vai trò hợp lệ
 * @returns {Function} Express Middleware
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Lỗi truy cập: Chưa đăng nhập hệ thống.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Lỗi phân quyền: Vai trò ${req.user.role} không có quyền truy cập chức năng này (403 Forbidden).`
      });
    }

    next();
  };
}
