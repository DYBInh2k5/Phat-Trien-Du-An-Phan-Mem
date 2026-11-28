import * as XLSX from 'xlsx';

/**
 * UC-PAR-09: Export tuition receipt as a formatted print PDF / A4 layout.
 * Opens a styled print window with receipt layout, watermark, and signature boxes.
 *
 * @param {{ studentCode: string, studentName: string, className: string, receiptNo?: string, paidAt?: string }} studentInfo
 * @param {Array<{ id: string, name: string, amount: number, status: string }>} paidItems - already filtered to status='paid'
 * @returns {boolean}
 */
export function exportTuitionReceiptPDF(studentInfo, paidItems = []) {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Vui lòng cho phép mở Cửa sổ Bật lên (Pop-up) trên trình duyệt để xuất PDF/In biên lai.');
      return false;
    }

    const today = new Date();
    const dateStr = studentInfo.paidAt ? new Date(studentInfo.paidAt).toLocaleDateString('vi-VN') : today.toLocaleDateString('vi-VN');
    const receiptNo = studentInfo.receiptNo
      ?? `BL-${(studentInfo.studentCode ?? 'HS').toUpperCase()}-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    const totalPaid = paidItems.reduce((sum, item) => sum + (item.amount ?? 0), 0);

    const itemsHtml = paidItems.map((item, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}">
        <td style="border:1px solid #e2e8f0;padding:10px 12px;text-align:center;color:#64748b">${idx + 1}</td>
        <td style="border:1px solid #e2e8f0;padding:10px 12px;color:#0f172a;font-weight:600">${item.name}</td>
        <td style="border:1px solid #e2e8f0;padding:10px 12px;text-align:right;font-weight:700;color:#004ac6">${(item.amount ?? 0).toLocaleString('vi-VN')} đ</td>
        <td style="border:1px solid #e2e8f0;padding:10px 12px;text-align:center">
          <span style="display:inline-block;padding:3px 10px;border-radius:9999px;background:#f0fdf4;color:#15803d;font-size:12px;font-weight:700;border:1px solid #86efac">ĐÃ THANH TOÁN</span>
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Bien_Lai_Hoc_Phi_${receiptNo}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 24px; color: #0f172a; position: relative; }
          .watermark {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-30deg);
            font-size: 80px; font-weight: 900; color: rgba(21,128,61,0.08); white-space: nowrap;
            pointer-events: none; z-index: 0; letter-spacing: 6px;
          }
          .content { position: relative; z-index: 1; }
          .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #004ac6; }
          .school-name { font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 1px; }
          .receipt-title { font-size: 24px; font-weight: 800; color: #004ac6; text-transform: uppercase; margin: 8px 0 4px; }
          .receipt-meta { font-size: 13px; color: #64748b; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; margin: 20px 0; padding: 16px 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13.5px; }
          .info-grid .label { color: #64748b; }
          .info-grid .value { color: #0f172a; font-weight: 700; }
          table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin-top: 10px; }
          .total-row td { background: #eff4ff; font-weight: 700; font-size: 15px; color: #004ac6; border-top: 2px solid #004ac6; }
          .signatures { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; font-size: 13.5px; page-break-inside: avoid; }
          .sig-box { width: 220px; }
          .sig-title { font-weight: 700; color: #0f172a; margin-bottom: 60px; }
          .sig-note { color: #64748b; font-style: italic; font-size: 12px; }
          .print-btn { position: fixed; bottom: 20px; right: 20px; padding: 10px 20px; background: #004ac6; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          @media print {
            body { margin: 0; }
            .print-btn { display: none; }
            .watermark { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="watermark">ĐÃ THANH TOÁN</div>
        <button class="print-btn" onclick="window.print()">In hoặc Lưu PDF (Ctrl+P)</button>
        <div class="content">
          <div class="header">
            <div class="school-name">Sở Giáo Dục và Đào Tạo — Trường THPT HSU</div>
            <div class="receipt-title">Biên Lai Thu Học Phí Điện Tử</div>
            <div class="receipt-meta">Hệ thống Quản lý Học vụ HTQLLH · Chuẩn VietQR NAPAS</div>
          </div>

          <div class="info-grid">
            <div><span class="label">Mã biên lai: </span><span class="value" style="color:#004ac6">${receiptNo}</span></div>
            <div><span class="label">Ngày thanh toán: </span><span class="value">${dateStr}</span></div>
            <div><span class="label">Họ tên học sinh: </span><span class="value">${studentInfo.studentName ?? '—'}</span></div>
            <div><span class="label">Mã học sinh: </span><span class="value">${studentInfo.studentCode ?? '—'}</span></div>
            <div><span class="label">Lớp học: </span><span class="value">${studentInfo.className ?? '—'}</span></div>
            <div><span class="label">Trạng thái đối soát: </span><span class="value" style="color:#15803d">Hợp lệ (Đã thanh toán)</span></div>
          </div>

          <table>
            <thead>
              <tr style="background:#f1f5f9">
                <th style="border:1px solid #cbd5e1;padding:10px 12px;text-align:center;color:#475569;font-weight:700;width:50px">STT</th>
                <th style="border:1px solid #cbd5e1;padding:10px 12px;text-align:left;color:#475569;font-weight:700">Khoản Thu / Nội Dung Học Phí</th>
                <th style="border:1px solid #cbd5e1;padding:10px 12px;text-align:right;color:#475569;font-weight:700;width:170px">Số Tiền (VNĐ)</th>
                <th style="border:1px solid #cbd5e1;padding:10px 12px;text-align:center;color:#475569;font-weight:700;width:150px">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml.length > 0 ? itemsHtml : '<tr><td colspan="4" style="padding:16px;text-align:center;color:#94a3b8">Không có khoản thu đã thanh toán.</td></tr>'}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2" style="border:1px solid #cbd5e1;padding:12px;text-align:right">Tổng Tiền Đã Thanh Toán:</td>
                <td style="border:1px solid #cbd5e1;padding:12px;text-align:right">${totalPaid.toLocaleString('vi-VN')} đ</td>
                <td style="border:1px solid #cbd5e1;padding:12px;text-align:center;color:#15803d">Hoàn tất</td>
              </tr>
            </tfoot>
          </table>

          <div class="signatures">
            <div class="sig-box">
              <div class="sig-title">Phụ Huynh / Học Sinh</div>
              <div class="sig-note">(Đã ký điện tử)</div>
            </div>
            <div class="sig-box">
              <div class="sig-title">Thủ Quỹ / Kế Toán Nhà Trường</div>
              <div class="sig-note">(Đã đối soát & xác thực)</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    return true;
  } catch (err) {
    console.error('Lỗi khi xuất biên lai PDF:', err);
    alert('Không thể mở tài liệu biên lai PDF để in.');
    return false;
  }
}

/**
 * Utility to export tabular data to a real Excel (.xlsx) file using SheetJS
 * @param {string} filename - Desired file name (without or with extension)
 * @param {string} sheetName - Name of the worksheet
 * @param {Array<string>} headers - Header columns array
 * @param {Array<Array<any>>} rows - Data rows array
 */
export function exportToExcel(filename = 'Bang_Diem_HTQLLH', sheetName = 'Danh Sách', headers = [], rows = []) {
  try {
    const sheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    
    // Auto-fit column widths
    const colWidths = headers.map((h, i) => {
      let maxLen = String(h).length;
      rows.forEach(r => {
        if (r[i] !== undefined && r[i] !== null) {
          maxLen = Math.max(maxLen, String(r[i]).length);
        }
      });
      return { wch: Math.min(Math.max(maxLen + 4, 10), 40) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const safeName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    XLSX.writeFile(workbook, safeName);
    return true;
  } catch (err) {
    console.error('Lỗi khi xuất file Excel:', err);
    alert('Không thể xuất file Excel. Vui lòng kiểm tra lại dữ liệu.');
    return false;
  }
}

/**
 * Utility to export formatted PDF / Print Document
 * @param {string} title - Report main title
 * @param {string} subtitle - Secondary description / Class / Semester
 * @param {Array<string>} headers - Header columns
 * @param {Array<Array<any>>} rows - Table rows
 */
export function exportToPDF(title = 'BÁO CÁO TỔNG HỢP', subtitle = 'Trường THPT HSU - HTQLLH', headers = [], rows = []) {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Vui lòng cho phép mở Cửa sổ Bật lên (Pop-up) trên trình duyệt để xuất PDF/In báo cáo.');
      return false;
    }

    const headersHtml = headers.map(h => `<th style="border: 1px solid #cbd5e1; padding: 8px 12px; background-color: #f1f5f9; color: #0f172a; font-weight: 600; text-align: center;">${h}</th>`).join('');
    const rowsHtml = rows.map((r, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const cells = r.map(c => `<td style="border: 1px solid #e2e8f0; padding: 8px 12px; text-align: center; color: #334155;">${c ?? '—'}</td>`).join('');
      return `<tr style="background-color: ${bg};">${cells}</tr>`;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 24px; color: #0f172a; }
          .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #004ac6; padding-bottom: 12px; }
          .header h1 { margin: 0 0 6px 0; font-size: 22px; color: #004ac6; text-transform: uppercase; }
          .header p { margin: 0; font-size: 14px; color: #64748b; }
          .meta { display: flex; justify-space-between; margin-bottom: 16px; font-size: 13px; color: #475569; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; text-align: center; font-size: 13px; }
          .signature-box { width: 200px; }
          .signature-title { font-weight: 600; margin-bottom: 60px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SỞ GIÁO DỤC VÀ ĐÀO TẠO - TRƯỜNG THPT HSU</h1>
          <p style="font-weight: 600; font-size: 16px; color: #0f172a; margin-top: 8px;">${title}</p>
          <p>${subtitle}</p>
        </div>
        <div class="meta">
          <div><strong>Hệ thống:</strong> HTQLLH</div>
          <div><strong>Ngày xuất:</strong> ${new Date().toLocaleDateString('vi-VN')}</div>
        </div>
        <table>
          <thead>
            <tr>${headersHtml}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="footer">
          <div class="signature-box">
            <div class="signature-title">NGƯỜI LẬP BÁO CÁO</div>
            <div>(Ký và ghi rõ họ tên)</div>
          </div>
          <div class="signature-box">
            <div class="signature-title">XÁC NHẬN BAN GIÁM HIỆU</div>
            <div>(Ký tên và đóng dấu)</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    return true;
  } catch (err) {
    console.error('Lỗi khi xuất file PDF:', err);
    alert('Không thể mở tài liệu PDF để in.');
    return false;
  }
}

// ── Student Excel Export / Import Template (UC-QLHS) ─────────────────────────

/**
 * Xuất danh sách học sinh ra file Excel (.xlsx) có định dạng.
 * Sử dụng thư viện SheetJS (xlsx) để tạo workbook, sheet và tự động điều chỉnh độ rộng cột.
 *
 * @param {Array<{ id, name, className, gender, dob, parentName, parentPhone, gpa, academicRank, conductRank, status }>} students
 *        Danh sách học sinh đã được chuẩn hóa từ fetchStudentListData
 * @param {Object} [meta] - Thông tin phụ đề của file xuất
 * @param {string} [meta.className] - Lớp đang lọc (nếu có)
 * @returns {boolean} true nếu xuất thành công
 */
export function exportStudentsToExcel(students = [], meta = {}) {
  try {
    // 1. Chuẩn bị dữ liệu từng dòng (row) theo thứ tự cột hiển thị
    const rows = students.map((s, idx) => ({
      'STT': idx + 1,
      'Mã học sinh': s.id ?? '',
      'Họ và tên': s.name ?? '',
      'Giới tính': s.gender ?? '',
      'Ngày sinh': s.dob ?? '',
      'Lớp': s.className ?? '',
      'Họ tên phụ huynh': s.parentName ?? '',
      'SĐT phụ huynh': s.parentPhone ?? '',
      'GPA': s.gpa ?? '',
      'Học lực': s.academicRank ?? '',
      'Hạnh kiểm': s.conductRank ?? '',
      'Trạng thái': s.status === 'active' ? 'Đang học' : 'Nghỉ học',
    }));

    // 2. Tạo worksheet từ mảng object keys
    const ws = XLSX.utils.json_to_sheet(rows);

    // 3. Tự động thiết lập độ rộng cột dựa trên nội dung dài nhất
    ws['!cols'] = Object.keys(rows[0] || { 'STT': '' }).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...rows.map((r) => String(r[key] ?? '').length),
      );
      return { wch: Math.min(Math.max(maxLen + 2, 8), 32) };
    });

    // 4. Tạo workbook và thêm worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách học sinh');

    // 5. Tạo tên file có dấu thời gian + bộ lọc lớp (nếu có)
    const now = new Date();
    const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const suffix = meta.className && meta.className !== 'all' ? `_${meta.className}` : '';
    const filename = `DanhSachHocSinh${suffix}_${ts}.xlsx`;

    // 6. Ghi file và kích hoạt tải xuống trình duyệt
    XLSX.writeFile(wb, filename);
    return true;
  } catch (err) {
    console.error('Lỗi khi xuất Excel danh sách học sinh:', err);
    alert('Không thể xuất file Excel. Vui lòng thử lại.');
    return false;
  }
}

/**
 * Tải file Excel mẫu (.xlsx) dùng cho việc import học sinh.
 * File mẫu chứa 2 sheet:
 *   - "HuongDan": hướng dẫn điền dữ liệu và quy tắc bắt buộc
 *   - "DuLieuMau": bảng dữ liệu mẫu đúng cú pháp để người dùng copy/sửa
 *
 * @returns {boolean} true nếu tải thành công
 */
export function downloadStudentImportTemplate() {
  try {
    // Sheet 1: Hướng dẫn
    const guideRows = [
      { 'A': 'HƯỚNG DẪN ĐIỀN DỮ LIỆU IMPORT HỌC SINH' },
      { 'A': '' },
      { 'A': '1. Chỉ điền dữ liệu vào sheet "DuLieuMau", bắt đầu từ dòng 1 (không thêm tiêu đề trang).' },
      { 'A': '2. Các cột bắt buộc: MaHocSinh, HoTen, Lop, GioiTinh. Cột khác có thể để trống.' },
      { 'A': '3. Định dạng cột: MaHocSinh (VD: HS001), HoTen (text), Lop (VD: 10A1), GioiTinh (Nam/Nữ),' },
      { 'A': '   NgaySinh (YYYY-MM-DD), HoTenPhuHuynh, SDTPhuHuynh, TrangThai (DangHoc/NghiHoc).' },
      { 'A': '4. Mã học sinh phải là duy nhất, chưa tồn tại trong hệ thống.' },
      { 'A': '5. Lớp phải là tên lớp hợp lệ đã có trong hệ thống (ví dụ: 10A1, 11B2, 12A3).' },
      { 'A': '6. Ngày sinh phải đúng định dạng YYYY-MM-DD (VD: 2008-05-15).' },
      { 'A': '7. Sau khi điền xong, lưu file và tải lên bằng nút "Import từ Excel".' },
      { 'A': '8. Hệ thống sẽ bỏ qua các dòng thiếu trường bắt buộc và hiển thị cảnh báo.' },
    ];
    const wsGuide = XLSX.utils.json_to_sheet(guideRows, { skipHeader: true });
    wsGuide['!cols'] = [{ wch: 110 }];

    // Sheet 2: Dữ liệu mẫu (2 dòng mẫu đúng cú pháp)
    const sampleRows = [
      {
        'MaHocSinh': 'HS001',
        'HoTen': 'Nguyễn Văn An',
        'Lop': '10A1',
        'GioiTinh': 'Nam',
        'NgaySinh': '2008-05-15',
        'HoTenPhuHuynh': 'Nguyễn Văn Bình',
        'SDTPhuHuynh': '0912345678',
        'TrangThai': 'DangHoc',
      },
      {
        'MaHocSinh': 'HS002',
        'HoTen': 'Trần Thị Bích',
        'Lop': '10A1',
        'GioiTinh': 'Nữ',
        'NgaySinh': '2008-09-20',
        'HoTenPhuHuynh': 'Trần Văn Cường',
        'SDTPhuHuynh': '0987654321',
        'TrangThai': 'DangHoc',
      },
    ];
    const wsData = XLSX.utils.json_to_sheet(sampleRows);
    wsData['!cols'] = [
      { wch: 12 }, { wch: 22 }, { wch: 8 }, { wch: 10 }, { wch: 12 },
      { wch: 22 }, { wch: 14 }, { wch: 12 },
    ];

    // Gộp 2 sheet vào workbook và tải về
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsGuide, 'HuongDan');
    XLSX.utils.book_append_sheet(wb, wsData, 'DuLieuMau');
    XLSX.writeFile(wb, 'Mau_Import_HocSinh.xlsx');
    return true;
  } catch (err) {
    console.error('Lỗi khi tạo file mẫu import:', err);
    alert('Không thể tạo file mẫu. Vui lòng thử lại.');
    return false;
  }
}

/**
 * Chuẩn hóa chuỗi để so sánh tên cột Excel một cách linh hoạt:
 *   - Chuyển về chữ thường
 *   - Bỏ dấu tiếng Việt (NFD + loại tổ hợp dấu)
 *   - Xóa toàn bộ khoảng trắng, gạch dưới, gạch ngang, BOM (ký tự ẩn đầu dòng)
 *
 * Ví dụ: "Mã Học Sinh" → "mahocsinh", "MaHocSinh" → "mahocsinh"
 *
 * @param {string} str - Chuỗi đầu vào
 * @returns {string} Chuỗi đã chuẩn hóa
 */
function normalizeKey(str) {
  return String(str)
    .normalize('NFD')                        // tách ký tự + dấu tổ hợp
    .replace(/[\u0300-\u036f]/g, '')         // bỏ dấu tổ hợp (sắc, huyền, hỏi, ngã, nặng,...)
    .replace(/đ/gi, 'd')                     // đ/Đ → d
    .toLowerCase()
    .replace(/[\s\-_\u00ad\ufeff\u200b]/g, ''); // bỏ space, gạch ngang/dưới, BOM, ký tự ẩn
}

/**
 * Bảng ánh xạ tên cột Excel → tên field backend.
 * Mỗi field gồm nhiều alias (tên cột phổ biến người dùng hay đặt),
 * tất cả đều đã được normalize qua normalizeKey.
 * Thêm alias vào đây nếu muốn hỗ trợ thêm biến thể tên cột.
 */
const COLUMN_ALIASES = {
  // Thứ tự khai báo quan trọng: parentName PHẢI đứng trước fullName
  // để 'hotenphuhu ynh' không bị nhầm sang fullName khi so sánh prefix.
  studentCode: ['mahocsinh', 'masohocsinh', 'mahoc', 'maso', 'studentcode', 'ma', 'id'],
  parentName:  ['hotenphuhu ynh', 'hotenphuhu', 'hotenchame', 'tengd', 'phuhuynh', 'hotenphhuynh', 'parentname', 'hotenphhuyennh', 'tengiamdiem'],
  parentPhone: ['sdtphuhuynh', 'sdtph', 'sodienthoaiphuhuynh', 'sodienthoai', 'dienthoaiphuhuynh', 'parentphone', 'phone', 'sdt'],
  fullName:    ['hoten', 'hovaten', 'ten', 'fullname', 'name', 'hoto'],
  gender:      ['gioitinh', 'gioi', 'gender', 'sex'],
  dob:         ['ngaysinh', 'namsinh', 'dob', 'dateofbirth', 'birthday', 'ns'],
  className:   ['lop', 'tenlop', 'malop', 'lophoc', 'classname', 'class'],
  status:      ['trangthai', 'status', 'tinhtrang'],
};

/**
 * Đọc và parse file Excel import học sinh, chuyển thành mảng object chuẩn backend.
 * Hỗ trợ cả file do hệ thống tạo (sheet "DuLieuMau") lẫn file tự làm bất kỳ.
 * Tên cột được so sánh mềm (normalize dấu tiếng Việt, bỏ space, không phân biệt hoa/thường).
 *
 * @param {File} file - File Excel người dùng chọn (input type="file")
 * @returns {Promise<Array<{ studentCode, fullName, gender, dob, className, parentName, parentPhone, status, _row, _errors }>>}
 * @throws {Error} khi file không đọc được hoặc không có dòng dữ liệu
 */
export function parseStudentImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc file Excel.'));

    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });

        // Ưu tiên sheet "DuLieuMau" (file mẫu hệ thống), fallback sheet đầu tiên không phải HuongDan
        const preferredSheet = wb.SheetNames.find((n) => normalizeKey(n) === 'duliuumau' || normalizeKey(n) === 'dulieumaau' || normalizeKey(n).includes('dulieu') || normalizeKey(n).includes('data'));
        const sheetName = preferredSheet
          ?? wb.SheetNames.find((n) => !normalizeKey(n).includes('huongdan') && !normalizeKey(n).includes('guide'))
          ?? wb.SheetNames[0];

        const ws = wb.Sheets[sheetName];
        if (!ws) throw new Error('Không tìm thấy sheet dữ liệu trong file.');

        // Parse tất cả dòng (SheetJS dùng hàng 1 làm header key tự động)
        const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (raw.length === 0) throw new Error('File không chứa dòng dữ liệu nào (hoặc sheet trống).');

        // Xây dựng bảng tra ngược: normalizeKey(tên cột trong file) → field name
        // Lấy từ dòng đầu tiên để biết có những cột nào
        const sampleRow = raw[0];
        const colMap = {}; // { excelKey → fieldName }

        // Pass 1: Exact match (ưu tiên cao nhất, không bị nhầm prefix)
        for (const excelKey of Object.keys(sampleRow)) {
          if (colMap[excelKey]) continue;
          const nk = normalizeKey(excelKey);
          for (const [fieldName, aliases] of Object.entries(COLUMN_ALIASES)) {
            if (aliases.includes(nk)) {
              colMap[excelKey] = fieldName;
              break;
            }
          }
        }

        // Pass 2: Prefix/contains match (fallback cho tên cột lạ)
        for (const excelKey of Object.keys(sampleRow)) {
          if (colMap[excelKey]) continue; // đã map ở pass 1
          const nk = normalizeKey(excelKey);
          for (const [fieldName, aliases] of Object.entries(COLUMN_ALIASES)) {
            // Bỏ qua field đã được map bởi key khác
            const alreadyMapped = Object.values(colMap).includes(fieldName);
            if (alreadyMapped) continue;
            if (aliases.some((alias) => nk.startsWith(alias) || alias.startsWith(nk))) {
              colMap[excelKey] = fieldName;
              break;
            }
          }
        }

        // Parse từng dòng dữ liệu dùng colMap vừa xây dựng
        const students = raw.map((r, i) => {
          /**
           * Lấy giá trị của field từ dòng r dựa trên colMap.
           * @param {string} fieldName - Tên field backend cần lấy
           * @returns {string} Giá trị hoặc chuỗi rỗng
           */
          const getField = (fieldName) => {
            // Tìm key gốc trong object dòng dựa trên colMap đã xây từ header
            const excelKey = Object.keys(colMap).find((k) => colMap[k] === fieldName);
            if (!excelKey) return '';
            const val = r[excelKey];
            return val !== '' && val != null ? String(val).trim() : '';
          };

          const row = {
            studentCode: getField('studentCode'),
            fullName:    getField('fullName'),
            gender:      getField('gender'),
            dob:         getField('dob'),
            className:   getField('className'),
            parentName:  getField('parentName'),
            parentPhone: getField('parentPhone'),
            status:      getField('status') || 'DangHoc',
            _row: i + 2, // +2: dòng 1 là header trong Excel
          };

          // Kiểm tra các trường bắt buộc
          const missing = [];
          if (!row.studentCode) missing.push('mã học sinh');
          if (!row.fullName)    missing.push('họ tên');
          if (!row.className)   missing.push('lớp');
          row._error = missing.length > 0 ? `Thiếu: ${missing.join(', ')}` : '';

          return row;
        });

        resolve(students);
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsArrayBuffer(file);
  });
}
