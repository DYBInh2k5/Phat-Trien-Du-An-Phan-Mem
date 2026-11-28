/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/components/layout/Sidebar.jsx
 * Vai trò: Thanh Điều Hướng Trái Chuẩn Enterprise (HSU Digital Campus Navy Sidebar)
 * Phong cách: Navy đậm (#0a2d6e) — chuẩn thương hiệu Hoa Sen University
 * Tính năng:
 *   - Nền Navy HSU (#0a2d6e), logo trắng, nhóm menu collapse/expand mượt
 *   - Phân quyền RBAC động — mỗi vai trò thấy menu khác nhau
 *   - Hover glow xanh lam sáng, active item nền xanh lam nổi bật
 *   - Họa tiết sóng SVG trang trí ở chân sidebar (ẩn khi collapsed)
 *   - Card thông tin user + nút Đăng xuất ở cuối sidebar
 *   - Thu gọn mượt 68px ↔ 260px, tooltip khi collapsed
 * ==============================================================================
 */

import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, hasPermission } from '../../context/AuthContext.jsx';
import { ROLES, ROLE_LABELS } from '../../constants/roles.js';
import { ROUTES } from '../../constants/routes.js';
import { fetchUnreadCount, fetchNotifications } from '../../api/stubs.js';

// ─── Navigation tree ─────────────────────────────────────────────────────────

const ROLE_NAV_GROUPS = {
  [ROLES.BGH]: [
    {
      title: 'TỔNG QUAN',
      items: [
        { label: 'Tổng quan BGH',            icon: 'admin_panel_settings', path: ROUTES.BGH_DASHBOARD },
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
        { label: 'Nhật ký Kiểm toán',        icon: 'policy',          path: ROUTES.BGH_AUDIT_LOGS },
        { label: 'Cài đặt & Phân quyền',     icon: 'settings',        path: ROUTES.BGH_SETTINGS,       moduleId: 'settings' },
      ]
    }
  ],

  [ROLES.GVCN]: [
    {
      title: 'TỔNG QUAN',
      items: [
        { label: 'Tổng quan Chủ Nhiệm',      icon: 'dashboard',       path: ROUTES.GVCN_DASHBOARD },
      ]
    },
    {
      title: 'CÔNG TÁC CHỦ NHIỆM',
      items: [
        { label: 'Học sinh lớp chủ nhiệm',   icon: 'groups',          path: ROUTES.STUDENTS },
        { label: 'Sổ điểm điện tử',          icon: 'grade',           path: ROUTES.GRADEBOOK,          moduleId: 'gradebook' },
        { label: 'Điểm danh học sinh',       icon: 'how_to_reg',      path: ROUTES.ATTENDANCE,         moduleId: 'attendance' },
        { label: 'Thời khóa biểu lớp',       icon: 'calendar_month',  path: ROUTES.SCHEDULE,           moduleId: 'schedule' },
      ]
    },
    {
      title: 'KẾT NỐI PHỤ HUYNH',
      items: [
        { label: 'Sổ liên lạc & Duyệt phép', icon: 'chat',            path: ROUTES.PARENT_COMMUNICATION },
        { label: 'Thông báo',                icon: 'notifications',   path: ROUTES.NOTIFICATIONS },
      ]
    }
  ],

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
        { label: 'Danh sách học sinh',        icon: 'groups',          path: ROUTES.STUDENTS },
        { label: 'Sổ điểm bộ môn',            icon: 'grade',           path: ROUTES.GRADEBOOK,          moduleId: 'gradebook' },
        { label: 'Điểm danh tiết học',        icon: 'how_to_reg',      path: ROUTES.ATTENDANCE,         moduleId: 'attendance' },
        { label: 'Thời khóa biểu giảng dạy',  icon: 'calendar_month',  path: ROUTES.SCHEDULE,           moduleId: 'schedule' },
      ]
    },
    {
      title: 'TIN TỨC',
      items: [
        { label: 'Thông báo',                 icon: 'notifications',   path: ROUTES.NOTIFICATIONS },
      ]
    }
  ],

  [ROLES.HS]: [
    {
      title: 'KẾT QUẢ HỌC TẬP',
      items: [
        { label: 'Bảng điểm & GPA',           icon: 'grade',           path: ROUTES.STUDENT_GRADEBOOK,  moduleId: 'gradebook' },
        { label: 'Chuyên cần học tập',        icon: 'check_circle',    path: ROUTES.STUDENT_ATTENDANCE, moduleId: 'attendance' },
      ]
    },
    {
      title: 'LỊCH TRÌNH & THI',
      items: [
        { label: 'Thời khóa biểu',            icon: 'calendar_today',  path: ROUTES.STUDENT_SCHEDULE,   moduleId: 'schedule' },
        { label: 'Lịch kiểm tra & Thi',       icon: 'assignment',      path: ROUTES.STUDENT_EXAMS },
      ]
    },
    {
      title: 'TIN TỨC',
      items: [
        { label: 'Thông báo nhà trường',      icon: 'notifications',   path: ROUTES.NOTIFICATIONS },
      ]
    }
  ],

  [ROLES.PH]: [
    {
      title: 'TỔNG QUAN',
      items: [
        { label: 'Cổng Phụ Huynh',            icon: 'family_restroom', path: ROUTES.PARENT_DASHBOARD },
      ]
    },
    {
      title: 'THEO DÕI CON EM',
      items: [
        { label: 'Bảng điểm & GPA con em',    icon: 'grade',           path: ROUTES.STUDENT_GRADEBOOK,  moduleId: 'gradebook' },
        { label: 'Chuyên cần con em',         icon: 'check_circle',    path: ROUTES.STUDENT_ATTENDANCE, moduleId: 'attendance' },
        { label: 'Thời khóa biểu',            icon: 'calendar_today',  path: ROUTES.STUDENT_SCHEDULE,   moduleId: 'schedule' },
        { label: 'Lịch kiểm tra & Thi',       icon: 'assignment',      path: ROUTES.STUDENT_EXAMS },
      ]
    },
    {
      title: 'TƯƠNG TÁC & HỌC PHÍ',
      items: [
        { label: 'Sổ liên lạc & Học phí',    icon: 'contact_mail',    path: ROUTES.PARENT_COMMUNICATION },
        { label: 'Thông báo nhà trường',      icon: 'notifications',   path: ROUTES.NOTIFICATIONS },
      ]
    }
  ]
};

