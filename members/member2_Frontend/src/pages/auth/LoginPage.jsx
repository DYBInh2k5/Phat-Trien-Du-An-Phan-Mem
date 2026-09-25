import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { ROLE_DASHBOARD } from '../../constants/routes.js';

const ROLE_TABS = [
  { role: ROLES.GV,  label: 'GV / Cán bộ',      icon: 'school',               placeholder: 'Ví dụ: nam.td@thptkythiqg.edu.vn' },
  { role: ROLES.PH,  label: 'PH / Học sinh',     icon: 'family_restroom',      placeholder: 'Ví dụ: nguyen.ph@gmail.com' },
  { role: ROLES.BGH, label: 'BGH / Quản trị',    icon: 'admin_panel_settings', placeholder: 'Ví dụ: hieupho@thptkythiqg.edu.vn' },
];

export default function LoginPage() {
  const { isAuthenticated, role, login } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole]   = useState(ROLES.GV);
  const [formData, setFormData]       = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');
  const [isLoading, setIsLoading]     = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={ROLE_DASHBOARD[role]} replace />;
  }

  const activeTab = ROLE_TABS.find(t => t.role === activeRole);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleTabChange = (newRole) => {
    setActiveRole(newRole);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login({ username: formData.username, password: formData.password, role: activeRole });
      navigate(ROLE_DASHBOARD[activeRole], { replace: true });
    } catch {
      setError('Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f0f5ff] to-[#e6effe] flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-[#c3c6d7]/50 bg-white/80 backdrop-blur-md px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#004ac6] to-[#2563eb] flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[24px]">school</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-[#0b1c30] text-headline-sm">EDUMANAGE</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-100 text-[#004ac6] border border-blue-200">
                PRO v2.4
              </span>
            </div>
            <p className="text-xs text-[#434655]">Cổng Học vụ &amp; Quản lý Giáo dục Số</p>
          </div>
        </div>
        <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Hệ thống hoạt động bình thường
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 relative overflow-hidden">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#004ac6] to-[#2563eb]" />

            {/* Logo + title */}
            <div className="text-center mb-6 pt-1">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 mb-3.5 shadow-sm border border-blue-100">
                <span className="material-symbols-outlined text-[32px] text-[#004ac6]">verified_user</span>
              </div>
              <h1 className="text-headline-sm font-bold text-[#0b1c30] uppercase tracking-tight">
                HỆ THỐNG QUẢN LÝ DẠY HỌC &amp; HỌC VỤ
              </h1>
              <p className="text-body-sm text-[#434655] mt-2">
                Cổng thông tin dành cho Ban Giám Hiệu, Giáo viên &amp; Cán bộ Nhà trường
              </p>
            </div>

            {/* Role tabs */}
            <div className="mb-5">
              <div className="grid grid-cols-3 p-1 bg-[#eff4ff] rounded-xl border border-slate-200/80 gap-1 text-xs">
                {ROLE_TABS.map(tab => (
                  <button
                    key={tab.role}
                    type="button"
                    onClick={() => handleTabChange(tab.role)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-medium transition-all text-xs ${
                      activeRole === tab.role
                        ? 'bg-white text-[#004ac6] font-semibold shadow-sm border border-slate-200/60'
                        : 'text-[#434655] hover:text-[#0b1c30] hover:bg-white/60'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label htmlFor="username" className="block text-xs font-semibold text-slate-700">
                  Tên đăng nhập <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder={activeTab.placeholder}
                    className="w-full bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-[#0b1c30] placeholder:text-slate-400 pl-11 pr-4 py-2.5 text-sm transition-all focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                  Mật khẩu <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu"
                    className="w-full bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-[#0b1c30] placeholder:text-slate-400 pl-11 pr-12 py-2.5 text-sm transition-all focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-2.5 px-2 py-1 text-slate-400 hover:text-slate-700 transition-colors rounded-lg"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <p className="text-[#dc2626] text-body-sm mt-2" role="alert">
                  {error}
                </p>
              )}

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#004ac6] hover:bg-[#003ea8] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all text-sm"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] animate-spin">
                        progress_activity
                      </span>
                      Đang đăng nhập...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">login</span>
                      ĐĂNG NHẬP HỆ THỐNG
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-[#434655] mt-4">
            © 2024 EduManage Pro — Hệ thống Quản lý Dạy học &amp; Học vụ Quốc gia
          </p>
        </div>
      </main>
    </div>
  );
}
