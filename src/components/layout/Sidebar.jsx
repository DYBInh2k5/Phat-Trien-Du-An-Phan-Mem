import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { ROUTES } from '../../constants/routes.js';

const NAV_ITEMS = [
  { label: 'Tổng quan',           icon: 'dashboard',            path: ROUTES.GV_DASHBOARD,         roles: [ROLES.GV, ROLES.GVCN] },
  { label: 'Tổng quan',           icon: 'admin_panel_settings', path: ROUTES.BGH_DASHBOARD,        roles: [ROLES.BGH] },
  { label: 'Học sinh',            icon: 'groups',               path: ROUTES.STUDENTS,             roles: [ROLES.GV, ROLES.GVCN, ROLES.BGH] },
  { label: 'Sổ điểm',            icon: 'grade',                path: ROUTES.GRADEBOOK,            roles: [ROLES.GV, ROLES.GVCN, ROLES.BGH] },
  { label: 'Điểm danh',          icon: 'how_to_reg',           path: ROUTES.ATTENDANCE,           roles: [ROLES.GV, ROLES.GVCN] },
  { label: 'Giám sát chuyên cần', icon: 'monitoring',           path: ROUTES.BGH_ATTENDANCE,       roles: [ROLES.BGH] },
  { label: 'Thời khóa biểu',     icon: 'calendar_month',       path: ROUTES.SCHEDULE,             roles: [ROLES.GV, ROLES.GVCN] },
  { label: 'Xếp thời khóa biểu', icon: 'edit_calendar',        path: ROUTES.BGH_SCHEDULE_ADMIN,   roles: [ROLES.BGH] },
  { label: 'Sổ liên lạc',        icon: 'chat',                 path: ROUTES.PARENT_COMMUNICATION, roles: [ROLES.GVCN, ROLES.BGH] },
  { label: 'Báo cáo',            icon: 'assessment',           path: ROUTES.BGH_REPORTS,          roles: [ROLES.BGH] },
  { label: 'Cài đặt hệ thống',   icon: 'settings',             path: ROUTES.BGH_SETTINGS,         roles: [ROLES.BGH] },
  { label: 'Bảng điểm & GPA',       icon: 'grade',        path: ROUTES.STUDENT_GRADEBOOK,  roles: [ROLES.HS, ROLES.PH] },
  { label: 'Thời khóa biểu',         icon: 'calendar_today', path: ROUTES.STUDENT_SCHEDULE,  roles: [ROLES.HS, ROLES.PH] },
  { label: 'Lịch kiểm tra & Thi',   icon: 'assignment',   path: ROUTES.STUDENT_EXAMS,     roles: [ROLES.HS, ROLES.PH] },
  { label: 'Chuyên cần & Nề nếp',   icon: 'check_circle', path: ROUTES.STUDENT_ATTENDANCE, roles: [ROLES.HS, ROLES.PH] },
];

export default function Sidebar({ isCollapsed, onToggle }) {
  const { role } = useAuth();
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role));

  return (
    <aside
      className="h-full bg-white border-r border-[#e2e8f0] flex flex-col transition-all duration-200 shrink-0"
      style={{ width: isCollapsed ? '68px' : '260px' }}
    >
      {/* Brand header */}
      <div className="h-16 flex items-center border-b border-[#e2e8f0] px-4 gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shrink-0">
          <span className="material-symbols-outlined text-xl">school</span>
        </div>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-base text-[#0f172a] truncate">EDUMANAGE</span>
            <span className="text-[11px] text-[#64748b]">Cổng Học Vụ GD&amp;ĐT</span>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {visibleItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-label-md font-medium ${
                isActive
                  ? 'bg-[#2563eb] text-white'
                  : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
              }`
            }
            title={isCollapsed ? item.label : undefined}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
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
