/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/pages/auth/LoginPage.jsx
 * Vai trò: Trang Đăng Nhập Tập Trung (Enterprise Single Sign-On Portal)
 * Kiến trúc: Clean Architecture - UI Presentation Layer
 * Tác giả: Nhóm 6 Sinh viên HSU & Võ Duy Bình (Reviewer)
 * Ngày cập nhật: 28/11/2026
 * Mô tả:
 *   - Giao diện đăng nhập chia đôi màn hình (Split-Screen) chuẩn HSU Digital Campus:
 *     + Cột trái: Logo Hoa Sen University | Beyond Boundaries, ảnh tòa nhà cơ sở
 *       hiện đại full-bleed kèm lớp phủ chuyển sắc bầu trời và dải sóng xanh-vàng.
 *     + Cột phải: Thẻ đăng nhập nổi trên nền sáng tối giản với form định danh,
 *       nút đăng nhập xanh navy và ngăn tài khoản kiểm thử 5 vai trò.
 *   - Tự động nhận diện vai trò (BGH, GVCN, GV, HS, PH) dựa trên CSDL PostgreSQL.
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
  },
  {
    role: ROLES.GVCN,
    label: 'GV Chủ Nhiệm',
    subTitle: 'Lớp 10A1',
    username: 'gvcn.10a1',
    password: '123456',
    name: 'Cô Lê Minh Châu',
    icon: 'supervisor_account',
  },
  {
    role: ROLES.GV,
    label: 'GV Bộ Môn',
    subTitle: 'Giáo Viên Toán',
    username: 'gv.an',
    password: '123456',
    name: 'Thầy Nguyễn Văn An',
    icon: 'school',
  },
  {
    role: ROLES.HS,
    label: 'Học Sinh',
    subTitle: 'Lớp 10A1',
    username: 'hs.anh',
    password: '123456',
    name: 'Em Nguyễn Thị Ánh',
    icon: 'person',
  },
  {
    role: ROLES.PH,
    label: 'Phụ Huynh',
    subTitle: 'PH Em Ánh',
    username: 'ph.hs0001',
    password: '123456',
    name: 'Chị Nguyễn Thị Hương',
    icon: 'family_restroom',
  },
];

/**
 * Biểu tượng chữ lồng thương hiệu Hoa Sen University (SVG chuẩn vector)
 * @returns {JSX.Element}
 */
function HSUWordmarkLogo() {
  return (
    <div className="inline-flex items-center gap-3.5 select-none">
      {/* Geometric Lotus / M-A Monogram */}
      <svg
        width="44"
        height="36"
        viewBox="0 0 64 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <path
          d="M6 44L20 10L32 34L44 10L58 44"
          stroke="#0A3B8E"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 44L26 22L32 34L38 22L49 44"
          stroke="#0A3B8E"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M25 44L32 29L39 44"
          stroke="#0A3B8E"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="8" r="3" fill="#0A3B8E" />
      </svg>

      <div className="leading-[1.08] tracking-tight text-[#0A3B8E]">
        <div className="text-[15px] sm:text-[16px] font-bold uppercase tracking-wide">HOA SEN</div>
        <div className="text-[15px] sm:text-[16px] font-bold uppercase tracking-wide">UNIVERSITY</div>
      </div>

      <div className="h-8 w-[1.5px] bg-[#0A3B8E]/40 mx-0.5" />

      <div className="leading-[1.15] text-[#0A3B8E]/90">
        <div className="text-[11px] font-semibold uppercase tracking-wider">BEYOND</div>
        <div className="text-[11px] font-semibold uppercase tracking-wider">BOUNDARIES</div>
      </div>
    </div>
  );
}

/**
 * Trang Đăng Nhập Tập Trung (LoginPage)
 * @returns {JSX.Element}
 */
