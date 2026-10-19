/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/components/shared/StatusBadge.jsx
 * Vai trò: Huy Hiệu Trạng Thái Thống Nhất (Standardized Status Badge)
 * Mục đích: Chuẩn hóa màu sắc và nhãn trạng thái học vụ trên toàn bộ hệ thống
 * Các nghiệp vụ sử dụng:
 *   - Trạng thái chuyên cần: Có mặt (present), Đi trễ (late), Vắng (absent).
 *   - Trạng thái hồ sơ học sinh: Đang học (active), Nghỉ học (inactive), Bảo lưu (reserved).
 *   - Trạng thái đơn xin phép & Sổ liên lạc: Đã gửi (sent), Đã đọc (read), Chờ duyệt (pending).
 * ==============================================================================
 */

/**
 * Bảng màu định dạng huy hiệu tuân thủ độ tương phản WCAG 2.1 AA
 */
const STATUS_STYLES = {
  present:  'bg-[#f0fdf4] text-[#15803d]',  // Xanh lá: Có mặt
  late:     'bg-[#fff7ed] text-[#c2410c]',  // Cam: Đi trễ
  absent:   'bg-[#fef2f2] text-[#b91c1c]',  // Đỏ: Vắng mặt
  active:   'bg-[#f0fdf4] text-[#15803d]',  // Xanh lá: Đang học
  inactive: 'bg-[#fef2f2] text-[#b91c1c]',  // Đỏ: Đã thôi học
  reserved: 'bg-[#fff7ed] text-[#c2410c]',  // Cam: Bảo lưu kết quả
  sent:     'bg-[#eff4ff] text-[#2563eb]',  // Xanh dương: Đã gửi
  read:     'bg-[#f1f5f9] text-[#334155]',  // Xám: Đã xem
  pending:  'bg-[#fff7ed] text-[#c2410c]',  // Cam: Chờ xử lý / Chưa duyệt
};

/**
 * Từ điển chuyển dịch mã trạng thái sang văn bản tiếng Việt hiển thị
 */
const STATUS_LABELS_VI = {
  present:  'Có mặt',
  late:     'Đi trễ',
  absent:   'Vắng',
  active:   'Đang học',
  inactive: 'Nghỉ học',
  reserved: 'Bảo lưu',
  sent:     'Đã gửi',
  read:     'Đã đọc',
  pending:  'Chờ xử lý',
};

/**
 * Component StatusBadge - Huy hiệu trạng thái
 * @component
 * @param {Object} props - Thuộc tính truyền vào
 * @param {string} props.status - Mã trạng thái kỹ thuật (present, late, absent, active, pending, ...)
 * @param {string} [props.label] - Nhãn hiển thị tùy biến (nếu không truyền sẽ tra cứu theo từ điển tiếng Việt)
 * @returns {JSX.Element}
 */
export default function StatusBadge({ status, label }) {
  // Xác định lớp CSS màu sắc (nếu mã lạ sẽ lấy màu xám mặc định)
  const styles = STATUS_STYLES[status] ?? 'bg-[#f1f5f9] text-[#334155]';
  // Xác định chữ hiển thị
  const displayLabel = label ?? STATUS_LABELS_VI[status] ?? status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium ${styles}`}
      style={{ height: '22px', lineHeight: '22px' }}
    >
      {displayLabel}
    </span>
  );
}
