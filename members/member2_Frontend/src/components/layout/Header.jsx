/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/components/layout/Header.jsx
 * Vai trò: Thanh Tiêu Đề Đỉnh Trang Chuẩn Enterprise (HSU Digital Campus Header)
 * Tính năng:
 *   - Global Search: tìm nhanh học sinh / lớp / chức năng bằng từ khóa, kết quả dropdown
 *   - Bell Notifications: chuông có badge số chưa đọc, dropdown danh sách mới nhất,
 *     click từng mục → đánh dấu đã đọc, nút "Xem tất cả" → /notifications
 *   - Semester Selector: dropdown chọn Học kỳ / Năm học, đồng bộ SemesterContext
 *   - User card: avatar, tên, role badge + Đăng xuất nhanh
 * ==============================================================================
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSemester, SEMESTER_OPTIONS } from '../../context/SemesterContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import { fetchNotifications, markNotificationRead, fetchUnreadCount } from '../../api/stubs.js';
import { apiClient } from '../../api/client.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_LABELS = {
  GV:   'Giáo viên Bộ môn',
  GVCN: 'Giáo viên Chủ nhiệm',
  BGH:  'Ban Giám Hiệu',
  PH:   'Phụ huynh',
  HS:   'Học sinh',
};

const ROLE_BADGE_STYLES = {
  GV:   'bg-[#eff4ff] text-[#004ac6] border-[#bfdbfe]',
  GVCN: 'bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]',
  BGH:  'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]',
  PH:   'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]',
  HS:   'bg-[#f8fafc] text-[#334155] border-[#e2e8f0]',
};

/**
 * Danh sách gợi ý tìm kiếm nhanh theo chức năng (static shortcuts).
 * Tìm kiếm học sinh / lớp sẽ gọi API động.
 */
const SEARCH_SHORTCUTS = [
  { label: 'Danh sách học sinh',   icon: 'groups',        path: ROUTES.STUDENTS },
  { label: 'Sổ điểm điện tử',      icon: 'grade',         path: ROUTES.GRADEBOOK },
  { label: 'Điểm danh',            icon: 'how_to_reg',    path: ROUTES.ATTENDANCE },
  { label: 'Thời khóa biểu',       icon: 'calendar_month', path: ROUTES.SCHEDULE },
  { label: 'Thông báo',            icon: 'notifications', path: ROUTES.NOTIFICATIONS },
  { label: 'Báo cáo tổng hợp',     icon: 'assessment',    path: ROUTES.BGH_REPORTS },
  { label: 'Cài đặt hệ thống',     icon: 'settings',      path: ROUTES.BGH_SETTINGS },
  { label: 'Nhật ký Kiểm toán',    icon: 'policy',        path: ROUTES.BGH_AUDIT_LOGS },
];

/**
 * Định dạng thời gian tương đối tiếng Việt: "2 phút trước", "1 giờ trước", ...
 * @param {string} iso
 */
function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Global Search — ô tìm kiếm với dropdown kết quả.
 * Tìm kiếm học sinh từ API + chức năng từ SEARCH_SHORTCUTS.
 */
