/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/components/layout/Sidebar.jsx
 * Vai trò: Thanh Điều Hướng Bên Trái (Left Navigation Sidebar)
 * Phân quyền: Role-Based Access Control (RBAC) - Menu động theo 5 vai trò
 * Mô tả:
 *   - Hiển thị logo nhận diện thương hiệu trường THPT HSU.
 *   - Lọc các mục menu phù hợp với vai trò đăng nhập hiện tại (BGH, GVCN, GVBM, PH, HS).
 *   - Tô sáng (Active Highlight) đường dẫn đang được kích hoạt bằng NavLink.
 *   - Ẩn hoàn toàn khi người dùng in ấn báo cáo thông qua lớp CSS 'print:hidden'.
 * ==============================================================================
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { ROUTES } from '../../constants/routes.js';

/**
 * Danh sách định nghĩa toàn bộ các mục điều hướng trong hệ thống.
 * Mỗi mục chứa:
 * - `label`: Tên hiển thị tiếng Việt của chức năng.
 * - `icon`: Tên biểu tượng chuẩn Google Material Symbols.
 * - `path`: Đường dẫn tuyến đường trong AppRouter.
 * - `roles`: Mảng các vai trò được phép nhìn thấy và truy cập mục này.
 */
const NAV_ITEMS = [
  // Nhóm 1: Dành riêng cho Ban Giám Hiệu (BGH)
  { label: 'Tổng quan Ban Giám Hiệu', icon: 'admin_panel_settings', path: ROUTES.BGH_DASHBOARD,        roles: [ROLES.BGH] },
  { label: 'Giám sát chuyên cần',    icon: 'monitoring',           path: ROUTES.BGH_ATTENDANCE,       roles: [ROLES.BGH] },
  { label: 'Xếp thời khóa biểu',    icon: 'edit_calendar',        path: ROUTES.BGH_SCHEDULE_ADMIN,   roles: [ROLES.BGH] },
  { label: 'Trung tâm Báo cáo',      icon: 'assessment',           path: ROUTES.BGH_REPORTS,          roles: [ROLES.BGH] },
  { label: 'Cài đặt & Phân quyền',   icon: 'settings',             path: ROUTES.BGH_SETTINGS,         roles: [ROLES.BGH] },

  // Nhóm 2: Dành riêng cho Giáo viên Chủ nhiệm (GVCN)
  { label: 'Tổng quan Lớp Chủ Nhiệm', icon: 'dashboard',            path: ROUTES.GVCN_DASHBOARD,       roles: [ROLES.GVCN] },
  
  // Nhóm 3: Dành riêng cho Giáo viên Bộ môn (GV)
  { label: 'Tổng quan Giảng Dạy',    icon: 'dashboard',            path: ROUTES.GV_DASHBOARD,         roles: [ROLES.GV] },

  // Nhóm 4: Dùng chung giữa Giáo viên và Ban Giám Hiệu
  { label: 'Học sinh & Hồ sơ',       icon: 'groups',               path: ROUTES.STUDENTS,             roles: [ROLES.GV, ROLES.GVCN, ROLES.BGH] },
  { label: 'Sổ điểm điện tử',       icon: 'grade',                path: ROUTES.GRADEBOOK,            roles: [ROLES.GV, ROLES.GVCN, ROLES.BGH] },
  { label: 'Điểm danh học sinh',    icon: 'how_to_reg',           path: ROUTES.ATTENDANCE,           roles: [ROLES.GV, ROLES.GVCN] },
  { label: 'Thời khóa biểu',        icon: 'calendar_month',       path: ROUTES.SCHEDULE,             roles: [ROLES.GV, ROLES.GVCN] },
  { label: 'Sổ liên lạc & Duyệt phép', icon: 'chat',               path: ROUTES.PARENT_COMMUNICATION, roles: [ROLES.GVCN, ROLES.BGH] },

  // Nhóm 5: Dành riêng cho Phụ huynh (PH)
  { label: 'Cổng Phụ Huynh',         icon: 'family_restroom',      path: ROUTES.PARENT_DASHBOARD,     roles: [ROLES.PH] },
  { label: 'Sổ liên lạc & Học phí',  icon: 'contact_mail',         path: ROUTES.PARENT_COMMUNICATION, roles: [ROLES.PH] },

  // Nhóm 6: Dùng chung giữa Học sinh (HS) và Phụ huynh (PH)
  { label: 'Bảng điểm & GPA con em', icon: 'grade',                path: ROUTES.STUDENT_GRADEBOOK,    roles: [ROLES.HS, ROLES.PH] },
  { label: 'Thời khóa biểu học',     icon: 'calendar_today',       path: ROUTES.STUDENT_SCHEDULE,     roles: [ROLES.HS, ROLES.PH] },
  { label: 'Lịch kiểm tra & Thi',    icon: 'assignment',           path: ROUTES.STUDENT_EXAMS,        roles: [ROLES.HS, ROLES.PH] },
  { label: 'Chuyên cần học sinh',    icon: 'check_circle',         path: ROUTES.STUDENT_ATTENDANCE,   roles: [ROLES.HS, ROLES.PH] },
];

