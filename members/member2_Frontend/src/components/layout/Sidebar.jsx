/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/components/layout/Sidebar.jsx
 * Vai trò: Thanh Điều Hướng Bên Trái (Left Navigation Sidebar)
 * Phân quyền: Role-Based Access Control (RBAC) - Menu nhóm động theo 5 vai trò
 * Mô tả:
 *   - Hiển thị logo trường THPT HSU và huy hiệu vai trò người dùng đang đăng nhập.
 *   - Sắp xếp menu điều hướng theo từng nhóm nghiệp vụ rõ ràng, trực quan:
 *     + BGH: Tổng quan, Học vụ & Đào tạo, Tài chính & Kết nối, Hệ thống.
 *     + GVCN: Tổng quan, Công tác chủ nhiệm, Kết nối phụ huynh.
 *     + GVBM: Tổng quan, Học vụ & Lịch dạy, Thông báo.
 *     + HS: Kết quả học tập, Lịch trình & Thi, Tin tức.
 *     + PH: Tổng quan, Theo dõi con em, Tương tác & Học phí.
 *   - Lọc phân quyền động qua hasPermission theo ma trận quyền hạn (RBAC).
 *   - Tô sáng (Active Highlight) đường dẫn đang mở, hỗ trợ badge thông báo chưa đọc.
 *   - Ẩn khi in ấn thông qua lớp CSS 'print:hidden'.
 * ==============================================================================
 */

import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth, hasPermission } from '../../context/AuthContext.jsx';
import { ROLES, ROLE_LABELS } from '../../constants/roles.js';
import { ROUTES } from '../../constants/routes.js';
import { fetchUnreadCount } from '../../api/stubs.js';

/**
 * Định nghĩa cây danh mục điều hướng theo từng vai trò, phân nhóm chức năng trực quan.
 * Mỗi vai trò có các nhóm nghiệp vụ (groups) gồm tiêu đề và danh sách liên kết.
 */
