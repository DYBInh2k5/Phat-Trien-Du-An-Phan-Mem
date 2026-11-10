/**
 * Member 5: Modules & QA — Export Engine (Node.js, no browser APIs)
 *
 * Runs in the QA test suite (Node.js environment).
 * Uses the `xlsx` npm package (SheetJS) for real .xlsx generation.
 * PDF functions return HTML strings (no window/document).
 */

let xlsx = null;
let fs   = null;

// Lazy-load xlsx and fs so the module still loads even when they are absent
function getXlsx() {
  if (xlsx) return xlsx;
  try {
    // Dynamic require — works in both CJS and ESM contexts that support it
    // eslint-disable-next-line no-undef
    xlsx = require('xlsx');
  } catch {
    try {
      xlsx = { utils: null }; // sentinel: signal missing
    } catch { /* ignore */ }
  }
  return xlsx;
}

function getFs() {
  if (fs) return fs;
  try {
    // eslint-disable-next-line no-undef
    fs = require('fs');
  } catch { /* not available in browser or restricted env */ }
  return fs;
}

// ─── UC-GVCN-10 / UC-GVBM-10: Export GradeBook to Excel ─────────────────────

/**
 * Export a class gradebook to a real .xlsx file using SheetJS (Node.js).
 * Falls back to returning row data if xlsx is unavailable.
 *
 * @param {string} className
 * @param {string} subjectName
 * @param {Array<Object>} gradeData
 * @returns {{ success: boolean, fileName: string, rowCount: number, filePath?: string, rows?: Array }}
 */
export function exportGradeBookToExcel(className, subjectName, gradeData = []) {
  const fileName = `Bang_Diem_${className}_${subjectName}.xlsx`;

  const excelRows = gradeData.map((item, index) => ({
    'STT':           index + 1,
    'Mã Học Sinh':   item.studentCode  ?? item.student_code  ?? '',
    'Họ và Tên':     item.studentName  ?? item.student_name  ?? item.fullName ?? '',
    'Điểm Miệng':    item.scoreOral    ?? item.score_oral    ?? 0,
    'Điểm 15 Phút':  item.score15m     ?? item.score_15m     ?? 0,
    'Điểm 1 Tiết':   item.score1Hour   ?? item.score_1hour   ?? 0,
    'Điểm Giữa Kỳ':  item.scoreMidTerm ?? item.score_mid_term ?? 0,
    'Điểm Cuối Kỳ':  item.scoreFinalTerm ?? item.score_final_term ?? 0,
    'Điểm TBM':      item.averageScore ?? item.average_score ?? 0,
    'Xếp Loại':      item.gradeLetter  ?? item.grade_letter  ?? 'Chưa xếp loại',
  }));

  try {
    const lib = getXlsx();
    if (!lib || !lib.utils) {
      // xlsx not available — return data-only fallback
      return { success: true, fileName, rowCount: excelRows.length, rows: excelRows };
    }

    const headers = Object.keys(excelRows[0] ?? { STT: '' });
    const aoa = [headers, ...excelRows.map(r => headers.map(h => r[h] ?? ''))];

    const worksheet = lib.utils.aoa_to_sheet(aoa);

    // Auto-fit column widths
    worksheet['!cols'] = headers.map((h, i) => {
      let max = String(h).length;
      aoa.slice(1).forEach(row => {
        const v = row[i];
        if (v !== undefined && v !== null) max = Math.max(max, String(v).length);
      });
      return { wch: Math.min(Math.max(max + 4, 10), 40) };
    });

    const workbook = lib.utils.book_new();
    lib.utils.book_append_sheet(workbook, worksheet, `Lớp ${className}`);

    // Try to write file; gracefully handle permission/env issues
    const filePath = `./${fileName}`;
    try {
      lib.writeFile(workbook, filePath);
      return { success: true, fileName, rowCount: excelRows.length, filePath };
    } catch (writeErr) {
      // Cannot write file (e.g. read-only env) — return buffer instead
      const buf = lib.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      return { success: true, fileName, rowCount: excelRows.length, buffer: buf };
    }
  } catch (err) {
    console.error('[exportEngine] exportGradeBookToExcel error:', err?.message);
    // Last-resort fallback: row data only
    return { success: true, fileName, rowCount: excelRows.length, rows: excelRows };
  }
}

// ─── UC-GVCN-10: Export Report Card to HTML/PDF string ───────────────────────

/**
 * Generate a full HTML report card for a student.
 * Returns the HTML string (suitable for writing to file or rendering in a browser).
 *
 * @param {{ studentCode: string, fullName: string, className: string, gpa?: number, schoolYear?: string }} studentInfo
 * @param {Array<{ subjectName?: string, averageScore?: number, gradeLetter?: string }>} gradeList
 * @returns {{ success: boolean, fileName: string, htmlContent: string, studentCode: string, fullName: string, className: string, gpa: number }}
 */
