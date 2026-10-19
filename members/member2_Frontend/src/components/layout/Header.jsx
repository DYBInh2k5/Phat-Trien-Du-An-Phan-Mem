/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/components/layout/Header.jsx
 * Vai trò: Thanh Tiêu Đề Đỉnh Trang (Top Navigation Header)
 * Quản lý phiên: Đồng bộ danh tính người dùng từ AuthContext
 * Mô tả:
 *   - Hiển thị tiêu đề của trang hiện hành (truyền từ MainLayout).
 *   - Hiển thị chỉ báo niên khóa và học kỳ học vụ đang áp dụng.
 *   - Hiển thị Avatar ký tự đầu, họ tên và huy hiệu vai trò (Role Badge) có màu đặc trưng.
 *   - Cung cấp nút Đăng xuất nhanh điều hướng về trang đăng nhập.
 *   - Ẩn hoàn toàn khi in ấn thông qua lớp CSS 'print:hidden'.
 * ==============================================================================
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../constants/routes.js';

/**
 * Từ điển chuyển đổi mã vai trò kỹ thuật sang danh xưng tiếng Việt chuẩn mực.
 */
const ROLE_LABELS = {
  GV: 'Giáo viên Bộ môn',
  GVCN: 'Giáo viên Chủ nhiệm',
  BGH: 'Ban Giám Hiệu',
  PH: 'Phụ huynh Học sinh',
  HS: 'Học sinh',
};

/**
 * Bảng màu huy hiệu vai trò (Role Badge Styles) tuân thủ tiêu chuẩn tương phản WCAG 2.1 AA.
 * Mỗi vai trò có cặp màu nền / chữ / viền riêng biệt để dễ nhận biết trực quan.
 */
const ROLE_BADGE_STYLES = {
  GV:   'bg-[#eff4ff] text-[#004ac6] border-[#bfdbfe]',   // Xanh dương: GVBM
  GVCN: 'bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]',   // Tím tím: GVCN
  BGH:  'bg-[#fff7ed] text-[#c2410c] border-[#ffedd5]',   // Cam ấm: Ban Giám Hiệu
  PH:   'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]',   // Xanh lá: Phụ huynh
  HS:   'bg-[#f8fafc] text-[#334155] border-[#e2e8f0]',   // Xám đen: Học sinh
};

/**
 * Component Header - Thanh công cụ đỉnh trang
 * @component
 * @param {Object} props - Thuộc tính truyền vào
 * @param {string} props.title - Tiêu đề của trang hiện hành
 * @returns {JSX.Element}
 */
export default function Header({ title }) {
  // Trích xuất thông tin người dùng và hàm đăng xuất từ AuthContext
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Xử lý đăng xuất:
   * 1. Xóa thông tin phiên trong Context và localStorage.
   * 2. Điều hướng người dùng về trang Đăng nhập (/login) với tùy chọn replace để ngăn bấm nút Back.
   */
  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  // Xác định kiểu dáng màu sắc cho huy hiệu vai trò (nếu không khớp lấy mặc định)
  const badgeStyle = ROLE_BADGE_STYLES[role] || 'bg-[#f1f5f9] text-[#334155] border-[#e2e8f0]';

  return (
    <header className="print:hidden h-16 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 shrink-0 z-30">
      {/* 
        1. VÙNG BÊN TRÁI: TIÊU ĐỀ TRANG ĐANG XỬ LÝ
      */}
      <div className="flex items-center gap-3">
        <h1 className="text-body-md font-bold text-[#0f172a] truncate">
          {title ?? 'CỔNG THÔNG TIN HỌC VỤ — THPT HSU'}
        </h1>
      </div>

      {/* 
        2. VÙNG BÊN PHẢI: CHỈ BÁO NIÊN KHÓA + THÔNG TIN TÀI KHOẢN + ĐĂNG XUẤT
      */}
      <div className="flex items-center gap-4">
        {/* Chỉ báo thời gian học kỳ học vụ (ẩn trên màn hình nhỏ di động) */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-label-sm text-[#475569]">
          <span className="material-symbols-outlined text-[16px] text-[#004ac6]">date_range</span>
          <span>Học kỳ I (2024–2025)</span>
        </div>

        {/* Khối hồ sơ người dùng: Ảnh Avatar đại diện + Tên + Huy hiệu vai trò */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#e2e8f0]">
          {/* Avatar tròn với chữ cái đầu viết hoa */}
          <div className="w-8 h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex flex-col">
            {/* Tên người dùng */}
            <span className="text-label-md font-semibold text-[#0f172a] leading-tight truncate max-w-[140px]">
              {user?.name ?? 'Người dùng'}
            </span>
            {/* Huy hiệu vai trò có viền và màu theo định nghĩa */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${badgeStyle} mt-0.5`}>
              {ROLE_LABELS[role] ?? role}
            </span>
          </div>
        </div>

        {/* Nút Đăng xuất */}
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
