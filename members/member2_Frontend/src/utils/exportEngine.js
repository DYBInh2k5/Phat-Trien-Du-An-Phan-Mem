import * as XLSX from 'xlsx';

/**
 * UC-PAR-09: Export tuition receipt as a formatted print PDF.
 * Opens a styled print window with receipt layout, watermark, and signature boxes.
 *
 * @param {{ studentCode: string, studentName: string, className: string }} studentInfo
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
    const dateStr = today.toLocaleDateString('vi-VN');
    const receiptNo = studentInfo.receiptNo
      ?? `BL-${(studentInfo.studentCode ?? 'HS').toUpperCase()}-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    const totalPaid = paidItems.reduce((sum, item) => sum + (item.amount ?? 0), 0);

    const itemsHtml = paidItems.map((item, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}">
        <td style="border:1px solid #e2e8f0;padding:8px 12px;text-align:center;color:#64748b">${idx + 1}</td>
        <td style="border:1px solid #e2e8f0;padding:8px 12px;color:#0f172a">${item.name}</td>
        <td style="border:1px solid #e2e8f0;padding:8px 12px;text-align:right;font-weight:600;color:#004ac6">${(item.amount ?? 0).toLocaleString('vi-VN')} đ</td>
        <td style="border:1px solid #e2e8f0;padding:8px 12px;text-align:center">
          <span style="display:inline-block;padding:2px 8px;border-radius:9999px;background:#f0fdf4;color:#15803d;font-size:11px;font-weight:600;border:1px solid #86efac">Đã thanh toán</span>
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Biên Lai Học Phí — ${studentInfo.studentName ?? ''}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 32px; color: #0f172a; position: relative; }
          .watermark {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-30deg);
            font-size: 72px; font-weight: 900; color: rgba(21,128,61,0.08); white-space: nowrap;
            pointer-events: none; z-index: 0; letter-spacing: 4px;
          }
          .content { position: relative; z-index: 1; }
          .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #004ac6; }
          .school-name { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
          .receipt-title { font-size: 22px; font-weight: 800; color: #004ac6; text-transform: uppercase; margin: 8px 0 4px; }
          .receipt-meta { font-size: 13px; color: #475569; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin: 16px 0 20px; padding: 14px 18px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; }
          .info-grid .label { color: #64748b; }
          .info-grid .value { color: #0f172a; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .total-row td { background: #eff4ff; font-weight: 700; font-size: 14px; color: #004ac6; border-top: 2px solid #004ac6; }
          .signatures { margin-top: 40px; display: flex; justify-content: space-between; text-align: center; font-size: 13px; }
          .sig-box { width: 200px; }
          .sig-title { font-weight: 700; color: #0f172a; margin-bottom: 52px; }
          .sig-note { color: #64748b; font-style: italic; font-size: 11px; }
          @media print { body { margin: 0; } .watermark { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="watermark">ĐÃ THANH TOÁN</div>
        <div class="content">
          <div class="header">
            <div class="school-name">Sở Giáo Dục và Đào Tạo — Trường THPT HSU</div>
            <div class="receipt-title">Biên Lai Thanh Toán Học Phí</div>
            <div class="receipt-meta">Hệ thống HTQLLH · Năm học 2024–2025</div>
          </div>

          <div class="info-grid">
            <div><span class="label">Mã biên lai: </span><span class="value">${receiptNo}</span></div>
            <div><span class="label">Ngày thanh toán: </span><span class="value">${dateStr}</span></div>
            <div><span class="label">Họ tên học sinh: </span><span class="value">${studentInfo.studentName ?? '—'}</span></div>
            <div><span class="label">Mã học sinh: </span><span class="value">${studentInfo.studentCode ?? '—'}</span></div>
            <div><span class="label">Lớp: </span><span class="value">${studentInfo.className ?? '—'}</span></div>
            <div><span class="label">Trạng thái: </span><span class="value" style="color:#15803d">Đã thanh toán</span></div>
          </div>

          <table>
            <thead>
              <tr style="background:#f1f5f9">
                <th style="border:1px solid #cbd5e1;padding:9px 12px;text-align:center;color:#475569;font-weight:600;width:50px">STT</th>
                <th style="border:1px solid #cbd5e1;padding:9px 12px;text-align:left;color:#475569;font-weight:600">Khoản Thu</th>
                <th style="border:1px solid #cbd5e1;padding:9px 12px;text-align:right;color:#475569;font-weight:600;width:160px">Số Tiền (VNĐ)</th>
                <th style="border:1px solid #cbd5e1;padding:9px 12px;text-align:center;color:#475569;font-weight:600;width:140px">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml.length > 0 ? itemsHtml : '<tr><td colspan="4" style="padding:16px;text-align:center;color:#94a3b8">Không có khoản thu đã thanh toán.</td></tr>'}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2" style="border:1px solid #cbd5e1;padding:10px 12px;text-align:right">Tổng Cộng Đã Thanh Toán:</td>
                <td style="border:1px solid #cbd5e1;padding:10px 12px;text-align:right">${totalPaid.toLocaleString('vi-VN')} đ</td>
                <td style="border:1px solid #cbd5e1;padding:10px 12px;text-align:center;color:#15803d">Hoàn tất</td>
              </tr>
            </tfoot>
          </table>

          <div class="signatures">
            <div class="sig-box">
              <div class="sig-title">Phụ Huynh / Học Sinh</div>
              <div class="sig-note">(Ký và ghi rõ họ tên)</div>
            </div>
            <div class="sig-box">
              <div class="sig-title">Thủ Quỹ Nhà Trường</div>
              <div class="sig-note">(Ký tên và đóng dấu)</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() { setTimeout(function() { window.print(); }, 350); };
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
