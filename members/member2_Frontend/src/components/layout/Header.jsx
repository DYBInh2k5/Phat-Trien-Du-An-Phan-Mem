import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../constants/routes.js';

const ROLE_LABELS = {
  GV: 'Giáo viên Bộ môn',
  GVCN: 'Giáo viên Chủ nhiệm',
  BGH: 'Ban Giám Hiệu',
  PH: 'Phụ huynh Học sinh',
  HS: 'Học sinh',
};

const ROLE_BADGE_STYLES = {
  GV:   'bg-[#eff4ff] text-[#004ac6] border-[#bfdbfe]',
  GVCN: 'bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]',
  BGH:  'bg-[#fff7ed] text-[#c2410c] border-[#ffedd5]',
  PH:   'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]',
  HS:   'bg-[#f8fafc] text-[#334155] border-[#e2e8f0]',
};

export default function Header({ title }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const badgeStyle = ROLE_BADGE_STYLES[role] || 'bg-[#f1f5f9] text-[#334155] border-[#e2e8f0]';

  return (
    <header className="print:hidden h-16 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 shrink-0 z-30">
      {/* Left: School Portal Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-body-md font-bold text-[#0f172a] truncate">
          {title ?? 'CỔNG THÔNG TIN HỌC VỤ — THPT HSU'}
        </h1>
      </div>

      {/* Right: user info + logout */}
      <div className="flex items-center gap-4">
        {/* Academic term indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-label-sm text-[#475569]">
          <span className="material-symbols-outlined text-[16px] text-[#004ac6]">date_range</span>
          <span>Học kỳ I (2024–2025)</span>
        </div>

        {/* User avatar + role chip */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#e2e8f0]">
          <div className="w-8 h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-label-md font-semibold text-[#0f172a] leading-tight truncate max-w-[140px]">
              {user?.name ?? 'Người dùng'}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${badgeStyle} mt-0.5`}>
              {ROLE_LABELS[role] ?? role}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-medium text-[#475569] hover:bg-[#fef2f2] hover:text-[#dc2626] border border-[#e2e8f0] transition-all active:scale-95"
          title="Đăng xuất khỏi hệ thống"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