function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  /**
   * Tìm kiếm: lọc SEARCH_SHORTCUTS theo từ khóa + gọi API học sinh nếu dài ≥ 2 ký tự
   */
  const doSearch = useCallback(async (q) => {
    const trimmed = q.trim().toLowerCase();
    if (!trimmed) { setResults([]); setOpen(false); return; }

    // 1. Shortcuts tĩnh
    const shortcuts = SEARCH_SHORTCUTS.filter(s =>
      s.label.toLowerCase().includes(trimmed)
    ).map(s => ({ type: 'shortcut', ...s }));

    setResults(shortcuts);
    setOpen(true);

    if (trimmed.length < 2) return;

    // 2. Học sinh từ API (async)
    setLoading(true);
    try {
      const res = await apiClient(`/students?page=1&limit=5&search=${encodeURIComponent(trimmed)}`);
      const students = (res?.data ?? (Array.isArray(res) ? res : [])).map(s => ({
        type:  'student',
        label: s.full_name || s.fullName || '',
        sub:   `${s.student_code || s.studentCode || ''} · ${s.class_name || s.className || ''}`,
        path:  ROUTES.STUDENTS,
        icon:  'person',
      }));
      setResults(prev => [...students, ...prev]);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  // Debounce 300ms
  function handleChange(e) {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q), 300);
  }

  // Đóng khi click ra ngoài
  useEffect(() => {
    function onClickOutside(e) {
      if (!panelRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Keyboard: Escape đóng
  function handleKeyDown(e) {
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  }

  function pickResult(path) {
    setQuery(''); setOpen(false);
    navigate(path);
  }

  return (
    <div className="relative">
      {/* Search input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[17px] text-[#94a3b8]" aria-hidden="true">
          search
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm học sinh, lớp, chức năng..."
          className="w-56 lg:w-72 pl-9 pr-3 py-2 text-[13px] text-[#0f172a] placeholder-[#94a3b8] bg-[#f1f5f9] border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] focus:w-72 lg:focus:w-96 transition-all duration-200"
          aria-label="Tìm kiếm toàn hệ thống"
          aria-haspopup="listbox"
          aria-expanded={open}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin inline-block w-3.5 h-3.5 border-2 border-[#cbd5e1] border-t-[#2563eb] rounded-full" aria-hidden="true" />
        )}
      </div>

      {/* Dropdown kết quả */}
      {open && results.length > 0 && (
        <div ref={panelRef}
          className="absolute top-full left-0 mt-1.5 w-80 bg-white rounded-xl border border-[#e2e8f0] shadow-lg z-50 overflow-hidden"
          role="listbox" aria-label="Kết quả tìm kiếm">
          {/* Header dropdown */}
          <div className="px-4 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wide">Kết quả</span>
            <span className="text-[11px] text-[#94a3b8]">{results.length} mục</span>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {results.map((r, i) => (
              <button key={i} type="button"
                onClick={() => pickResult(r.path)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f1f5f9] text-left transition-colors"
                role="option">
                <span className={`flex-none w-8 h-8 rounded-lg flex items-center justify-center ${
                  r.type === 'student' ? 'bg-[#eff4ff]' : 'bg-[#f1f5f9]'
                }`} aria-hidden="true">
                  <span className="material-symbols-outlined text-[17px] text-[#475569]">{r.icon}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-[#0f172a] truncate">{r.label}</p>
                  {r.sub && <p className="text-[11px] text-[#94a3b8] truncate">{r.sub}</p>}
                </div>
                <span className="material-symbols-outlined text-[15px] text-[#cbd5e1]">arrow_forward</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Bell Notifications — chuông với badge + dropdown thông báo mới nhất.
 * Nguồn dữ liệu DUY NHẤT: fetchNotifications() — tính unread từ list,
 * không dùng fetchUnreadCount() riêng để tránh xung đột 2 nguồn.
 */
function BellDropdown() {
  const [open, setOpen]       = useState(false);
  const [notifs, setNotifs]   = useState([]);
  const [unread, setUnread]   = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const btnRef   = useRef(null);
  const navigate = useNavigate();

  /**
   * Tải danh sách thông báo + tính unread từ cùng 1 nguồn.
   * isRead: check cả readAt (camelCase từ Service DTO) lẫn read_at (snake_case fallback).
   */
  const loadNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      const list = Array.isArray(data) ? data : [];
      setNotifs(list.slice(0, 8));
      // Dùng readAt (camelCase DTO) hoặc read_at (fallback snake_case)
      setUnread(list.filter(n => !n.readAt && !n.read_at).length);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  // Polling mỗi 30s — CHỈ dùng loadNotifs, không gọi fetchUnreadCount() riêng
  useEffect(() => {
    let cancelled = false;
    async function tick() {
      if (cancelled) return;
      try {
        const data = await fetchNotifications();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        // Chỉ cập nhật badge khi dropdown đang đóng (tránh giật khi đang xem)
        if (!cancelled) {
          setNotifs(prev => open ? prev : list.slice(0, 8));
          setUnread(list.filter(n => !n.readAt && !n.read_at).length);
        }
      } catch { /* silent */ }
    }
    tick();
    const t = setInterval(tick, 30_000);
    return () => { cancelled = true; clearInterval(t); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Tải thông báo khi mở dropdown
  useEffect(() => { if (open) loadNotifs(); }, [open, loadNotifs]);

  // Đóng khi click ra ngoài
  useEffect(() => {
    function onClickOutside(e) {
      if (!panelRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  /**
   * Click vào thông báo: đánh dấu đã đọc (optimistic) → điều hướng.
   * Dùng readAt (camelCase) thống nhất để check trạng thái.
   */
  async function handleNotifClick(notif) {
    setOpen(false);
    // Kiểm tra cả 2 key để tương thích DTO camelCase và fallback snake_case
    const alreadyRead = notif.readAt || notif.read_at;
    if (!alreadyRead) {
      // Optimistic: giảm badge ngay lập tức
      const now = new Date().toISOString();
      setNotifs(prev => prev.map(n =>
        n.id === notif.id ? { ...n, readAt: now, read_at: now } : n
      ));
      setUnread(prev => Math.max(0, prev - 1));
      // Gọi API async (không block UX)
      markNotificationRead(notif.id).catch(() => {
        // Rollback nếu API lỗi
        setNotifs(prev => prev.map(n =>
          n.id === notif.id ? { ...n, readAt: undefined, read_at: undefined } : n
        ));
        setUnread(prev => prev + 1);
      });
    }
    navigate(ROUTES.NOTIFICATIONS);
  }

  return (
    <div className="relative">
      {/* Nút chuông */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors"
        aria-label={`Thông báo${unread > 0 ? `, ${unread} chưa đọc` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-[22px]">notifications</span>
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ef4444] text-white text-[10px] font-bold flex items-center justify-center leading-none border-2 border-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown thông báo */}
      {open && (
        <div ref={panelRef}
          className="absolute top-full right-0 mt-1.5 w-96 bg-white rounded-xl border border-[#e2e8f0] shadow-xl z-50 overflow-hidden"
          role="dialog" aria-label="Thông báo">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-[#0f172a]">Thông báo</span>
              {unread > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#b91c1c] text-[11px] font-semibold">
                  {unread} chưa đọc
                </span>
              )}
            </div>
            <NavLink to={ROUTES.NOTIFICATIONS}
              onClick={() => setOpen(false)}
              className="text-[12px] font-medium text-[#2563eb] hover:underline">
              Xem tất cả
            </NavLink>
          </div>

          {/* Danh sách */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-[#94a3b8]">
                <span className="animate-spin inline-block w-5 h-5 border-2 border-[#e2e8f0] border-t-[#2563eb] rounded-full mr-2" />
                Đang tải...
              </div>
            ) : notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-[#94a3b8]">
                <span className="material-symbols-outlined text-[36px] mb-2">notifications_none</span>
                <p className="text-[13px]">Chưa có thông báo mới</p>
              </div>
            ) : (
              notifs.map(notif => {
                const isUnread = !notif.isRead && !notif.read_at;
                return (
                  <button key={notif.id} type="button"
                    onClick={() => handleNotifClick(notif)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#f8fafc] transition-colors border-b border-[#f1f5f9] last:border-b-0 ${isUnread ? 'bg-[#eff4ff]/40' : ''}`}
                  >
                    {/* Dot chưa đọc */}
                    <span className={`flex-none mt-1.5 w-2 h-2 rounded-full ${isUnread ? 'bg-[#2563eb]' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] leading-snug ${isUnread ? 'font-semibold text-[#0f172a]' : 'text-[#334155]'}`}>
                        {notif.title || notif.message || notif.content || '(Thông báo)'}
                      </p>
                      {(notif.body || notif.description) && (
                        <p className="text-[11px] text-[#64748b] mt-0.5 truncate">
                          {notif.body || notif.description}
                        </p>
                      )}
                      <p className="text-[11px] text-[#94a3b8] mt-1">
                        {timeAgo(notif.created_at || notif.createdAt || notif.timestamp)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Semester Selector — dropdown chọn Học kỳ / Năm học.
 * Đồng bộ state với SemesterContext.
 */
function SemesterSelector() {
  const { label, semester, schoolYear, selectSemester, options } = useSemester();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const btnRef   = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (!panelRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative hidden lg:block">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f1f5f9] border border-[#e2e8f0] text-[13px] font-medium text-[#334155] hover:bg-[#e2e8f0] transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-[16px] text-[#2563eb]" aria-hidden="true">date_range</span>
        <span className="max-w-[160px] truncate">{label}</span>
        <span className="material-symbols-outlined text-[15px] text-[#94a3b8]" aria-hidden="true">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open && (
        <div ref={panelRef}
          className="absolute top-full right-0 mt-1.5 w-56 bg-white rounded-xl border border-[#e2e8f0] shadow-lg z-50 overflow-hidden py-1"
          role="listbox" aria-label="Chọn học kỳ">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wide border-b border-[#f1f5f9] mb-1">
            Chọn Học kỳ
          </div>
          {options.map((opt, idx) => {
            const isActive = opt.semester === semester && opt.schoolYear === schoolYear;
            return (
              <button key={idx} type="button"
                onClick={() => { selectSemester(idx); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors ${
                  isActive
                    ? 'bg-[#eff4ff] text-[#2563eb] font-semibold'
                    : 'text-[#334155] hover:bg-[#f8fafc]'
                }`}
                role="option" aria-selected={isActive}
              >
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  {isActive ? 'radio_button_checked' : 'radio_button_unchecked'}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Header component ────────────────────────────────────────────────────

/**
 * UserMenu — Avatar + dropdown Hồ sơ / Đổi mật khẩu / Đăng xuất.
 */
function UserMenu({ user, role, onLogout }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const btnRef   = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClickOutside(e) {
      if (!panelRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const displayName  = user?.name || user?.fullName || user?.username || 'Người dùng';
  const avatarLetter = displayName[0]?.toUpperCase() ?? 'U';
  const badgeStyle   = ROLE_BADGE_STYLES[role] || 'bg-[#f1f5f9] text-[#334155] border-[#e2e8f0]';

  const menuItems = [
    { label: 'Hồ sơ cá nhân',  icon: 'account_circle', action: () => { setOpen(false); navigate('/profile'); } },
    { label: 'Đổi mật khẩu',   icon: 'key',             action: () => { setOpen(false); navigate('/forgot-password'); } },
    { divider: true },
    { label: 'Đăng xuất',      icon: 'logout',          action: () => { setOpen(false); onLogout(); }, danger: true },
  ];

  return (
    <div className="relative">
      {/* Avatar button */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-1 rounded-lg hover:bg-[#f1f5f9] px-2 py-1.5 transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Menu tài khoản"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563eb] to-[#4f46e5] flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden">
            {user?.avatar
              ? <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
              : avatarLetter}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22c55e] border-2 border-white" />
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-[12px] font-semibold text-[#0f172a] leading-tight truncate max-w-[130px]">
            {displayName}
          </span>
          <span className={`inline-flex items-center px-1.5 py-0 rounded text-[10px] font-bold border ${badgeStyle} leading-tight`}>
            {ROLE_LABELS[role] ?? role}
          </span>
        </div>
        <span className="material-symbols-outlined text-[16px] text-[#94a3b8] hidden md:block" aria-hidden="true">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div ref={panelRef}
          className="absolute top-full right-0 mt-1.5 w-52 bg-white rounded-xl border border-[#e2e8f0] shadow-xl z-50 overflow-hidden py-1"
          role="menu">
          {/* User info mini header */}
          <div className="px-4 py-3 border-b border-[#f1f5f9]">
            <p className="text-[13px] font-semibold text-[#0f172a] truncate">{displayName}</p>
            <p className="text-[11px] text-[#64748b] truncate">@{user?.username}</p>
          </div>

          {/* Menu items */}
          {menuItems.map((item, i) => {
            if (item.divider) return <div key={`div-${i}`} className="my-1 h-px bg-[#f1f5f9]" />;
            return (
              <button key={item.label} type="button"
                onClick={item.action}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-[13px] font-medium transition-colors ${
                  item.danger
                    ? 'text-[#dc2626] hover:bg-[#fef2f2]'
                    : 'text-[#334155] hover:bg-[#f8fafc]'
                }`}
                role="menuitem">
                <span className="material-symbols-outlined text-[17px]" aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Header Enterprise — HSU Digital Campus
 * @param {{ title: string }} props
 */
export default function Header({ title }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  return (
    <header className="print:hidden shrink-0 h-16 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-4 md:px-6 z-30 gap-3">

      {/* ── Trái: Tiêu đề trang ── */}
      <div className="flex items-center gap-3 min-w-0 flex-shrink">
        <h1 className="text-[15px] font-bold text-[#0f172a] truncate hidden sm:block">
          {title ?? 'HTQLLH — THPT Hoa Sen'}
        </h1>
      </div>

      {/* ── Giữa: Global Search ── */}
      <div className="flex-1 flex justify-center">
        <GlobalSearch />
      </div>

      {/* ── Phải: Học kỳ + Bell + User dropdown ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <SemesterSelector />
        <BellDropdown />
        <div className="h-8 w-px bg-[#e2e8f0] hidden sm:block" />
        <UserMenu user={user} role={role} onLogout={handleLogout} />
      </div>
    </header>
  );
}
