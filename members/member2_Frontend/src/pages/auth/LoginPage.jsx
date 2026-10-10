import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { ROLE_DASHBOARD } from '../../constants/routes.js';

const ROLE_CONFIGS = [
  {
    role: ROLES.BGH,
    shortLabel: 'BGH',
    label: 'Ban Giám Hiệu',
    subTitle: 'Hiệu Trưởng / Quản Trị Hệ Thống',
    icon: 'admin_panel_settings',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    username: 'bgh.admin',
    defaultPass: '123456',
    desc: 'Quản trị điều hành, phê duyệt khóa/mở sổ điểm toàn trường, giám sát chuyên cần và thống kê học lực vĩ mô.',
    avatarTitle: 'Thầy Trần Quốc Bảo (Hiệu trưởng)',
  },
  {
    role: ROLES.GVCN,
    shortLabel: 'GVCN',
    label: 'GV Chủ Nhiệm',
    subTitle: 'Giáo Viên Lớp 10A1',
    icon: 'supervisor_account',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    username: 'gvcn.10a1',
    defaultPass: '123456',
    desc: 'Điểm danh chuyên cần học sinh 10A1 hằng ngày, duyệt đơn xin nghỉ phép của phụ huynh và quản lý hồ sơ lớp.',
    avatarTitle: 'Cô Lê Minh Châu (GVCN 10A1)',
  },
  {
    role: ROLES.GV,
    shortLabel: 'GV Bộ Môn',
    label: 'GV Bộ Môn',
    subTitle: 'Giáo Viên Môn Toán',
    icon: 'school',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    username: 'gv.an',
    defaultPass: '123456',
    desc: 'Nhập điểm thành phần (Miệng, 15 phút, 1 tiết, Giữa kỳ, Cuối kỳ), tự động tính GPA và gửi khóa sổ điểm.',
    avatarTitle: 'Thầy Nguyễn Văn An (GV Toán)',
  },
  {
    role: ROLES.HS,
    shortLabel: 'Học Sinh',
    label: 'Học Sinh',
    subTitle: 'Cổng Thông Tin Học Sinh',
    icon: 'person',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    username: 'hs.anh',
    defaultPass: '123456',
    desc: 'Tra cứu bảng điểm điện tử cá nhân, xem thời khóa biểu, lịch thi và theo dõi kết quả chuyên cần tích lũy.',
    avatarTitle: 'Em Nguyễn Thị Ánh (HS 10A1)',
  },
  {
    role: ROLES.PH,
    shortLabel: 'Phụ Huynh',
    label: 'Phụ Huynh',
    subTitle: 'Sổ Liên Lạc Điện Tử',
    icon: 'family_restroom',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    username: 'ph.hs0001',
    defaultPass: '123456',
    desc: 'Theo dõi học lực và chuyên cần của con, nộp đơn xin nghỉ học trực tuyến, tra cứu và thanh toán học phí kèm biên lai.',
    avatarTitle: 'Chị Nguyễn Thị Hương (PH HS001)',
  },
];