/**
 * Component Sidebar - Thanh điều hướng danh mục hệ thống
 * @component
 * @param {Object} props - Các thuộc tính truyền vào
 * @param {boolean} props.isCollapsed - Trạng thái thu gọn menu (true: hẹp 68px, false: rộng 260px)
 * @param {Function} props.onToggle - Hàm kích hoạt đóng/mở thanh Sidebar
 * @returns {JSX.Element}
 */
export default function Sidebar({ isCollapsed, onToggle }) {
  // Trích xuất vai trò hiện tại của người dùng từ AuthContext
  const { role } = useAuth();

  // Lọc chỉ các mục menu mà vai trò của người dùng có quyền nhìn thấy
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role));

  return (
    <aside
      className="print:hidden h-full bg-white border-r border-[#e2e8f0] flex flex-col transition-all duration-200 shrink-0"
      style={{ width: isCollapsed ? '68px' : '260px' }}
    >
      {/* 
        1. PHẦN ĐẦU BRANDING & LOGO:
        Hiển thị biểu tượng trường THPT HSU và tên hệ thống khi mở rộng.
      */}
      <div className="h-16 flex items-center border-b border-[#e2e8f0] px-4 gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-[#004ac6] flex items-center justify-center text-white font-bold shrink-0">
          <span className="material-symbols-outlined text-xl">school</span>
        </div>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-base text-[#0f172a] truncate">THPT HSU</span>
            <span className="text-[11px] text-[#64748b]">Hệ Thống Quản Lý Dạy Học</span>
          </div>
        )}
      </div>

      {/* 
        2. DANH SÁCH CÁC MỤC ĐIỀU HƯỚNG (NAV LINKS):
        Sử dụng NavLink của react-router-dom để tự động nhận biết tuyến đường isActive.
      */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {visibleItems.map(item => (
          <NavLink
            key={item.path + item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-label-md font-medium ${
                isActive
                  ? 'bg-[#004ac6] text-white'
                  : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
              }`
            }
            title={isCollapsed ? item.label : undefined}
          >
            {/* Biểu tượng Material Symbol */}
            <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
            {/* Nhãn chữ: Ẩn đi khi Sidebar ở trạng thái thu gọn */}
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* 
        3. NÚT ĐÓNG / MỞ RỘNG MENU Ở ĐÁY SIDEBAR:
        Cho phép người dùng chủ động tối ưu diện tích làm việc cho bảng điểm.
      */}
      <div className="border-t border-[#e2e8f0] p-2 shrink-0">
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors"
          title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!isCollapsed && <span className="text-label-md">Thu gọn</span>}
        </button>
      </div>
    </aside>
  );
}
