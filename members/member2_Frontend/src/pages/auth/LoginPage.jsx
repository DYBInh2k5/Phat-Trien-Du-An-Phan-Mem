import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { ROLE_DASHBOARD } from '../../constants/routes.js';

const ROLE_CONFIGS = [
  {
    role: ROLES.BGH,
    label: '1. Ban Giám Hiệu',
    subTitle: 'System Administrator / Principal',
    icon: 'admin_panel_settings',
    badgeColor: 'bg-[#fff7ed] text-[#c2410c] border-[#ffedd5]',
    username: 'bgh.admin',
    desc: 'Quản trị hệ thống, quản lý tài khoản, duyệt khóa/mở sổ điểm toàn trường, phân công giảng dạy & xem báo cáo tổng hợp.',
  },
  {
    role: ROLES.GVCN,
    label: '2. GV Chủ Nhiệm',
    subTitle: 'Form Teacher / Homeroom Leader',
    icon: 'supervisor_account',
    badgeColor: 'bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]',
    username: 'gvcn.10a1',
    desc: 'Điểm danh chuyên cần hàng ngày cho lớp 10A1, đánh giá Hạnh kiểm học kỳ, duyệt đơn xin nghỉ học & nhắn tin với Phụ huynh.',
  },
  {
    role: ROLES.GV,
    label: '3. GV Bộ Môn',
    subTitle: 'Subject Teacher',
    icon: 'school',
    badgeColor: 'bg-[#eff4ff] text-[#004ac6] border-[#bfdbfe]',
    username: 'gv.toan',
    desc: 'Điểm danh theo tiết học phụ trách, nhập điểm thành phần (Miệng, 15p, 1 tiết, GK, CK), tự động tính TBM & gửi yêu cầu phúc khảo.',
  },
  {
    role: ROLES.HS,
    label: '4. Học Sinh',
    subTitle: 'Student Portal',
    icon: 'person',
    badgeColor: 'bg-[#f8fafc] text-[#334155] border-[#e2e8f0]',
    username: 'hs0001',
    desc: 'Tra cứu kết quả học tập cá nhân, GPA hệ 10 và 4, xem thời khóa biểu, lịch kiểm tra/thi & nhật ký chuyên cần.',
  },
  {
    role: ROLES.PH,
    label: '5. Phụ Huynh',
    subTitle: 'Parent Portal & Sổ Liên Lạc',
    icon: 'family_restroom',
    badgeColor: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]',
    username: 'ph.hs0001',
    desc: 'Sổ liên lạc điện tử con em, nhận thông báo vắng học tức thời, nộp đơn xin nghỉ học trực tuyến, tra cứu & đóng học phí kèm biên lai PDF.',
  },
];