export default function LoginPage() {
  const { isAuthenticated, role, login } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState(ROLES.BGH);
  const [formData, setFormData] = useState({ username: 'bgh.admin', password: '123456' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  if (isAuthenticated) {
    return <Navigate to={ROLE_DASHBOARD[role]} replace />;
  }

  const activeConfig = ROLE_CONFIGS.find((t) => t.role === activeRole) || ROLE_CONFIGS[0];

  const handleRoleSelect = (selectedRole) => {
    setActiveRole(selectedRole);
    const cfg = ROLE_CONFIGS.find((t) => t.role === selectedRole);
    setFormData({
      username: cfg?.username || '',
      password: cfg?.defaultPass || '123456',
    });
    setError('');
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleLoginExecute = async (targetRole, usernameVal, passwordVal) => {
    setIsLoading(true);
    setError('');
    try {
      await login({ username: usernameVal, password: passwordVal, role: targetRole });
      navigate(ROLE_DASHBOARD[targetRole], { replace: true });
    } catch {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLoginExecute(activeRole, formData.username, formData.password);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col lg:flex-row antialiased select-none font-sans text-slate-800">
      {/* ========================================================================= */}
      {/* LEFT PANEL: BRIGHT HERO SHOWCASE WITH DAYTIME 3D DIGITAL CAMPUS VISUAL     */}
      {/* ========================================================================= */}
      <div className="relative w-full lg:w-[52%] xl:w-[50%] bg-gradient-to-b from-blue-50/90 via-slate-50 to-indigo-50/80 p-6 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200/80">
        {/* Soft Ambient Pastel Glow Orbs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-indigo-300/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding Section */}
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-blue-200/80 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-700">
              TRƯỜNG THPT HOA SEN (HSU) • SMS DIGITAL PORTAL
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Hệ Thống Quản Lý Lớp Học &amp; Học Vụ
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl font-normal leading-relaxed">
              Nền tảng chuyển đổi số giáo dục toàn diện, kết nối thông suốt giữa Ban Giám Hiệu, Thầy Cô, Học Sinh và Phụ Huynh.
            </p>
          </div>
        </div>

        {/* Centerpiece: Bright Daytime 3D Digital Campus Visual */}
        <div className="relative z-10 my-6 sm:my-8 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[460px] group">
            {/* Subtle card glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-teal-400/20 rounded-3xl blur-lg opacity-70 group-hover:opacity-100 transition duration-500" />

            {/* Main Visual Frame */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-xl shadow-blue-500/10">
              <img
                src="/edumanage-light-hero.jpg"
                alt="EduManage Pro Bright Digital Campus Architecture"
                className="w-full h-auto max-h-[360px] sm:max-h-[410px] object-cover object-top transition duration-500 group-hover:scale-[1.01]"
              />

              {/* Bottom Caption Bar */}
              <div className="bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold tracking-wider uppercase text-blue-600">
                    TRƯỜNG HỌC SỐ (DIGITAL CAMPUS)
                  </p>
                  <p className="text-xs font-bold text-slate-900">Hệ Sinh Thái Quản Lý Học Vụ Chuẩn Hóa</p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                  PostgreSQL Online
                </span>
              </div>
            </div>


          </div>
        </div>

        {/* Bottom Metadata on Left */}
        <div className="relative z-10 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            <span className="font-medium text-slate-700">Khoa CNTT • Đại học Hoa Sen (HSU)</span>
            <span className="mx-2 text-slate-400">•</span>
            <span>Đồ án Phát triển Dự án Phần mềm</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Học kỳ 1 • 2025–2026</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: PURE LIGHT THEME AUTHENTICATION & QUICK ROLE SELECTOR HUB    */}
      {/* ========================================================================= */}
      <div className="flex-1 bg-white lg:bg-slate-50/60 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[500px] bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6">
          {/* Header Title & Subtitle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">school</span>
                </div>
                <span className="text-xs font-bold tracking-wider uppercase text-blue-700">CỔNG ĐĂNG NHẬP</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                Phiên bản v1.0
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 pt-1">
              Đăng Nhập Hệ Thống
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Chọn vai trò bên dưới để trải nghiệm hoặc đăng nhập bằng tài khoản được cấp.
            </p>
          </div>

          {/* Segmented Control / Role Selector Bar (5 Clean Pill Tabs) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Chọn vai trò đăng nhập:</span>
              <span className="text-slate-500 text-[11px] font-medium">{activeConfig.avatarTitle}</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200/80">
              {ROLE_CONFIGS.map((cfg) => {
                const isActive = activeRole === cfg.role;
                return (
                  <button
                    key={cfg.role}
                    type="button"
                    onClick={() => handleRoleSelect(cfg.role)}
                    className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{cfg.icon}</span>
                    <span className="text-[11px] leading-tight truncate w-full text-center">
                      {cfg.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>


          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-xs font-bold text-slate-700">
                Tên đăng nhập / Mã định danh
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400 pointer-events-none">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập"
                  className="w-full bg-white border border-slate-300 rounded-xl text-slate-900 pl-10 pr-3 py-2.5 text-sm transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none placeholder:text-slate-400 font-sans shadow-2xs"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                Mật khẩu
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400 pointer-events-none">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  className="w-full bg-white border border-slate-300 rounded-xl text-slate-900 pl-10 pr-10 py-2.5 text-sm transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none placeholder:text-slate-400 font-sans shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 bg-white text-blue-600 focus:ring-0 focus:ring-offset-0"
                />
                <span className="font-medium">Ghi nhớ phiên đăng nhập</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Vui lòng liên hệ Quản trị viên (BGH) để khôi phục mật khẩu tài khoản.')}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Main Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all duration-200 text-sm cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>Đang xác thực thông tin...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập Với Quyền {activeConfig.shortLabel}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Quick One-Click Demo Access Button */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => handleLoginExecute(activeConfig.role, activeConfig.username, activeConfig.defaultPass)}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-600">bolt</span>
              <span>Đăng Nhập Nhanh 1-Chạm ({activeConfig.username} / {activeConfig.defaultPass})</span>
            </button>
          </div>
        </div>

        {/* Global Footer info */}
        <p className="mt-6 text-[11px] text-slate-500 text-center font-medium">
          Dự án Phát triển Dự án Phần mềm © 2026 Võ Duy Bình &amp; Nhóm Sinh viên HSU. All rights reserved.
        </p>
      </div>
    </div>
  );
}
