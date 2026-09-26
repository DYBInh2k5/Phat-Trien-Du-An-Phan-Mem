import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { ROLE_DASHBOARD } from '../../constants/routes.js';

const ROLE_TABS = [
  { role: ROLES.GV,  label: 'Giáo viên & Cán bộ', icon: 'school',          placeholder: 'Ví dụ: nam.td@hsu.edu.vn' },
  { role: ROLES.PH,  label: 'Học sinh & Phụ huynh', icon: 'family_restroom', placeholder: 'Ví dụ: hs0001 / nguyen.ph@gmail.com' },
  { role: ROLES.BGH, label: 'Ban Giám Hiệu',      icon: 'admin_panel_settings', placeholder: 'Ví dụ: bgh@hsu.edu.vn' },
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
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col justify-between font-sans">
      {/* Top institution header */}
      <header className="w-full bg-white border-b border-[#e2e8f0] px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#004ac6] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            <span className="material-symbols-outlined text-[24px]">school</span>
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-[#0f172a] text-body-md uppercase">
              TRƯỜNG THPT HSU — CỔNG THÔNG TIN HỌC VỤ
            </h1>
            <p className="text-label-sm text-[#64748b]">Sổ Điểm Điện Tử &amp; Quản Lý Nhà Trường</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-label-sm text-[#475569] bg-[#f1f5f9] px-3 py-1.5 rounded-md border border-[#e2e8f0]">
          <span className="material-symbols-outlined text-[16px] text-[#004ac6]">verified</span>
          Năm học 2024–2025
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-sm p-6 md:p-8">
            
            {/* Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#eff4ff] text-[#004ac6] mb-3 border border-[#bfdbfe]">
                <span className="material-symbols-outlined text-[28px]">lock</span>
              </div>
              <h2 className="text-headline-sm font-bold text-[#0f172a] tracking-tight">
                ĐĂNG NHẬP HỆ THỐNG
              </h2>
              <p className="text-body-sm text-[#64748b] mt-1">
                Chọn đúng vai trò và nhập tài khoản được nhà trường cấp
              </p>
            </div>

            {/* Role Tab Selector */}
            <div className="mb-5">
              <div className="grid grid-cols-3 p-1 bg-[#f1f5f9] rounded-lg border border-[#e2e8f0] gap-1 text-label-sm">
                {ROLE_TABS.map(tab => (
                  <button
                    key={tab.role}
                    type="button"
                    onClick={() => handleTabChange(tab.role)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all text-xs text-center leading-tight ${
                      activeRole === tab.role
                        ? 'bg-white text-[#004ac6] font-semibold shadow-xs border border-[#cbd5e1]'
                        : 'text-[#64748b] hover:text-[#0f172a] hover:bg-white/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] mb-0.5">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label htmlFor="username" className="block text-label-sm font-semibold text-[#334155]">
                  Mã số / Tên đăng nhập <span className="text-[#dc2626]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 pointer-events-none text-[#94a3b8]">
                    <span className="material-symbols-outlined text-[20px]">person</span>
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
                    className="w-full bg-white border border-[#cbd5e1] rounded-lg text-[#0f172a] placeholder:text-[#94a3b8] pl-10 pr-3 py-2 text-body-sm transition-all focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-label-sm font-semibold text-[#334155]">
                  Mật khẩu <span className="text-[#dc2626]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 pointer-events-none text-[#94a3b8]">
                    <span className="material-symbols-outlined text-[20px]">key</span>
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
                    className="w-full bg-white border border-[#cbd5e1] rounded-lg text-[#0f172a] placeholder:text-[#94a3b8] pl-10 pr-10 py-2 text-body-sm transition-all focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-2.5 px-1 py-1 text-[#94a3b8] hover:text-[#334155] transition-colors"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 bg-[#fef2f2] border border-[#fca5a5] rounded-lg text-[#b91c1c] text-body-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#004ac6] hover:bg-[#003ea8] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg shadow-xs flex items-center justify-center gap-2 transition-all text-body-md"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] animate-spin">
                        progress_activity
                      </span>
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">login</span>
                      Đăng Nhập
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#e2e8f0] bg-white py-3 px-6 text-center text-label-sm text-[#64748b]">
        Trường THPT HSU — Cổng Quản lý Học vụ &amp; Sổ điểm Điện tử © 2024. Tất cả quyền được bảo lưu.
      </footer>
    </div>
  );
}