export default function LoginPage() {
  const { isAuthenticated, role, login } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole]   = useState(ROLES.BGH);
  const [formData, setFormData]       = useState({ username: 'bgh.admin', password: '123' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');
  const [isLoading, setIsLoading]     = useState(false);

  if (isAuthenticated) {
    return <Navigate to={ROLE_DASHBOARD[role]} replace />;
  }

  const activeConfig = ROLE_CONFIGS.find(t => t.role === activeRole) || ROLE_CONFIGS[0];

  const handleRoleSelect = (selectedRole) => {
    setActiveRole(selectedRole);
    const cfg = ROLE_CONFIGS.find(t => t.role === selectedRole);
    setFormData({ username: cfg?.username || '', password: '123' });
    setError('');
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleLoginExecute = async (targetRole, usernameVal, passwordVal) => {
    setIsLoading(true);
    setError('');
    try {
      await login({ username: usernameVal, password: passwordVal, role: targetRole });
      navigate(ROLE_DASHBOARD[targetRole], { replace: true });
    } catch {
      setError('Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLoginExecute(activeRole, formData.username, formData.password);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-[#e2e8f0] px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#004ac6] flex items-center justify-center text-white font-bold shadow-xs">
            <span className="material-symbols-outlined text-[24px]">school</span>
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-[#0f172a] text-body-md uppercase">
              TRƯỜNG THPT HSU — HỆ THỐNG QUẢN LÝ DẠY HỌC &amp; HỌC VỤ
            </h1>
            <p className="text-label-sm text-[#64748b]">Cổng Thông Tin 5 Vai Trò Phân Quyền (School Management System - SMS)</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-label-sm text-[#475569] bg-[#f1f5f9] px-3 py-1.5 rounded-lg border border-[#e2e8f0]">
          <span className="material-symbols-outlined text-[16px] text-[#004ac6]">verified</span>
          <span>Năm học 2024–2025</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center gap-6">
        
        {/* Step 1: 5 Distinct Role Selector Bar */}
        <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-xs p-4">
          <p className="text-label-sm font-semibold text-[#475569] uppercase tracking-wider mb-3">
            Chọn Vai Trò Đăng Nhập (5 Actors SRS):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {ROLE_CONFIGS.map((cfg) => {
              const isActive = activeRole === cfg.role;
              return (
                <button
                  key={cfg.role}
                  type="button"
                  onClick={() => handleRoleSelect(cfg.role)}
                  className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all relative ${
                    isActive
                      ? 'bg-[#eff4ff] border-[#004ac6] ring-2 ring-[#004ac6]/15 shadow-xs'
                      : 'bg-white border-[#e2e8f0] hover:bg-[#f8fafc] hover:border-[#cbd5e1]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className={`p-1.5 rounded-md ${isActive ? 'bg-[#004ac6] text-white' : 'bg-[#f1f5f9] text-[#475569]'}`}>
                      <span className="material-symbols-outlined text-[18px]">{cfg.icon}</span>
                    </span>
                    {isActive && (
                      <span className="material-symbols-outlined text-[18px] text-[#004ac6]">check_circle</span>
                    )}
                  </div>
                  <span className={`text-body-sm font-bold truncate w-full ${isActive ? 'text-[#004ac6]' : 'text-[#0f172a]'}`}>
                    {cfg.label}
                  </span>
                  <span className="text-[11px] text-[#64748b] truncate w-full mt-0.5">
                    {cfg.subTitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Login Form & Role Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Role Info & Responsibilities */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-[#cbd5e1] shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#f1f5f9]">
              <div className="w-12 h-12 rounded-xl bg-[#eff4ff] border border-[#bfdbfe] flex items-center justify-center text-[#004ac6]">
                <span className="material-symbols-outlined text-[28px]">{activeConfig.icon}</span>
              </div>
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-label-sm font-medium border ${activeConfig.badgeColor}`}>
                  Mã vai trò: ROLE_{activeConfig.role}
                </span>
                <h2 className="text-headline-sm font-bold text-[#0f172a] mt-0.5">
                  {activeConfig.label}
                </h2>
              </div>
            </div>

            <p className="text-body-sm text-[#334155] leading-relaxed">
              {activeConfig.desc}
            </p>

            <div className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0] space-y-2">
              <p className="text-label-sm font-semibold text-[#0f172a]">Thông tin Tài khoản Trải nghiệm Nhanh:</p>
              <div className="flex items-center justify-between text-body-sm text-[#475569]">
                <span>Tên đăng nhập: <strong className="text-[#004ac6] font-mono">{activeConfig.username}</strong></span>
                <span>Mật khẩu: <strong className="text-[#004ac6] font-mono">123</strong></span>
              </div>
              <button
                type="button"
                onClick={() => handleLoginExecute(activeConfig.role, activeConfig.username, '123')}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#15803d] border border-[#86efac] text-body-sm font-semibold transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                Đăng Nhập Nhanh Vai Trò {activeConfig.label}
              </button>
            </div>
          </div>

          {/* Right: Login Form */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-[#cbd5e1] shadow-xs p-6">
            <h3 className="text-body-md font-bold text-[#0f172a] mb-4 pb-2 border-b border-[#f1f5f9] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#004ac6]">lock</span>
              Form Xác Thực Đăng Nhập
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label htmlFor="username" className="block text-label-sm font-semibold text-[#334155]">
                  Tên đăng nhập / Mã định danh <span className="text-[#dc2626]">*</span>
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
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Nhập tên đăng nhập"
                    className="w-full bg-white border border-[#cbd5e1] rounded-lg text-[#0f172a] pl-10 pr-3 py-2 text-body-sm transition-all focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
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
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu"
                    className="w-full bg-white border border-[#cbd5e1] rounded-lg text-[#0f172a] pl-10 pr-10 py-2 text-body-sm transition-all focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-2.5 px-1 py-1 text-[#94a3b8] hover:text-[#334155] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 bg-[#fef2f2] border border-[#fca5a5] rounded-lg text-[#b91c1c] text-body-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#004ac6] hover:bg-[#003ea8] active:scale-[0.99] disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-lg shadow-xs flex items-center justify-center gap-2 transition-all text-body-md"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    Đăng Nhập Vai Trò {activeConfig.label}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#e2e8f0] bg-white py-3.5 px-6 text-center text-label-sm text-[#64748b]">
        Trường THPT HSU — Hệ thống Quản lý Trường học (SMS) Phân Quyền 5 Roles © 2024.
      </footer>
    </div>
  );
}
