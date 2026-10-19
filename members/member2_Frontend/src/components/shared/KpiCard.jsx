/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/components/shared/KpiCard.jsx
 * Vai trò: Thẻ Bố Cục Hiển Thị Chỉ Số Học Vụ (KPI Metric Card)
 * Sử dụng tại: Bảng điều khiển BGH (BGHDashboardPage), Tổng quan GV (GVDashboardPage)
 * Trực quan hóa:
 *   - Nhãn định danh chỉ số kèm biểu tượng icon Material Symbol.
 *   - Con số thống kê nổi bật (Sĩ số học sinh, Tỷ lệ chuyên cần, Điểm trung bình GPA).
 *   - Huy hiệu xu hướng biến thiên (Trend Chip) xanh/đỏ thể hiện mức độ tăng trưởng.
 * ==============================================================================
 */

/**
 * Component KpiCard - Thẻ chỉ số hiệu suất học vụ
 * @component
 * @param {Object} props - Thuộc tính truyền vào
 * @param {string} props.label - Nhãn mô tả chỉ số (ví dụ: 'Tổng sĩ số học sinh', 'Tỷ lệ chuyên cần')
 * @param {string|number} props.value - Giá trị định lượng chính (ví dụ: 45, '98.5%', 7.8)
 * @param {string} [props.icon] - Tên biểu tượng Google Material Symbol
 * @param {string} [props.trend] - Chuỗi thể hiện mức biến thiên (ví dụ: '+2.4%', '-0.5%')
 * @param {boolean} [props.trendPositive] - Xu hướng tích cực (true: xanh lá trending_up, false: đỏ trending_down)
 * @returns {JSX.Element}
 */
export default function KpiCard({ label, value, icon, trend, trendPositive }) {
  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 p-4 flex flex-col gap-3">
      {/* 
        1. HÀNG ĐỈNH: NHÃN CHỈ SỐ VÀ BIỂU TƯỢNG MINH HỌA
      */}
      <div className="flex items-center justify-between">
        <span className="text-label-sm text-[#64748b]">{label}</span>
        {icon && (
          <span
            className="material-symbols-outlined text-[20px] text-[#64748b]"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      {/* 
        2. VÙNG TRUNG TÂM: CON SỐ ĐỊNH LƯỢNG NỔI BẬT (METRIC VALUE)
      */}
      <div className="text-data-metric text-[#0f172a] font-semibold leading-none">
        {value}
      </div>

      {/* 
        3. HÀNG ĐÁY: HUY HIỆU XU HƯỚNG TĂNG/GIẢM (TREND CHIP)
        Nếu có tham số trend -> Hiển thị huy hiệu dạng con nhộng có màu xanh/đỏ tương ứng
      */}
      {trend && (
        <div className="flex items-center gap-1">
          <span
            className={`inline-flex items-center gap-0.5 text-label-sm font-medium px-2 py-0.5 rounded-full ${
              trendPositive
                ? 'bg-[#f0fdf4] text-[#16a34a]'  // Tăng trưởng tích cực: Nền xanh lá nhạt, chữ xanh đậm
                : 'bg-[#fef2f2] text-[#dc2626]'  // Suy giảm tiêu cực: Nền đỏ nhạt, chữ đỏ đậm
            }`}
          >
            <span
              className="material-symbols-outlined text-[12px]"
              aria-hidden="true"
            >
              {trendPositive ? 'trending_up' : 'trending_down'}
            </span>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
