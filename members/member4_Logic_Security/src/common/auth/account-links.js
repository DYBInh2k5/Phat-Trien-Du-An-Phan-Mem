/**
 * Schema giữ nguyên nên KHÔNG có cột nối users <-> students. Quy ước liên kết (thuần, test được):
 *   - STUDENT : username = student_code           (vd "HS001")
 *   - PARENT  : username = student_code + "-PH"   (vd "HS001-PH")
 *   - TEACHER : users.full_name khớp school_classes.gvcn_name (GVCN của lớp)
 */
const PARENT_SUFFIX = '-PH';

export const normalizeCode = (value) => String(value).trim().toUpperCase();

export const studentUsername = (studentCode) => normalizeCode(studentCode);

export const parentUsername = (studentCode) => `${normalizeCode(studentCode)}${PARENT_SUFFIX}`;

/** So tên người: bỏ dấu cách thừa, không phân biệt hoa thường, chuẩn hóa Unicode (NFC). */
export function normalizeName(value) {
  return String(value ?? '')
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function normalizePhone(value) {
  return String(value ?? '').replace(/\D/g, '');
}

/** Suy ra mã học sinh mà tài khoản STUDENT/PARENT được liên kết (null nếu không áp dụng). */
export function linkedStudentCode(user) {
  const username = user.username.toUpperCase();
  if (user.role === 'STUDENT') {
    return username;
  }
  if (user.role === 'PARENT' && username.endsWith(PARENT_SUFFIX)) {
    return username.slice(0, -PARENT_SUFFIX.length);
  }
  return null;
}
