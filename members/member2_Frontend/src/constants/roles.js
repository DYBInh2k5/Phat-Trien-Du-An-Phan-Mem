/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/constants/roles.js
 * Định nghĩa các vai trò (Roles) và nhãn hiển thị người dùng trong hệ thống RBAC.
 * ==============================================================================
 */

export const ROLES = {
  GV: 'GV',
  GVCN: 'GVCN',
  BGH: 'BGH',
  PH: 'PH',
  HS: 'HS',
};

export const ROLE_LABELS = {
  [ROLES.BGH]: 'Ban Giám Hiệu',
  [ROLES.GVCN]: 'GVCN',
  [ROLES.GV]: 'Giáo Viên',
  [ROLES.HS]: 'Học Sinh',
  [ROLES.PH]: 'Phụ Huynh',
};
