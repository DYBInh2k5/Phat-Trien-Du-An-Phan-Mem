import * as XLSX from 'xlsx';

/**
 * Utility to export tabular data to a real Excel (.xlsx) file using SheetJS
 * @param {string} filename - Desired file name (without or with extension)
 * @param {string} sheetName - Name of the worksheet
 * @param {Array<string>} headers - Header columns array
 * @param {Array<Array<any>>} rows - Data rows array
 */
export function exportToExcel(filename = 'Bang_Diem_EduManagePro', sheetName = 'Danh Sách', headers = [], rows = []) {
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
export function exportToPDF(title = 'BÁO CÁO TỔNG HỢP', subtitle = 'Trường THPT HSU - EduManage Pro', headers = [], rows = []) {
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
          <div><strong>Hệ thống:</strong> EduManage Pro</div>
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
