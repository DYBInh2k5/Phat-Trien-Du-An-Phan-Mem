/**
 * Member 4: Logic & Security - Role-Based Access Control (RBAC 5 Roles)
 * Authorizes HTTP endpoints based on user roles
 */

export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  HOMEROOM_TEACHER: 'ROLE_HOMEROOM_TEACHER',
  SUBJECT_TEACHER: 'ROLE_SUBJECT_TEACHER',
  STUDENT: 'ROLE_STUDENT',
  PARENT: 'ROLE_PARENT'
};

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
