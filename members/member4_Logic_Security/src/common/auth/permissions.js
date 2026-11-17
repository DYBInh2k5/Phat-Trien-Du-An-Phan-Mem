export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
});

export const ALL_ROLES = Object.freeze(Object.values(ROLES));

/** Không role nào được tự đăng ký. */
export const SELF_REGISTER_ROLES = Object.freeze([]);

/** Mọi role đều do Admin cấp tài khoản (POST /users); người dùng chỉ tự đăng nhập. */
export const ADMIN_PROVISIONED_ROLES = ALL_ROLES;

/** Tầng 1 của RBAC: role nào được gọi chức năng nào. Tầng 2 (ownership) nằm ở access-policy.js. */
export const PERMISSIONS = Object.freeze({
  'user:manage': Object.freeze([ROLES.ADMIN]),
  'grade:read': ALL_ROLES,
  'grade:write': Object.freeze([ROLES.ADMIN, ROLES.TEACHER]),
  'grade:delete': Object.freeze([ROLES.ADMIN, ROLES.TEACHER]),
  'grade:restore': Object.freeze([ROLES.ADMIN]),
  'grade:lock': Object.freeze([ROLES.ADMIN, ROLES.TEACHER]),
  'grade:unlock': Object.freeze([ROLES.ADMIN]),
  'conduct:read': ALL_ROLES,
  'class:manage': Object.freeze([ROLES.ADMIN]),
});

export function hasPermission(role, permission) {
  const allowed = PERMISSIONS[permission];
  if (!allowed) {
    throw new Error(`Permission không tồn tại: ${permission}`);
  }
  return allowed.includes(role);
}
