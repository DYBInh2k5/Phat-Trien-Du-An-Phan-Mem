import { ROLES } from './permissions.js';
import { normalizeName, parentUsername, studentUsername } from './account-links.js';

const sameName = (a, b) =>
  typeof a === 'string' && typeof b === 'string' && normalizeName(a) === normalizeName(b);

/**
 * Tầng 2 của RBAC (ownership): user có được đụng tới HỌC SINH này không?
 * @param {{ role: string, username: string, fullName: string }} user
 * @param {{ studentCode: string, gvcnName: string | null }} student
 */
export function canAccessStudent(user, student) {
  switch (user.role) {
    case ROLES.ADMIN:
      return true;
    case ROLES.TEACHER:
      return sameName(user.fullName, student.gvcnName);
    case ROLES.STUDENT:
      return user.username.toUpperCase() === studentUsername(student.studentCode);
    case ROLES.PARENT:
      return user.username.toUpperCase() === parentUsername(student.studentCode);
    default:
      return false;
  }
}

/** Được QUẢN LÝ (ghi điểm, chốt sổ) lớp này không? Admin hoặc GVCN của lớp. */
export function canManageClass(user, klass) {
  if (user.role === ROLES.ADMIN) {
    return true;
  }
  return user.role === ROLES.TEACHER && sameName(user.fullName, klass.gvcnName);
}