export default function LoginPage() {
  const { isAuthenticated, role, login } = useAuth();
  const navigate = useNavigate();

  // Trạng thái dữ liệu form, hiển thị mật khẩu, lỗi xác thực và ngăn demo
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

  /**
   * Cập nhật state khi người dùng nhập liệu và xóa thông báo lỗi cũ
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  /**
   * Đăng nhập thông qua tài khoản và mật khẩu nhập vào form
   * @param {React.FormEvent} e
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
      } else if (
        err?.message?.includes('fetch') ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('NetworkError')
      ) {
        setError('Không thể kết nối đến máy chủ API (cổng 8081). Vui lòng thử lại.');
      } else {
        setError(err?.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Điền thông tin tài khoản mẫu vào form để kiểm tra thủ công
   * @param {object} account
   */
  const handleSelectDemoAccount = (account) => {
    setFormData({
      username: account.username,
      password: account.password,
    });
    setError('');
  };

  /**
   * Đăng nhập nhanh bằng 1 click từ ngăn tài khoản kiểm thử
   * @param {object} account
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row antialiased select-none font-sans text-slate-800 bg-[#f8fafd]">
      {/* ========================================================================= */}
      {/* CỘT TRÁI: HERO SHOWCASE PHONG CÁCH HSU DIGITAL CAMPUS                      */}
      {/* ========================================================================= */}
      <div className="relative w-full lg:w-[50%] min-h-[420px] lg:min-h-screen flex flex-col justify-between overflow-hidden">
        {/* Ảnh nền tòa nhà cơ sở Hoa Sen full-bleed */}
        <img
          src="/hsu-campus-bg.jpg"
          alt="Cơ sở Trường THPT Hoa Sen (HSU)"
          className="absolute inset-0 w-full h-full object-cover object-bottom"
        />

        {/* Lớp phủ sáng dịu phần trên giúp chữ và logo luôn sắc nét */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(232,242,255,0.97) 0%, rgba(235,244,255,0.88) 28%, rgba(235,244,255,0.42) 52%, rgba(255,255,255,0.0) 76%)',
          }}
        />

        {/* Phần nội dung đầu trang bên trái */}
        <div className="relative z-10 px-6 sm:px-10 lg:px-14 pt-8 sm:pt-10 lg:pt-11 pb-24 lg:pb-0 space-y-6">
          {/* Logo Hoa Sen University | Beyond Boundaries */}
          <HSUWordmarkLogo />

          {/* Pill badge + Tiêu đề chính + Mô tả */}
          <div className="space-y-3.5 pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-slate-200/80 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-700">
                TRƯỜNG THPT HOA SEN (HSU) • SMS DIGITAL PORTAL
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl xl:text-[36px] font-extrabold tracking-tight text-[#0f172a] leading-[1.18]">
              Hệ Thống Quản Lý Lớp Học &amp; Học Vụ
            </h1>

            <p className="text-sm sm:text-[15px] text-slate-700 max-w-lg leading-relaxed font-normal">
              Nền tảng chuyển đổi số giáo dục toàn diện, kết nối thông suốt giữa
              Ban Giám Hiệu, Thầy Cô, Học Sinh và Phụ Huynh.
            </p>
          </div>
        </div>

        {/* Dải sóng cong Navy & Vàng Gold ở chân cột trái */}
        <div className="relative z-10 mt-auto w-full pt-12">
          {/* SVG đường sóng cong vàng gold + nền xanh navy đậm */}
          <svg
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
            className="block w-full h-20 sm:h-24 lg:h-28 -mb-1"
            aria-hidden="true"
          >
            {/* Dải viền vàng gold chạy dọc theo mép trên đường cong */}
            <path
              d="M0,12 C380,92 920,122 1440,58 L1440,160 L0,160 Z"
              fill="#d4a024"
            />
            {/* Khối sóng xanh navy chính */}
            <path
              d="M0,26 C380,104 920,132 1440,68 L1440,160 L0,160 Z"
              fill="#0a2d6e"
            />
          </svg>

          {/* Thanh giá trị cốt lõi trên nền navy đậm */}
          <div className="bg-[#0a2d6e] px-6 sm:px-10 lg:px-12 pb-5 pt-1 text-white">
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-y-2 gap-x-5 text-xs sm:text-[13px] font-medium text-white/95">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-200">school</span>
                <span>Giáo dục chất lượng</span>
              </div>

              <span className="hidden sm:inline-block h-4 w-px bg-white/25" />

              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-200">handshake</span>
                <span>Kết nối bền vững</span>
              </div>

              <span className="hidden sm:inline-block h-4 w-px bg-white/25" />

              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-200">star</span>
                <span>Kiến tạo tương lai</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CỘT PHẢI: THẺ ĐĂNG NHẬP TẬP TRUNG TRÊN NỀN SÁNG TỐI GIẢN                   */}
      {/* ========================================================================= */}
      <div className="relative flex-1 bg-[#f6f8fc] flex flex-col justify-center items-center p-5 sm:p-8 lg:p-12 overflow-hidden">
        {/* Họa tiết đường cong nền nhạt đồng bộ thiết kế */}
        <div className="absolute -top-32 -right-32 w-[460px] h-[460px] rounded-full bg-white/70 pointer-events-none" />
        <div className="absolute -bottom-40 -left-24 w-[420px] h-[420px] rounded-full bg-blue-50/60 pointer-events-none" />

        {/* Thẻ Đăng Nhập nổi */}
        <div className="relative z-10 w-full max-w-[430px] bg-white rounded-3xl p-7 sm:p-9 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.10)] border border-slate-100 space-y-5">
          {/* Phần đầu thẻ: Logo tròn + Tên cổng */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo-hsu.svg"
                alt="THPT HSU Logo"
                className="w-10 h-10 rounded-full shadow-xs shrink-0 object-contain"
              />
              <div>
                <span className="text-[12px] font-extrabold tracking-wide uppercase text-[#0a46a8] block">
                  CỔNG ĐĂNG NHẬP HỌC VỤ
                </span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  TRƯỜNG THPT HOA SEN • DIGITAL CAMPUS
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-slate-900">
                Đăng Nhập Hệ Thống
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-500 mt-1 leading-relaxed">
                Sử dụng tài khoản định danh do nhà trường cấp để truy cập cổng thông tin.
              </p>
            </div>
          </div>

          {/* Biểu mẫu đăng nhập */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Ô nhập Tên đăng nhập */}
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
                  placeholder="Nhập tên đăng nhập, mã định danh hoặc email..."
                  className="w-full bg-white hover:border-slate-300 border border-slate-200 rounded-xl text-slate-900 pl-10 pr-3.5 py-2.5 text-sm transition-all focus:border-[#0a46a8] focus:ring-2 focus:ring-[#0a46a8]/15 focus:outline-none placeholder:text-slate-400 font-sans"
                />
              </div>
            </div>

            {/* Ô nhập Mật khẩu */}
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
                  className="w-full bg-white hover:border-slate-300 border border-slate-200 rounded-xl text-slate-900 pl-10 pr-10 py-2.5 text-sm transition-all focus:border-[#0a46a8] focus:ring-2 focus:ring-[#0a46a8]/15 focus:outline-none placeholder:text-slate-400 font-sans"
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

            {/* Ghi nhớ phiên & Quên mật khẩu */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 bg-white accent-[#0a46a8] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="font-semibold text-slate-700">Ghi nhớ phiên đăng nhập</span>
              </label>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-[#0a46a8] hover:text-[#083888] font-semibold transition-colors cursor-pointer"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Thông báo lỗi khi đăng nhập thất bại */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Nút Đăng Nhập chính */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0a46a8] hover:bg-[#083888] active:scale-[0.99] disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-[#0a46a8]/20 flex items-center justify-center gap-2 transition-all duration-200 text-sm cursor-pointer"
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

          {/* Ngăn mở rộng danh mục tài khoản kiểm thử */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowDemoAccounts((prev) => !prev)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-slate-500">help</span>
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
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/70 hover:border-[#0a46a8]/40 transition-colors text-xs"
                    >
                      <div
                        onClick={() => handleSelectDemoAccount(acc)}
                        className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                        title="Nhấn để điền vào form"
                      >
                        <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 text-[#0a46a8] flex items-center justify-center shrink-0">
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
                        className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0a46a8] font-bold text-[11px] shrink-0 transition-all cursor-pointer"
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

        {/* Thông tin chân trang */}
        <div className="relative z-10 mt-6 text-center space-y-1">
          <p className="text-[11px] text-slate-500 font-medium">
            © 2025 – 2026 Trường THPT Hoa Sen • Cổng Thông Tin Quản Lý Lớp Học &amp; Học Vụ Số
          </p>
          <p className="text-[10px] text-slate-400">
            Hỗ trợ kỹ thuật: hotro@thpthoasen.edu.vn | Hotline: (028) 7300 2266
          </p>
        </div>
      </div>
    </div>
  );
}