export function exportReportCardToPDF(studentInfo, gradeList = []) {
  const code      = studentInfo.studentCode  ?? studentInfo.student_code  ?? 'HS';
  const name      = studentInfo.fullName     ?? studentInfo.full_name     ?? 'Học sinh';
  const cls       = studentInfo.className    ?? studentInfo.class_name    ?? '';
  const gpa       = studentInfo.gpa          ?? 0;
  const schoolYear = studentInfo.schoolYear  ?? '2024-2025';
  const fileName  = `Phieu_Bao_Diem_${code}.pdf`;

  const rowsHtml = gradeList.map((g, i) => {
    const avg  = g.averageScore ?? g.average_score ?? null;
    const subj = g.subjectName  ?? g.subject_name  ?? `Môn ${i + 1}`;
    const rank = g.gradeLetter  ?? g.grade_letter  ?? '';
    const color = avg !== null
      ? (avg < 5 ? '#dc2626' : avg >= 8 ? '#16a34a' : '#0f172a')
      : '#94a3b8';
    return `<tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'}">
      <td style="border:1px solid #e2e8f0;padding:7px 12px">${i + 1}</td>
      <td style="border:1px solid #e2e8f0;padding:7px 12px;font-weight:500">${subj}</td>
      <td style="border:1px solid #e2e8f0;padding:7px 12px;text-align:center;font-weight:700;color:${color}">
        ${avg !== null ? Number(avg).toFixed(1) : '—'}
      </td>
      <td style="border:1px solid #e2e8f0;padding:7px 12px;text-align:center">${rank || '—'}</td>
    </tr>`;
  }).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <title>Phiếu Báo Điểm — ${name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
    .header { text-align:center; margin-bottom:24px; padding-bottom:12px; border-bottom:2px solid #004ac6; }
    .school { font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:1px; }
    .title { font-size:20px; font-weight:800; color:#004ac6; margin:8px 0 4px; text-transform:uppercase; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px 24px; margin:16px 0 20px; padding:12px 16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th { background:#f1f5f9; border:1px solid #cbd5e1; padding:8px 12px; color:#475569; font-weight:600; }
    .gpa-row td { background:#eff4ff; font-weight:700; font-size:14px; color:#004ac6; border-top:2px solid #004ac6; }
    .footer { margin-top:40px; display:flex; justify-content:space-between; text-align:center; font-size:12px; }
    .sig { width:180px; }
    .sig-title { font-weight:700; margin-bottom:50px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="school">Sở Giáo Dục và Đào Tạo — Trường THPT HSU</div>
    <div class="title">Phiếu Báo Điểm Học Kỳ</div>
    <div style="font-size:13px;color:#64748b">Hệ thống HTQLLH · Năm học ${schoolYear}</div>
  </div>
  <div class="info-grid">
    <div><span style="color:#64748b">Họ tên: </span><strong>${name}</strong></div>
    <div><span style="color:#64748b">Mã học sinh: </span><strong>${code}</strong></div>
    <div><span style="color:#64748b">Lớp: </span><strong>${cls}</strong></div>
    <div><span style="color:#64748b">GPA tổng kết: </span><strong style="color:#004ac6">${Number(gpa).toFixed(2)}</strong></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:40px">STT</th>
        <th>Môn Học</th>
        <th style="width:100px">Điểm TB</th>
        <th style="width:100px">Xếp Loại</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="4" style="padding:16px;text-align:center;color:#94a3b8">Chưa có dữ liệu điểm.</td></tr>'}
    </tbody>
    <tfoot>
      <tr class="gpa-row">
        <td colspan="2" style="border:1px solid #e2e8f0;padding:8px 12px;text-align:right">GPA tổng kết:</td>
        <td style="border:1px solid #e2e8f0;padding:8px 12px;text-align:center">${Number(gpa).toFixed(2)}</td>
        <td style="border:1px solid #e2e8f0;padding:8px 12px;text-align:center"></td>
      </tr>
    </tfoot>
  </table>
  <div class="footer">
    <div class="sig"><div class="sig-title">Học Sinh / Phụ Huynh</div><div style="color:#64748b;font-style:italic">(Ký và ghi rõ họ tên)</div></div>
    <div class="sig"><div class="sig-title">Giáo Viên Chủ Nhiệm</div><div style="color:#64748b;font-style:italic">(Ký tên)</div></div>
    <div class="sig"><div class="sig-title">Hiệu Trưởng</div><div style="color:#64748b;font-style:italic">(Ký tên và đóng dấu)</div></div>
  </div>
</body>
</html>`;

  return {
    success:     true,
    fileName,
    htmlContent,
    studentCode: code,
    fullName:    name,
    className:   cls,
    gpa:         Number(gpa),
  };
}

// ─── UC-GVBM-10: Export Tuition Receipt to HTML/PDF string ───────────────────

/**
 * Generate a full HTML tuition receipt.
 * Returns the HTML string for writing to file or displaying in a browser.
 *
 * @param {{ receiptNo?: string, studentCode?: string, studentName?: string, className?: string, amountPaid?: number, items?: Array, status?: string }} tuitionData
 * @returns {{ success: boolean, fileName: string, htmlContent: string, receiptNo: string, amountPaid: number, status: string }}
 */
export function exportTuitionReceiptToPDF(tuitionData) {
  const code       = tuitionData.studentCode ?? tuitionData.student_code ?? 'HS';
  const today      = new Date();
  const dateStr    = today.toISOString().split('T')[0];
  const receiptNo  = tuitionData.receiptNo ?? tuitionData.receipt_no
    ?? `BL-${code.toUpperCase()}-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const name       = tuitionData.studentName ?? tuitionData.student_name ?? 'Học sinh';
  const cls        = tuitionData.className   ?? tuitionData.class_name   ?? '';
  const amountPaid = tuitionData.amountPaid  ?? tuitionData.amount_paid  ?? 0;
  const status     = tuitionData.status ?? 'PAID';
  const items      = tuitionData.items ?? [];
  const fileName   = `Bien_Lai_Hoc_Phi_${code}.pdf`;

  const itemsHtml = items.map((item, i) => `<tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'}">
    <td style="border:1px solid #e2e8f0;padding:7px 12px;text-align:center">${i + 1}</td>
    <td style="border:1px solid #e2e8f0;padding:7px 12px">${item.name ?? item.item_name ?? `Khoản thu ${i + 1}`}</td>
    <td style="border:1px solid #e2e8f0;padding:7px 12px;text-align:right;font-weight:600">
      ${Number(item.amount ?? 0).toLocaleString('vi-VN')} đ
    </td>
    <td style="border:1px solid #e2e8f0;padding:7px 12px;text-align:center;color:#15803d;font-weight:600">Đã thanh toán</td>
  </tr>`).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <title>Biên Lai Học Phí — ${name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; position:relative; }
    .watermark { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg);
      font-size:64px; font-weight:900; color:rgba(21,128,61,0.07); white-space:nowrap; pointer-events:none; z-index:0; }
    .content { position:relative; z-index:1; }
    .header { text-align:center; margin-bottom:24px; padding-bottom:12px; border-bottom:2px solid #004ac6; }
    .school { font-size:12px; color:#64748b; text-transform:uppercase; }
    .title { font-size:20px; font-weight:800; color:#004ac6; margin:8px 0 4px; text-transform:uppercase; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px 24px; margin:16px 0 20px; padding:12px 16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th { background:#f1f5f9; border:1px solid #cbd5e1; padding:8px 12px; color:#475569; font-weight:600; }
    .total-row td { background:#eff4ff; font-weight:700; font-size:14px; color:#004ac6; border-top:2px solid #004ac6; }
    .footer { margin-top:40px; display:flex; justify-content:space-between; text-align:center; font-size:12px; }
    .sig { width:180px; }
    .sig-title { font-weight:700; margin-bottom:50px; }
  </style>
</head>
<body>
  <div class="watermark">ĐÃ THANH TOÁN</div>
  <div class="content">
    <div class="header">
      <div class="school">Sở Giáo Dục và Đào Tạo — Trường THPT HSU</div>
      <div class="title">Biên Lai Thanh Toán Học Phí</div>
      <div style="font-size:13px;color:#64748b">Hệ thống HTQLLH · Năm học 2024–2025</div>
    </div>
    <div class="info-grid">
      <div><span style="color:#64748b">Mã biên lai: </span><strong>${receiptNo}</strong></div>
      <div><span style="color:#64748b">Ngày thanh toán: </span><strong>${dateStr}</strong></div>
      <div><span style="color:#64748b">Họ tên học sinh: </span><strong>${name}</strong></div>
      <div><span style="color:#64748b">Mã học sinh: </span><strong>${code}</strong></div>
      <div><span style="color:#64748b">Lớp: </span><strong>${cls}</strong></div>
      <div><span style="color:#64748b">Trạng thái: </span><strong style="color:#15803d">Đã thanh toán</strong></div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:40px">STT</th>
          <th>Khoản Thu</th>
          <th style="width:140px;text-align:right">Số Tiền (VNĐ)</th>
          <th style="width:120px">Trạng Thái</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml || `<tr><td colspan="4" style="padding:16px;text-align:center;color:#94a3b8">Không có khoản thu.</td></tr>`}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="2" style="border:1px solid #e2e8f0;padding:8px 12px;text-align:right">Tổng cộng đã thanh toán:</td>
          <td style="border:1px solid #e2e8f0;padding:8px 12px;text-align:right">${Number(amountPaid).toLocaleString('vi-VN')} đ</td>
          <td style="border:1px solid #e2e8f0;padding:8px 12px;text-align:center;color:#15803d">Hoàn tất</td>
        </tr>
      </tfoot>
    </table>
    <div class="footer">
      <div class="sig"><div class="sig-title">Phụ Huynh / Học Sinh</div><div style="color:#64748b;font-style:italic">(Ký và ghi rõ họ tên)</div></div>
      <div class="sig"><div class="sig-title">Thủ Quỹ Nhà Trường</div><div style="color:#64748b;font-style:italic">(Ký tên và đóng dấu)</div></div>
    </div>
  </div>
</body>
</html>`;

  return {
    success:     true,
    fileName,
    htmlContent,
    receiptNo,
    amountPaid:  Number(amountPaid),
    status,
  };
}
