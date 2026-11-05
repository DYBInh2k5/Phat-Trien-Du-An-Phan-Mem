/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/components/shared/Modal.jsx
 * Vai trò: Hộp Thoại Nổi Tương Tác (Accessible Modal Dialog)
 * Công nghệ: React DOM createPortal - Render trực tiếp vào document.body
 * Trợ năng & Trải nghiệm:
 *   - Lớp nền mờ (Backdrop Blur) che khuất nội dung nền.
 *   - Tự động khóa cuộn trang (Body Scroll Lock) khi mở hộp thoại.
 *   - Lắng nghe phím ESC (Escape) và nhấp chuột ra ngoài để đóng hộp thoại nhanh.
 *   - Khai báo chuẩn thuộc tính ARIA (role="dialog", aria-modal="true").
 * ==============================================================================
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Các kích thước chiều rộng cố định của hộp thoại
 */
const SIZE_CLASSES = {
  sm: 'max-w-sm', // Chiều rộng nhỏ (384px): Dành cho hộp thoại xác nhận xóa, cảnh báo
  md: 'max-w-lg', // Chiều rộng vừa (512px): Dành cho biểu mẫu nhập liệu cơ bản
  lg: 'max-w-2xl', // Chiều rộng lớn (672px): Dành cho bảng danh sách, biểu mẫu chi tiết
};

/**
 * Component Modal - Hộp thoại bật lên
 * @component
 * @param {Object} props - Thuộc tính truyền vào
 * @param {boolean} props.isOpen - Trạng thái hiển thị hộp thoại (true: mở, false: đóng)
 * @param {Function} props.onClose - Hàm gọi lại khi người dùng đóng hộp thoại
 * @param {string} props.title - Tiêu đề hiển thị ở đầu hộp thoại
 * @param {React.ReactNode} props.children - Nội dung thân hộp thoại
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Kích thước hộp thoại
 * @returns {JSX.Element|null}
 */
export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  /**
   * Hiệu ứng 1: Lắng nghe sự kiện bàn phím phím Escape để đóng hộp thoại
   */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  /**
   * Hiệu ứng 2: Khóa thanh cuộn của thẻ <body> khi modal mở nhằm tránh cuộn kép
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Nếu modal không ở trạng thái mở -> Không render gì cả
  if (!isOpen) return null;

  // Sử dụng createPortal để gắn trực tiếp Modal vào document.body tránh bị giới hạn z-index bởi Component cha
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* 
        1. LỚP PHỦ NỀN MỜ (BACKDROP):
        Màu tối bán trong suốt kèm hiệu ứng kính mờ (backdrop-filter: blur(4px)).
        Nhấp chuột vào lớp nền này sẽ kích hoạt đóng hộp thoại.
      */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(15,23,42,0.4)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 
        2. BẢNG NỘI DUNG HỘP THOẠI (MODAL PANEL):
        Nằm ở giữa màn hình, có bóng đổ nổi, giới hạn chiều cao tối đa 90vh
      */}
      <div
        className={`relative bg-white rounded-lg w-full ${SIZE_CLASSES[size]} shadow-elevation-3 flex flex-col max-h-[90vh]`}
      >
        {/* Phần tiêu đề hộp thoại kèm nút 'X' đóng */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <h2 className="text-headline-sm font-semibold text-[#0f172a]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Thân nội dung có thể cuộn dọc nếu vượt quá chiều cao */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