// ─── Màu badge role (trên nền Navy) ──────────────────────────────────────────
const ROLE_BADGE = {
  BGH:  'bg-[#f97316]/20 text-[#fed7aa] border-[#f97316]/30',
  GVCN: 'bg-[#a78bfa]/20 text-[#ddd6fe] border-[#a78bfa]/30',
  GV:   'bg-[#60a5fa]/20 text-[#bfdbfe] border-[#60a5fa]/30',
  HS:   'bg-white/10      text-white/80  border-white/20',
  PH:   'bg-[#34d399]/20 text-[#a7f3d0] border-[#34d399]/30',
};

// ─── Họa tiết sóng SVG cho chân sidebar ──────────────────────────────────────
function WaveDecor() {
  return (
    <svg viewBox="0 0 260 40" preserveAspectRatio="none"
      className="w-full h-10 absolute bottom-0 left-0 opacity-10 pointer-events-none"
      aria-hidden="true">
      <path d="M0 20 Q65 0 130 20 Q195 40 260 20 L260 40 L0 40 Z" fill="white" />
      <path d="M0 28 Q65 8 130 28 Q195 48 260 28 L260 40 L0 40 Z" fill="white" opacity="0.5" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Sidebar Enterprise — Navy HSU Digital Campus
 * @param {{ isCollapsed: boolean, onToggle: Function }} props
 */
export default function Sidebar({ isCollapsed, onToggle }) {
  const { role, user, permissions, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Map nhóm → trạng thái mở/đóng (collapse per group).
   * Khởi tạo tất cả mở.
   */
  const rawGroups = ROLE_NAV_GROUPS[role] || [];
  const visibleGroups = rawGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        !item.moduleId || hasPermission(permissions, item.moduleId, role)
      ),
    }))
    .filter((g) => g.items.length > 0);

  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(visibleGroups.map((g) => [g.title, true]))
  );

  /** Toggle đóng/mở một nhóm menu */
  function toggleGroup(title) {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  }

  // Polling số thông báo chưa đọc mỗi 30s — dùng fetchNotifications để đồng nhất nguồn
  useEffect(() => {
    let cancelled = false;
    async function update() {
      try {
        const data = await fetchNotifications();
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          setUnreadCount(list.filter(n => !n.readAt && !n.read_at).length);
        }
      } catch { /* silent */ }
    }
    update();
    const t = setInterval(update, 30_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [role]);

  function handleLogout() {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  // Lấy chữ cái đầu từ tên user để hiển thị avatar
  const avatarLetter = (user?.name || user?.fullName || user?.username || 'U')[0].toUpperCase();
  const displayName  = user?.name || user?.fullName || user?.username || 'Người dùng';
  const badgeCls     = ROLE_BADGE[role] || ROLE_BADGE.HS;

  return (
    <aside
      className="print:hidden h-full flex flex-col transition-all duration-300 shrink-0 select-none overflow-hidden relative"
      style={{
        width: isCollapsed ? '68px' : '260px',
        background: 'linear-gradient(180deg, #0a2d6e 0%, #0d3580 60%, #0a2d6e 100%)',
      }}
      aria-label="Thanh điều hướng"
    >
      {/* ── 1. BRAND HEADER ── */}
      <div
        className="shrink-0 flex items-center gap-3 px-3.5 border-b"
        style={{ height: '64px', borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {/* Logo tròn trắng */}
        <div className="flex-none w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
          <img src="/logo-hsu.svg" alt="HSU" className="w-8 h-8 object-contain" />
        </div>

        {/* Tên trường + hệ thống (ẩn khi collapsed) */}
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="text-white font-bold text-[14px] tracking-tight leading-tight truncate">
              HOA SEN UNIVERSITY
            </span>
            <span className="text-white/60 text-[10px] font-medium truncate">
              Digital Campus HTQLLH
            </span>
          </div>
        )}
      </div>

      {/* ── 2. NAV MENU (cuộn dọc) ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 flex flex-col gap-0.5"
        style={{ scrollbarWidth: 'none' }}>
        {visibleGroups.map((group, gIdx) => (
          <div key={group.title + gIdx}>
            {/* Tiêu đề nhóm + toggle collapse */}
            {!isCollapsed ? (
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between px-4 pt-3 pb-1 text-left group/grp"
                aria-expanded={openGroups[group.title]}
              >
                <span className="text-[9.5px] font-bold tracking-widest uppercase"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {group.title}
                </span>
                <span className="material-symbols-outlined text-[14px] transition-transform duration-200"
                  style={{
                    color: 'rgba(255,255,255,0.3)',
                    transform: openGroups[group.title] ? 'rotate(0deg)' : 'rotate(-90deg)',
                  }}>
                  expand_more
                </span>
              </button>
            ) : (
              gIdx > 0 && (
                <div className="mx-3 my-2 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              )
            )}

            {/* Menu items (ẩn nếu group bị collapse) */}
            {(isCollapsed || openGroups[group.title]) && (
              <div className="flex flex-col gap-0.5 px-2">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path + item.label}
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 rounded-lg transition-all duration-150 group/item ${
                        isCollapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-white/15 shadow-inner'
                          : 'hover:bg-white/8'
                      }`
                    }
                    style={({ isActive }) => ({
                      background: isActive ? 'rgba(255,255,255,0.15)' : undefined,
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        {/* Left accent bar khi active */}
                        {isActive && !isCollapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-[#60a5fa]" />
                        )}

                        {/* Icon */}
                        <span
                          className="material-symbols-outlined text-[20px] shrink-0 transition-colors"
                          style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)' }}
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>

                        {/* Label */}
                        {!isCollapsed && (
                          <span
                            className="truncate flex-1 text-[13px] leading-snug font-medium transition-colors"
                            style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.75)' }}
                          >
                            {item.label}
                          </span>
                        )}

                        {/* Badge thông báo chưa đọc */}
                        {item.path === ROUTES.NOTIFICATIONS && unreadCount > 0 && (
                          !isCollapsed ? (
                            <span className="ml-auto shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-[#ef4444] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          ) : (
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ef4444] border border-[#0a2d6e]" />
                          )
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* ── 3. HỌA TIẾT SÓNG (ẩn khi collapsed) ── */}
      {!isCollapsed && <WaveDecor />}

      {/* ── 4. FOOTER: USER CARD + ĐĂNG XUẤT ── */}
      <div
        className="shrink-0 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.1)', paddingBottom: isCollapsed ? '0' : '8px' }}
      >
        {/* User info card (ẩn khi collapsed) */}
        {!isCollapsed && (
          <div className="mx-3 mt-3 mb-2 rounded-xl p-3 flex items-center gap-2.5"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            {/* Avatar */}
            <div className="flex-none w-8 h-8 rounded-full bg-gradient-to-br from-[#60a5fa] to-[#2563eb] flex items-center justify-center text-white font-bold text-sm shadow">
              {avatarLetter}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[12px] font-semibold truncate leading-tight">{displayName}</p>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${badgeCls} mt-0.5`}>
                {ROLE_LABELS[role] || role}
              </span>
            </div>
          </div>
        )}

        {/* Avatar nhỏ khi collapsed */}
        {isCollapsed && (
          <div className="flex justify-center py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#60a5fa] to-[#2563eb] flex items-center justify-center text-white font-bold text-sm shadow"
              title={displayName}>
              {avatarLetter}
            </div>
          </div>
        )}

        {/* Nút Đăng xuất */}
        {!isCollapsed && (
          <button type="button" onClick={handleLogout}
            className="mx-3 mb-1 w-[calc(100%-24px)] flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-[12px] font-medium"
            style={{ color: 'rgba(255,255,255,0.6)', background: 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span className="material-symbols-outlined text-[17px]" aria-hidden="true">logout</span>
            Đăng xuất
          </button>
        )}

        {/* Nút collapse/expand */}
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 transition-colors text-[13px] font-medium"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!isCollapsed && <span className="text-[11px]">Thu gọn</span>}
        </button>
      </div>
    </aside>
  );
}
