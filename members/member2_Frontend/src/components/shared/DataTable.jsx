/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/components/shared/DataTable.jsx
 * Vai trò: Bảng Dữ Liệu Học Vụ Tái Sử Dụng Kiểu Excel (Reusable Data Table)
 * Đặc tính kỹ thuật:
 *   - Hỗ trợ cố định cột đầu tiên (Sticky Column) khi cuộn ngang bảng nhiều cột điểm.
 *   - Áp dụng 'tabular-nums' giúp các con số thập phân căn thẳng hàng dọc chuẩn mực.
 *   - Tự động hiển thị hàng thông báo rỗng khi dữ liệu chưa có.
 *   - Hiệu ứng đổi màu hàng khi rê chuột (Hover Row Highlight).
 * ==============================================================================
 */

/**
 * Component DataTable - Hiển thị danh sách bảng ma trận
 * @component
 * @param {Object} props - Thuộc tính truyền vào
 * @param {Array<{ key: string, header: string, render?: Function, className?: string, cellClassName?: string }>} props.columns - Danh sách cấu hình cột
 * @param {Array<Object>} props.data - Mảng dữ liệu các hàng (Rows)
 * @param {boolean} [props.stickyFirstColumn=false] - Có cố định cột đầu tiên (STT / Tên học sinh) bên trái khi cuộn ngang hay không
 * @param {string} [props.emptyMessage='Không có dữ liệu'] - Thông điệp hiển thị khi mảng data rỗng
 * @returns {JSX.Element}
 */
export default function DataTable({ columns, data, stickyFirstColumn = false, emptyMessage = 'Không có dữ liệu' }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
      <table
        className="w-full border-collapse text-data-table"
        style={{ fontVariantNumeric: 'tabular-nums' }} // Bảo đảm căn thẳng hàng dọc các con số thập phân
      >
        {/* 
          1. TIÊU ĐỀ BẢNG (TABLE HEADER):
          Màu nền nhạt xám, chữ in hoa, cố định cột đầu nếu bật stickyFirstColumn
        */}
        <thead>
          <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]" style={{ height: '40px' }}>
            {columns.map((col, idx) => (
              <th
                key={col.key}
                className={[
                  'px-4 py-2.5 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider whitespace-nowrap',
                  stickyFirstColumn && idx === 0 ? 'sticky left-0 z-10 bg-[#f8fafc]' : '',
                  col.className ?? '',
                ].filter(Boolean).join(' ')}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* 
          2. THÂN BẢNG DỮ LIỆU (TABLE BODY):
          Nếu không có dữ liệu -> Hiển thị hàng thông báo rỗng căn giữa
          Nếu có dữ liệu -> Lặp qua từng hàng và gọi hàm render tương ứng
        */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-[#94a3b8] text-body-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                style={{ height: '44px' }}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key}
                    className={[
                      'px-4 py-2 text-[#1e293b] whitespace-nowrap',
                      // Cố định ô dữ liệu đầu tiên kèm nền trắng và bóng đổ ngăn nội dung phía sau lộ ra
                      stickyFirstColumn && colIdx === 0 ? 'sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : '',
                      col.cellClassName ?? '',
                    ].filter(Boolean).join(' ')}
                  >
                    {/* Nếu cột có hàm render tùy biến -> Thực thi render(value, row, index), ngược lại in giá trị thô */}
                    {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
