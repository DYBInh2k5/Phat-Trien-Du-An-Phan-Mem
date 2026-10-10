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
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    accentColor: 'from-amber-500 to-orange-600',
    username: 'bgh.admin',
    defaultPass: '123456',
    desc: 'Quản trị điều hành, phê duyệt khóa/mở sổ điểm toàn trường, giám sát chuyên cần và thống kê học lực vĩ mô.',
    avatarTitle: 'Thầy Trần Quốc Bảo',
  },
  {
    role: ROLES.GVCN,
    shortLabel: 'GVCN',
    label: 'GV Chủ Nhiệm',
    subTitle: 'Giáo Viên Lớp 10A1',
    icon: 'supervisor_account',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    accentColor: 'from-purple-600 to-indigo-600',
    username: 'gvcn.10a1',
    defaultPass: '123456',
    desc: 'Điểm danh chuyên cần học sinh 10A1 hằng ngày, duyệt đơn xin nghỉ phép của phụ huynh và quản lý hồ sơ lớp.',
    avatarTitle: 'Cô Lê Minh Châu',
  },
  {
    role: ROLES.GV,
    shortLabel: 'GV Bộ Môn',
    label: 'GV Bộ Môn',
    subTitle: 'Giáo Viên Môn Toán',
    icon: 'school',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    accentColor: 'from-blue-600 to-cyan-600',
    username: 'gv.an',
    defaultPass: '123456',
    desc: 'Nhập điểm thành phần (Miệng, 15 phút, 1 tiết, Giữa kỳ, Cuối kỳ), tự động tính GPA và gửi khóa sổ điểm.',
    avatarTitle: 'Thầy Nguyễn Văn An',
  },
  {
    role: ROLES.HS,
    shortLabel: 'Học Sinh',
    label: 'Học Sinh',
    subTitle: 'Cổng Thông Tin Học Sinh',
    icon: 'person',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: 'from-emerald-600 to-teal-600',
    username: 'hs.anh',
    defaultPass: '123456',
    desc: 'Tra cứu bảng điểm điện tử cá nhân, xem thời khóa biểu, lịch thi và theo dõi kết quả chuyên cần tích lũy.',
    avatarTitle: 'Em Nguyễn Thị Ánh (10A1)',
  },
  {
    role: ROLES.PH,
    shortLabel: 'Phụ Huynh',
    label: 'Phụ Huynh',
    subTitle: 'Sổ Liên Lạc Điện Tử',
    icon: 'family_restroom',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    accentColor: 'from-rose-500 to-pink-600',
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
    <div className="min-h-screen w-full bg-slate-950 flex flex-col lg:flex-row antialiased select-none font-sans">
      {/* ========================================================================= */}
      {/* LEFT PANEL: HERO BRAND SHOWCASE WITH ISOMETRIC SMART CAMPUS VISUAL */}
      {/* ========================================================================= */}
      <div className="relative w-full lg:w-[52%] xl:w-[50%] bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-[#11192e] p-6 sm:p-10 lg:p-12 flex flex-col justify-between text-white overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
        {/* Ambient Gradient Glow Orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding Section */}
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-200">
              TRƯỜNG THPT HOA SEN (HSU) • SMS PLATFORM
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Hệ Thống Quản Lý Lớp Học &amp; Học Vụ
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
              Nền tảng giáo dục số thông minh, tích hợp quản lý sổ điểm, chuyên cần, xét duyệt và kết nối đa chiều giữa Nhà trường, Giáo viên và Gia đình.
            </p>
          </div>
        </div>

        {/* Centerpiece: 3D Smart Campus Illustration & Floating Glass Chips */}
        <div className="relative z-10 my-6 sm:my-8 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[460px] group">
            {/* Soft Ambient Shadow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-teal-500/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-700" />

            {/* Main Hero Visual Card */}
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-slate-900/90 shadow-2xl shadow-indigo-950/60 backdrop-blur-sm">
              <img
                src="/edumanage-hero.jpg"
                alt="EduManage Pro Smart Campus Digital Architecture"
                className="w-full h-auto max-h-[360px] sm:max-h-[400px] object-cover object-top transition duration-500 group-hover:scale-[1.02]"
              />

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 pt-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-wide uppercase text-indigo-400">
                      KIẾN TRÚC TRƯỜNG HỌC SỐ
                    </p>
                    <p className="text-sm font-bold text-white">Smart Campus &amp; Academic Digital Core</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-500/20 border border-indigo-400/30 text-indigo-200">
                    PostgreSQL 15 Ready
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Glass Highlight Chips */}
            <div className="hidden sm:flex absolute -top-4 -right-4 px-3.5 py-2 rounded-xl bg-slate-900/85 border border-white/15 backdrop-blur-md shadow-lg shadow-black/40 items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-400">task_alt</span>
              <span className="text-xs font-semibold text-white">43 Quy Trình SRS Chuẩn Hóa</span>
            </div>

            <div className="hidden sm:flex absolute -bottom-4 -left-4 px-3.5 py-2 rounded-xl bg-slate-900/85 border border-white/15 backdrop-blur-md shadow-lg shadow-black/40 items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-cyan-400">verified_user</span>
              <span className="text-xs font-semibold text-white">Bảo Mật 5 Vai Trò RBAC</span>
            </div>
          </div>
        </div>

        {/* Bottom Metadata & Footer on Left */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div>
            <span>Khoa CNTT • Đại học Hoa Sen (HSU)</span>
            <span className="mx-2 text-slate-600">•</span>
            <span>Đồ án Phát triển Dự án Phần mềm</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Học kỳ 1 • 2025–2026</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: REFINED AUTHENTICATION & QUICK ROLE SELECTOR HUB */}
      {/* ========================================================================= */}
      <div className="flex-1 bg-slate-900 lg:bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[500px] bg-slate-900 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50 text-white space-y-6">
          {/* Header Title & Subtitle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">account_circle</span>
                </div>
                <span className="text-xs font-bold tracking-wider uppercase text-indigo-400">CỔNG XÁC THỰC</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700/60">
                Phiên bản v1.0 Production
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white pt-1">
              Đăng Nhập Hệ Thống
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Chọn vai trò bên dưới để trải nghiệm hoặc nhập tài khoản cá nhân.
            </p>
          </div>

          {/* Segmented Control / Role Selector Bar (5 Pill Tabs) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Chọn vai trò đăng nhập:</span>
              <span className="text-slate-400 text-[11px]">{activeConfig.avatarTitle}</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              {ROLE_CONFIGS.map((cfg) => {
                const isActive = activeRole === cfg.role;
                return (
                  <button
                    key={cfg.role}
                    type="button"
                    onClick={() => handleRoleSelect(cfg.role)}
                    className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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

          {/* Role Brief Information Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <span className="material-symbols-outlined text-[20px]">{activeConfig.icon}</span>
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-bold text-white truncate">{activeConfig.label}</p>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                  ROLE_{activeConfig.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {activeConfig.desc}
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-xs font-semibold text-slate-300">
                Tên đăng nhập / Mã định danh
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-500 pointer-events-none">
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
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl text-white pl-10 pr-3 py-2.5 text-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none placeholder:text-slate-600 font-sans"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300">
                Mật khẩu
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-500 pointer-events-none">
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
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl text-white pl-10 pr-10 py-2.5 text-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none placeholder:text-slate-600 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                />
                <span>Ghi nhớ phiên đăng nhập</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Vui lòng liên hệ Quản trị viên (BGH) để khôi phục mật khẩu tài khoản.')}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs font-medium flex items-center gap-2 animate-shake">
                <span className="material-symbols-outlined text-[18px] text-red-400 shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Main Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:via-indigo-500 hover:to-indigo-600 active:scale-[0.99] disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all duration-200 text-sm cursor-pointer"
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
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => handleLoginExecute(activeConfig.role, activeConfig.username, activeConfig.defaultPass)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-400">bolt</span>
              <span>Đăng Nhập Nhanh 1-Chạm ({activeConfig.username} / {activeConfig.defaultPass})</span>
            </button>
          </div>
        </div>

        {/* Global Footer info */}
        <p className="mt-6 text-[11px] text-slate-500 text-center">
          Dự án Phát triển Dự án Phần mềm © 2026 Võ Duy Bình &amp; Nhóm Sinh viên HSU. All rights reserved.
        </p>
      </div>
    </div>
  );
}