const ROLE_NAV_GROUPS = {
  // ── 1. BAN GIÁM HIỆU (BGH) ──────────────────────────────────────────────────
  [ROLES.BGH]: [
    {
      title: 'TỔNG QUAN',
      items: [
        { label: 'Tổng quan Ban Giám Hiệu', icon: 'admin_panel_settings', path: ROUTES.BGH_DASHBOARD },
      ]
    },
    {
      title: 'HỌC VỤ & ĐÀO TẠO',
      items: [
        { label: 'Hồ sơ Học sinh & Lớp',    icon: 'groups',          path: ROUTES.STUDENTS },
        { label: 'Sổ điểm điện tử',         icon: 'grade',           path: ROUTES.GRADEBOOK,          moduleId: 'gradebook' },
        { label: 'Giám sát chuyên cần',      icon: 'monitoring',      path: ROUTES.BGH_ATTENDANCE,     moduleId: 'attendance' },
        { label: 'Xếp thời khóa biểu',      icon: 'edit_calendar',   path: ROUTES.BGH_SCHEDULE_ADMIN, moduleId: 'schedule' },
        { label: 'Trung tâm Báo cáo',        icon: 'assessment',      path: ROUTES.BGH_REPORTS,        moduleId: 'reports' },
      ]
    },
    {
      title: 'TÀI CHÍNH & KẾT NỐI',
      items: [
        { label: 'Quản lý Học phí',          icon: 'payments',        path: ROUTES.BGH_TUITION },
        { label: 'Sổ liên lạc & Phụ huynh',  icon: 'chat',            path: ROUTES.PARENT_COMMUNICATION },
        { label: 'Thông báo nhà trường',     icon: 'notifications',   path: ROUTES.NOTIFICATIONS },
      ]
    },
    {
      title: 'HỆ THỐNG',
      items: [
        { label: 'Cài đặt & Phân quyền',     icon: 'settings',        path: ROUTES.BGH_SETTINGS,       moduleId: 'settings' },
      ]
    }
  ],

  // ── 2. GIÁO VIÊN CHỦ NHIỆM (GVCN) ──────────────────────────────────────────
  [ROLES.GVCN]: [
    {
      title: 'TỔNG QUAN',
      items: [
        { label: 'Tổng quan Lớp Chủ Nhiệm', icon: 'dashboard',       path: ROUTES.GVCN_DASHBOARD },
      ]
    },
    {
      title: 'CÔNG TÁC CHỦ NHIỆM',
      items: [
        { label: 'Học sinh lớp chủ nhiệm',  icon: 'groups',          path: ROUTES.STUDENTS },
        { label: 'Sổ điểm điện tử',         icon: 'grade',           path: ROUTES.GRADEBOOK,          moduleId: 'gradebook' },
        { label: 'Điểm danh học sinh',      icon: 'how_to_reg',      path: ROUTES.ATTENDANCE,         moduleId: 'attendance' },
        { label: 'Thời khóa biểu lớp',      icon: 'calendar_month',  path: ROUTES.SCHEDULE,           moduleId: 'schedule' },
      ]
    },
    {
      title: 'KẾT NỐI PHỤ HUYNH',
      items: [
        { label: 'Sổ liên lạc & Duyệt phép', icon: 'chat',           path: ROUTES.PARENT_COMMUNICATION },
        { label: 'Thông báo',                icon: 'notifications',  path: ROUTES.NOTIFICATIONS },
      ]
    }
  ],

  // ── 3. GIÁO VIÊN BỘ MÔN (GV) ──────────────────────────────────────────────
  [ROLES.GV]: [
    {
      title: 'TỔNG QUAN',
      items: [
        { label: 'Tổng quan Giảng Dạy',      icon: 'dashboard',       path: ROUTES.GV_DASHBOARD },
      ]
    },
    {
      title: 'HỌC VỤ & LỊCH DẠY',
      items: [
        { label: 'Danh sách học sinh',       icon: 'groups',          path: ROUTES.STUDENTS },
        { label: 'Sổ điểm bộ môn',           icon: 'grade',           path: ROUTES.GRADEBOOK,          moduleId: 'gradebook' },
        { label: 'Điểm danh tiết học',       icon: 'how_to_reg',      path: ROUTES.ATTENDANCE,         moduleId: 'attendance' },
        { label: 'Thời khóa biểu giảng dạy', icon: 'calendar_month',  path: ROUTES.SCHEDULE,           moduleId: 'schedule' },
      ]
    },
    {
      title: 'TIN TỨC',
      items: [
        { label: 'Thông báo',                icon: 'notifications',  path: ROUTES.NOTIFICATIONS },
      ]
    }
  ],

  // ── 4. HỌC SINH (HS) ───────────────────────────────────────────────────────
  [ROLES.HS]: [
    {
      title: 'KẾT QUẢ HỌC TẬP',
      items: [
        { label: 'Bảng điểm & GPA cá nhân',  icon: 'grade',           path: ROUTES.STUDENT_GRADEBOOK,  moduleId: 'gradebook' },
        { label: 'Chuyên cần học tập',       icon: 'check_circle',    path: ROUTES.STUDENT_ATTENDANCE, moduleId: 'attendance' },
      ]
    },
    {
      title: 'LỊCH TRÌNH & THI',
      items: [
        { label: 'Thời khóa biểu học',       icon: 'calendar_today',  path: ROUTES.STUDENT_SCHEDULE,   moduleId: 'schedule' },
        { label: 'Lịch kiểm tra & Thi',      icon: 'assignment',      path: ROUTES.STUDENT_EXAMS },
      ]
    },
    {
      title: 'TIN TỨC',
      items: [
        { label: 'Thông báo nhà trường',     icon: 'notifications',   path: ROUTES.NOTIFICATIONS },
      ]
    }
  ],

  // ── 5. PHỤ HUYNH (PH) ──────────────────────────────────────────────────────
  [ROLES.PH]: [
    {
      title: 'TỔNG QUAN',
      items: [
        { label: 'Cổng Phụ Huynh',           icon: 'family_restroom', path: ROUTES.PARENT_DASHBOARD },
      ]
    },
    {
      title: 'THEO DÕI CON EM',
      items: [
        { label: 'Bảng điểm & GPA con em',   icon: 'grade',           path: ROUTES.STUDENT_GRADEBOOK,  moduleId: 'gradebook' },
        { label: 'Chuyên cần con em',        icon: 'check_circle',    path: ROUTES.STUDENT_ATTENDANCE, moduleId: 'attendance' },
        { label: 'Thời khóa biểu học',       icon: 'calendar_today',  path: ROUTES.STUDENT_SCHEDULE,   moduleId: 'schedule' },
        { label: 'Lịch kiểm tra & Thi',      icon: 'assignment',      path: ROUTES.STUDENT_EXAMS },
      ]
    },
    {
      title: 'TƯƠNG TÁC & HỌC PHÍ',
      items: [
        { label: 'Sổ liên lạc & Học phí',    icon: 'contact_mail',    path: ROUTES.PARENT_COMMUNICATION },
        { label: 'Thông báo nhà trường',     icon: 'notifications',   path: ROUTES.NOTIFICATIONS },
      ]
    }
  ]
};

