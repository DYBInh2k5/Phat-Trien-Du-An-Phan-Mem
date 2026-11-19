import { Errors } from '../errors/app-error.js';
import { hasPermission } from '../auth/permissions.js';

/** Tầng 1 RBAC. Dùng SAU authenticate: router.put('/x', authenticate, can('grade:write'), ...) */
export function can(permission) {
  hasPermission('ADMIN', permission); // ném lỗi ngay lúc khởi động nếu gõ sai tên permission
  return (req, _res, next) => {
    if (!req.user || !hasPermission(req.user.role, permission)) {
      return next(Errors.forbidden());
    }
    return next();
  };
}
