/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/pages/auth/LoginPage.jsx
 * Vai trò: Trang Đăng Nhập Tập Trung (Enterprise Single Sign-On Portal)
 * Kiến trúc: Clean Architecture - UI Presentation Layer
 * Tác giả: Nhóm 6 Sinh viên HSU & Võ Duy Bình (Reviewer)
 * Ngày cập nhật: 24/11/2026
 * Mô tả:
 *   - Giao diện đăng nhập chuẩn cổng thông tin giáo dục hiện đại.
 *   - Tự động nhận diện vai trò (BGH, GVCN, GV, HS, PH) dựa trên thông tin CSDL PostgreSQL.
 *   - Trình bày trực quan với hình ảnh không gian lớp học trường THPT Hoa Sen.
 *   - Cung cấp ngăn mở rộng (collapsible drawer) hỗ trợ tài khoản mẫu thử nghiệm cho 5 vai trò.
 * ==============================================================================
 */

import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { ROLE_DASHBOARD, ROUTES } from '../../constants/routes.js';

/**
 * Danh sách tài khoản thử nghiệm chuẩn mực cho 5 vai trò hệ thống
 */
const DEMO_ACCOUNTS = [
  {
    role: ROLES.BGH,
    label: 'Ban Giám Hiệu',
    subTitle: 'Hiệu Trưởng / Quản Trị Hệ Thống',
    username: 'bgh.admin',
    password: '123456',
    name: 'Thầy Trần Quốc Bảo',
    icon: 'admin_panel_settings',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    role: ROLES.GVCN,
    label: 'GV Chủ Nhiệm',
    subTitle: 'Lớp 10A1',
    username: 'gvcn.10a1',
    password: '123456',
    name: 'Cô Lê Minh Châu',
    icon: 'supervisor_account',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    role: ROLES.GV,
    label: 'GV Bộ Môn',
    subTitle: 'Giáo Viên Toán',
    username: 'gv.an',
    password: '123456',
    name: 'Thầy Nguyễn Văn An',
    icon: 'school',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    role: ROLES.HS,
    label: 'Học Sinh',
    subTitle: 'Lớp 10A1',
    username: 'hs.anh',
    password: '123456',
    name: 'Em Nguyễn Thị Ánh',
    icon: 'person',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    role: ROLES.PH,
    label: 'Phụ Huynh',
    subTitle: 'PH Em Ánh',
    username: 'ph.hs0001',
    password: '123456',
    name: 'Chị Nguyễn Thị Hương',
    icon: 'family_restroom',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
];

export default function LoginPage() {
  const { isAuthenticated, role, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // Nếu người dùng đã đăng nhập, tự động chuyển về Dashboard tương ứng
  if (isAuthenticated && role) {
    return <Navigate to={ROLE_DASHBOARD[role] || ROUTES.HOME} replace />;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  /**
   * Đăng nhập thông qua tài khoản và mật khẩu nhập vào form
   */
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanUsername = formData.username.trim();
    if (!cleanUsername || !formData.password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      // Gọi API đăng nhập tự động nhận diện vai trò (SSO) từ CSDL PostgreSQL
      const res = await login({
        username: cleanUsername,
        password: formData.password,
      });

      const userRole = res?.user?.role;
      const targetDashboard = ROLE_DASHBOARD[userRole] || ROUTES.HOME;
      navigate(targetDashboard, { replace: true });
    } catch (err) {
      if (err?.status === 401) {
        setError(err.message || 'Mã định danh hoặc mật khẩu không chính xác.');
      } else if (err?.status === 400) {
        setError(err.message || 'Vui lòng cung cấp đầy đủ thông tin đăng nhập.');
      } else if (err?.status === 500) {
        setError('Lỗi kết nối cơ sở dữ liệu. Vui lòng liên hệ Quản trị viên.');
      } else if (err?.message?.includes('fetch') || err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
        setError('Không thể kết nối đến máy chủ API (cổng 8081). Vui lòng thử lại.');
      } else {
        setError(err?.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Điền thông tin tài khoản mẫu vào form
   */
  const handleSelectDemoAccount = (account) => {
    setFormData({
      username: account.username,
      password: account.password,
    });
    setError('');
  };

  /**
   * Đăng nhập nhanh bằng tài khoản mẫu trong ngăn mở rộng
   */
  const handleQuickDemoLogin = async (account) => {
    setFormData({
      username: account.username,
      password: account.password,
    });
    setIsLoading(true);
    setError('');
    try {
      const res = await login({
        username: account.username,
        password: account.password,
        role: account.role,
      });
      const userRole = res?.user?.role || account.role;
      navigate(ROLE_DASHBOARD[userRole] || ROUTES.HOME, { replace: true });
    } catch (err) {
      setError(err?.message || 'Đăng nhập thử nghiệm thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col lg:flex-row antialiased select-none font-sans text-slate-800">
      {/* ========================================================================= */}
      {/* LEFT PANEL: HERO SHOWCASE WITH HIGH-SCHOOL CLASSROOM PHOTOGRAPHY          */}
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

        {/* Centerpiece: High-School Classroom Photography */}
        <div className="relative z-10 my-4 sm:my-6 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[480px]">
            {/* Subtle glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 rounded-3xl blur-md" />

            {/* Clean Rounded Image Card - Không có thanh chú thích rườm rà bên dưới */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-xl shadow-slate-300/40">
              <img
                src="/school-classroom-hero.jpg"
                alt="Không gian học đường THPT Hoa Sen"
                className="w-full h-auto max-h-[380px] object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* Key System Highlights */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-[500px] mx-auto w-full pt-1">
          <div className="p-3 bg-white/80 backdrop-blur-xs border border-slate-200/80 rounded-xl shadow-2xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Thông tư 22/BGDĐT</p>
              <p className="text-[11px] text-slate-500 truncate">Đánh giá chuẩn học lực</p>
            </div>
          </div>

          <div className="p-3 bg-white/80 backdrop-blur-xs border border-slate-200/80 rounded-xl shadow-2xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Sổ Liên Lạc Số</p>
              <p className="text-[11px] text-slate-500 truncate">Điểm danh &amp; chuyên cần</p>
            </div>
          </div>

          <div className="p-3 bg-white/80 backdrop-blur-xs border border-slate-200/80 rounded-xl shadow-2xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">VietQR Napas 24/7</p>
              <p className="text-[11px] text-slate-500 truncate">Học phí gạch nợ tức thì</p>
            </div>
          </div>
        </div>

        {/* Bottom Metadata - Chuẩn thông tin cổng giáo dục chính thống */}
        <div className="relative z-10 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="material-symbols-outlined text-[16px] text-blue-600">verified_user</span>
            <span>Cổng thông tin giáo dục chính thức • Bảo mật SSL 256-bit</span>
          </div>
          <span className="font-medium text-slate-500">Năm học 2025–2026</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: AUTHENTIC ENTERPRISE LOGIN PORTAL                            */}
      {/* ========================================================================= */}
      <div className="flex-1 bg-white lg:bg-slate-50/60 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[460px] bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6">
          {/* Header Title & Subtitle - Bỏ nhãn 'Phiên bản v1.0' */}
          <div className="space-y-1.5 pb-1">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo-hsu.svg"
                alt="THPT HSU Logo"
                className="w-9 h-9 rounded-xl shadow-xs shrink-0 object-contain"
              />
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-blue-700 block">
                  CỔNG ĐĂNG NHẬP HỌC VỤ
                </span>
                <span className="text-[10px] text-slate-500 font-medium">THPT HOA SEN • DIGITAL CAMPUS</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 pt-1">
              Đăng Nhập Hệ Thống
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Sử dụng tài khoản định danh do nhà trường cấp để truy cập cổng thông tin.
            </p>
          </div>

          {/* Login Form - Không còn thanh 5 nút chọn vai trò thô sơ */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-xs font-bold text-slate-700">
                Tên đăng nhập / Mã định danh / Email
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ví dụ: bgh.admin, gvcn.10a1, hs.anh..."
                  className="w-full bg-slate-50/40 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-slate-900 pl-10 pr-3 py-2.5 text-sm transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none placeholder:text-slate-400 font-sans shadow-2xs"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                Mật khẩu
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu truy cập..."
                  className="w-full bg-slate-50/40 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-slate-900 pl-10 pr-10 py-2.5 text-sm transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none placeholder:text-slate-400 font-sans shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label="Ẩn / Hiện mật khẩu"
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
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
              >
                Quên mật khẩu?
              </Link>
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
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all duration-200 text-sm cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>Đang xác thực thông tin...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Collapsible Demo / Testing Account Drawer - Gọn gàng, tinh tế, không phá vỡ UI thật */}
          <div className="pt-2 border-t border-slate-200/80">
            <button
              type="button"
              onClick={() => setShowDemoAccounts((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-600">contact_support</span>
                <span>Danh mục tài khoản kiểm thử hệ thống</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-slate-400">
                {showDemoAccounts ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {showDemoAccounts && (
              <div className="mt-2.5 space-y-1.5 bg-slate-50/90 border border-slate-200/80 rounded-xl p-2.5">
                <p className="text-[11px] text-slate-500 px-1 font-medium">
                  Nhấn để điền tài khoản hoặc bấm &quot;Thử ngay&quot; để đăng nhập trực tiếp:
                </p>
                <div className="space-y-1.5">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <div
                      key={acc.username}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/70 hover:border-blue-300 transition-colors text-xs"
                    >
                      <div
                        onClick={() => handleSelectDemoAccount(acc)}
                        className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                        title="Nhấn để điền vào form"
                      >
                        <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[14px]">{acc.icon}</span>
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-slate-800">{acc.label}</span>
                          <span className="text-slate-400 text-[11px] ml-1.5 font-mono">({acc.username})</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleQuickDemoLogin(acc)}
                        className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-[11px] shrink-0 transition-all cursor-pointer"
                      >
                        Thử ngay
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Footer Info */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-[11px] text-slate-500 font-medium">
            © 2025–2026 Trường THPT Hoa Sen • Cổng Thông Tin Quản Lý Lớp Học &amp; Học Vụ Số
          </p>
          <p className="text-[10px] text-slate-400">
            Hỗ trợ kỹ thuật: hotro@thpthoasen.edu.vn | Hotline: (028) 7300 2266
          </p>
        </div>
      </div>
    </div>
  );
}
