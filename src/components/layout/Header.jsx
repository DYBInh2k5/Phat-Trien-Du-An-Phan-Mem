import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../constants/routes.js';

const ROLE_LABELS = {
  GV: 'Giáo viên',
  GVCN: 'GVCN',
  BGH: 'Ban Giám Hiệu',
  PH: 'Phụ huynh',
  HS: 'Học sinh',
};

export default function Header({ title }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 shrink-0 z-30">
      {/* Left: page title */}
      <h1 className="text-headline-sm font-semibold text-[#0f172a] truncate">
        {title ?? 'EduManage Pro'}
      </h1>

      {/* Right: user info + logout */}
      <div className="flex items-center gap-4">
        {/* Notification bell placeholder */}
        <button
          type="button"
          className="p-2 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors relative"
          aria-label="Thông báo"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>

        {/* User avatar + role chip */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#dbeafe] flex items-center justify-center text-[#2563eb] font-semibold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-label-md font-medium text-[#0f172a] leading-tight truncate max-w-[120px]">
              {user?.name ?? 'Người dùng'}
            </span>
            <span className="text-label-sm text-[#64748b] leading-tight">
              {ROLE_LABELS[role] ?? role}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-md text-[#64748b] hover:bg-[#fef2f2] hover:text-[#dc2626] border border-[#e2e8f0] transition-colors"
          title="Đăng xuất"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