/**
 * Component Sidebar - Thanh điều hướng danh mục hệ thống chuẩn UX/UI
 * @component
 * @param {Object} props - Các thuộc tính truyền vào
 * @param {boolean} props.isCollapsed - Trạng thái thu gọn menu (true: hẹp 68px, false: rộng 260px)
 * @param {Function} props.onToggle - Hàm kích hoạt đóng/mở thanh Sidebar
 * @returns {JSX.Element}
 */
export default function Sidebar({ isCollapsed, onToggle }) {
  const { role, user, permissions } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Lấy các nhóm menu dành riêng cho vai trò hiện tại
  const rawGroups = ROLE_NAV_GROUPS[role] || [];

  // Lọc các item theo phân quyền ma trận RBAC
  const visibleGroups = rawGroups.map((group) => {
    const visibleItems = group.items.filter((item) => {
      if (!item.moduleId) return true;
      return hasPermission(permissions, item.moduleId, role);
    });
    return { ...group, items: visibleItems };
  }).filter((group) => group.items.length > 0);

  // Polling số thông báo chưa đọc mỗi 30 giây
  useEffect(() => {
    let cancelled = false;

    async function updateCount() {
      try {
        const count = await fetchUnreadCount();
        if (!cancelled) setUnreadCount(count ?? 0);
      } catch {
        // Fallback im lặng nếu API thông báo lỗi
      }
    }

    updateCount();
    const timer = setInterval(updateCount, 30_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [role]);

  return (
    <aside
      className="print:hidden h-full bg-white border-r border-[#e2e8f0] flex flex-col transition-all duration-200 shrink-0 select-none shadow-sm"
      style={{ width: isCollapsed ? '68px' : '260px' }}
    >
      {/* Brand header */}
      <div className="h-16 flex items-center border-b border-[#e2e8f0] px-4 gap-3 shrink-0 bg-[#f8fafc]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#004ac6] to-[#1e40af] flex items-center justify-center text-white font-bold shrink-0 shadow-md">
          <span className="material-symbols-outlined text-2xl">school</span>
        </div>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-[#0f172a] truncate tracking-tight">THPT HSU</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e0e7ff] text-[#3730a3]">
                {ROLE_LABELS[role] || role || 'USER'}
              </span>
            </div>
            <span className="text-[11px] text-[#64748b] truncate font-medium">Hệ Thống Quản Lý Học Vụ</span>
          </div>
        )}
      </div>

      {/* Nav items container */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-3 custom-scrollbar">
        {visibleGroups.map((group, groupIdx) => (
          <div key={group.title + groupIdx} className="flex flex-col gap-0.5">
            {/* Tiêu đề nhóm chức năng */}
            {!isCollapsed ? (
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
                {group.title}
              </div>
            ) : (
              groupIdx > 0 && <div className="my-1.5 border-t border-[#f1f5f9]" />
            )}

            {/* Danh sách mục menu trong nhóm */}
            {group.items.map((item) => (
              <NavLink
                key={item.path + item.label}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-label-md font-medium ${
                    isActive
                      ? 'bg-[#004ac6] text-white shadow-sm font-semibold'
                      : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                  }`
                }
                title={isCollapsed ? item.label : undefined}
              >
                {/* Icon Material Symbol */}
                <span className="material-symbols-outlined text-[20px] shrink-0">
                  {item.icon}
                </span>

                {/* Nhãn chữ */}
                {!isCollapsed && (
                  <span className="truncate flex-1 text-[13.5px] leading-snug">
                    {item.label}
                  </span>
                )}

                {/* Badge số thông báo chưa đọc */}
                {!isCollapsed && item.path === ROUTES.NOTIFICATIONS && unreadCount > 0 && (
                  <span className="ml-auto shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-[#dc2626] text-white text-[11px] font-bold flex items-center justify-center leading-none shadow-sm animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                {isCollapsed && item.path === ROUTES.NOTIFICATIONS && unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#dc2626] border-2 border-white" />
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer / User short info & collapse button */}
      <div className="border-t border-[#e2e8f0] p-2 shrink-0 bg-[#fafafa]">
        {!isCollapsed && user && (
          <div className="px-3 py-1.5 mb-1 flex items-center gap-2 rounded-lg bg-[#f1f5f9] text-[#334155]">
            <span className="material-symbols-outlined text-[18px] text-[#64748b]">person</span>
            <span className="text-[12px] font-medium truncate flex-1">{user.fullName || user.name || user.username}</span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors"
          title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!isCollapsed && <span className="text-label-md font-medium text-[13px]">Thu gọn menu</span>}
        </button>
      </div>
    </aside>
  );
}
