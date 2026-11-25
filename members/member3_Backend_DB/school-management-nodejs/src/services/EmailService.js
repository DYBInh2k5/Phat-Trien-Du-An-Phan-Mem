/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/services/EmailService.js
 * Vai trò: Dịch Vụ Gửi Email Thực Tế Qua Gmail SMTP / Nodemailer (Email Service)
 * Kiến trúc: Clean Architecture - Tầng Dịch Vụ Hạ Tầng (Infrastructure / Service Layer)
 * Tác giả: Nhóm Đồ Án PTDA Phần Mềm (Võ Duy Bình - Lead BA & Dev Team)
 * Ngày cập nhật: 25/11/2026
 * Mô tả:
 *   - Hỗ trợ gửi email thật qua Gmail SMTP (GMAIL_USER + GMAIL_APP_PASSWORD hoặc SMTP_SERVICE=gmail).
 *   - Hỗ trợ cấu hình SMTP tùy chỉnh (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).
 *   - Tự động fallback sang Ethereal (hộp thư kiểm thử) ở môi trường Dev khi chưa cấu hình SMTP.
 *   - Phục vụ 3 nghiệp vụ cốt lõi:
 *     1. Đặt lại mật khẩu (Forgot Password).
 *     2. Gửi biên lai xác nhận đóng học phí VietQR thành công cho Phụ huynh.
 *     3. Gửi phiếu điểm học kỳ chuẩn Thông tư 22 cho Phụ huynh.
 * ==============================================================================
 */

import nodemailer from 'nodemailer';

let transporterPromise = null;

/**
 * Khởi tạo bộ vận chuyển Nodemailer Transporter theo thứ tự ưu tiên:
 * 1. Gmail SMTP (GMAIL_USER + GMAIL_APP_PASSWORD hoặc SMTP_SERVICE=gmail)
 * 2. Máy chủ SMTP tùy chỉnh (SMTP_HOST)
 * 3. Ethereal test account (chỉ dùng cho môi trường dev/test)
 * @async
 * @returns {Promise<import('nodemailer').Transporter>}
 * @throws {Error} Nếu đang ở môi trường production mà thiếu cả Gmail lẫn SMTP_HOST
 */
async function createTransporter() {
  // 1) Ưu tiên cấu hình Gmail SMTP bằng App Password (GMAIL_USER + GMAIL_APP_PASSWORD)
  const gmailUser = process.env.GMAIL_USER || (process.env.SMTP_SERVICE === 'gmail' ? process.env.SMTP_USER : null);
  const gmailPass = process.env.GMAIL_APP_PASSWORD || (process.env.SMTP_SERVICE === 'gmail' ? process.env.SMTP_PASS : null);

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  }

  // 2) Cấu hình SMTP tổng quát qua biến môi trường SMTP_HOST
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true cho cổng 465, false cho 587 (STARTTLS)
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }

  // 3) Production mà thiếu cấu hình Gmail/SMTP -> báo lỗi rõ ràng, không âm thầm bỏ qua
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Thiếu cấu hình Gmail (GMAIL_USER / GMAIL_APP_PASSWORD) hoặc SMTP_HOST trong môi trường production.');
  }

  // 4) Dev/Test: dùng Ethereal (hộp thư giả lập, tự tạo tài khoản, in URL xem thử ra console)
  const account = await nodemailer.createTestAccount();
  console.log('[EMAIL] Chưa cấu hình Gmail/SMTP, dùng Ethereal để test. Link xem email sẽ được in ra console.');
  return nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: { user: account.user, pass: account.pass },
  });
}

/**
 * Lấy cá thể Transporter dùng chung (Singleton Promise) và tự reset nếu khởi tạo thất bại
 * @returns {Promise<import('nodemailer').Transporter>}
 */
function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = createTransporter().catch((err) => {
      transporterPromise = null;
      throw err;
    });
  }
  return transporterPromise;
}

/**
 * Mã hóa ký tự đặc biệt HTML nhằm ngăn chặn chèn mã độc XSS trong nội dung email
 * @param {string|number|null|undefined} value - Chuỗi đầu vào
 * @returns {string} Chuỗi đã thoát ký tự HTML
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Định dạng số tiền VNĐ phục vụ hiển thị trong email biên lai học phí
 * @param {number|string} amount - Số tiền cần định dạng
 * @returns {string} Chuỗi định dạng tiền tệ (VD: 2.500.000 VNĐ)
 */
function formatVnd(amount) {
  const num = Number(amount) || 0;
  return `${num.toLocaleString('vi-VN')} VNĐ`;
}

/**
 * Lớp EmailService - Điều phối gửi các loại email nghiệp vụ của hệ thống HTQLLH
 */
export class EmailService {
  /**
   * Hàm lõi dùng chung để gửi email qua Transporter và tự động ghi log URL xem thử (nếu dùng Ethereal)
   * @async
   * @param {Object} mailOptions - Cấu hình email Nodemailer ({ to, subject, text, html })
   * @returns {Promise<Object>} Kết quả gửi từ Nodemailer
   */
  static async sendMail({ to, subject, text, html }) {
    if (!to || typeof to !== 'string' || !to.includes('@')) {
      throw new Error('Địa chỉ email người nhận không hợp lệ.');
    }

    const transporter = await getTransporter();
    const defaultSender = process.env.MAIL_FROM
      || (process.env.GMAIL_USER ? `"HTQLLH - THPT HSU" <${process.env.GMAIL_USER}>` : '"HTQLLH - THPT HSU" <no-reply@htqllh.local>');

    const info = await transporter.sendMail({
      from: defaultSender,
      to,
      subject,
      text,
      html,
    });

    // Chỉ có giá trị khi dùng Ethereal ở môi trường dev
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[EMAIL] Xem email test tại: ${previewUrl}`);
    }
    return info;
  }

  /**
   * 1. Gửi email hướng dẫn đặt lại mật khẩu (Forgot Password)
   * @async
   * @param {Object} params
   * @param {string} params.to - Email người nhận
   * @param {string} [params.fullName] - Họ tên người dùng
   * @param {string} params.resetLink - Đường dẫn đặt lại mật khẩu kèm token
   * @param {number} params.expiresInMinutes - Thời hạn hiệu lực của liên kết (phút)
   * @returns {Promise<Object>}
   */
  static async sendPasswordResetEmail({ to, fullName, resetLink, expiresInMinutes }) {
    const name = escapeHtml(fullName || 'bạn');
    return this.sendMail({
      to,
      subject: 'Đặt lại mật khẩu tài khoản HTQLLH',
      text: [
        `Xin chào ${fullName || 'bạn'},`,
        '',
        'Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.',
        `Mở liên kết sau để đặt mật khẩu mới (hết hạn sau ${expiresInMinutes} phút, chỉ dùng được một lần):`,
        resetLink,
        '',
        'Nếu bạn không yêu cầu, hãy bỏ qua email này. Mật khẩu hiện tại vẫn giữ nguyên.',
      ].join('\n'),
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1f2937;line-height:1.55">
          <h2 style="color:#1e3a8a;margin-bottom:12px">Hệ thống Quản lý Trường học HTQLLH</h2>
          <p>Xin chào ${name},</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>
            <a href="${escapeHtml(resetLink)}"
               style="display:inline-block;padding:10px 18px;background:#1d4ed8;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold">
              Đặt mật khẩu mới
            </a>
          </p>
          <p style="font-size:14px">Liên kết hết hạn sau ${expiresInMinutes} phút và chỉ dùng được một lần.</p>
          <p style="font-size:14px">Nếu nút không hoạt động, sao chép địa chỉ này vào trình duyệt:<br>
            <span style="word-break:break-all">${escapeHtml(resetLink)}</span></p>
          <p style="font-size:14px;color:#6b7280">Nếu bạn không yêu cầu, hãy bỏ qua email này. Mật khẩu hiện tại vẫn giữ nguyên.</p>
        </div>`,
    });
  }

  /**
   * 2. Gửi email biên lai xác nhận thanh toán học phí thành công cho Phụ huynh
   * @async
   * @param {Object} params
   * @param {string} params.to - Email phụ huynh
   * @param {string} [params.parentName] - Tên phụ huynh
   * @param {string} params.studentCode - Mã học sinh (HS001)
   * @param {string} [params.studentName] - Họ tên học sinh
   * @param {string} [params.itemName] - Tên khoản thu học phí
   * @param {number|string} params.amount - Số tiền đã thanh toán
   * @param {string} params.receiptNo - Mã biên lai điện tử (BL-YYYYMMDD-XXXX)
   * @param {string} params.orderCode - Mã giao dịch VietQR
   * @param {string} [params.paidAt] - Thời gian thanh toán ISO
   * @returns {Promise<Object>}
   */
  static async sendTuitionReceiptEmail({
    to,
    parentName,
    studentCode,
    studentName,
    itemName,
    amount,
    receiptNo,
    orderCode,
    paidAt,
  }) {
    const safeParent = escapeHtml(parentName || 'Quý Phụ huynh');
    const safeStudent = escapeHtml(studentName || studentCode);
    const safeItem = escapeHtml(itemName || 'Khoản thu học phí');
    const formattedAmount = formatVnd(amount);
    const formattedDate = paidAt ? new Date(paidAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN');

    return this.sendMail({
      to,
      subject: `[HTQLLH] Biên lai xác nhận đóng học phí thành công - ${receiptNo}`,
      text: [
        `Kính gửi ${parentName || 'Quý Phụ huynh'},`,
        '',
        `Nhà trường xác nhận đã nhận thanh toán học phí cho học sinh ${studentName || studentCode} (${studentCode}).`,
        `- Khoản thu: ${itemName || 'Học phí'}`,
        `- Số tiền: ${formattedAmount}`,
        `- Mã biên lai: ${receiptNo}`,
        `- Mã giao dịch: ${orderCode}`,
        `- Thời gian: ${formattedDate}`,
        '',
        'Trân trọng,',
        'Phòng Tài vụ - Trường THPT HSU (HTQLLH)',
      ].join('\n'),
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
          <div style="background:#1e3a8a;color:#ffffff;padding:16px 24px">
            <h2 style="margin:0;font-size:18px">BIÊN LAI XÁC NHẬN THANH TOÁN HỌC PHÍ</h2>
            <p style="margin:4px 0 0;font-size:13px;opacity:0.9">Hệ thống Quản lý Trường học HTQLLH - THPT HSU</p>
          </div>
          <div style="padding:20px 24px;line-height:1.6">
            <p>Kính gửi <strong>${safeParent}</strong>,</p>
            <p>Nhà trường trân trọng thông báo giao dịch thanh toán học phí cho học sinh <strong>${safeStudent}</strong> (Mã HS: <strong>${escapeHtml(studentCode)}</strong>) đã được xác nhận thành công.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
              <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Khoản thu</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;text-align:right">${safeItem}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Số tiền đã đóng</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;color:#059669;text-align:right">${escapeHtml(formattedAmount)}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Mã biên lai</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;text-align:right">${escapeHtml(receiptNo)}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Mã giao dịch</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${escapeHtml(orderCode)}</td></tr>
              <tr><td style="padding:8px;color:#6b7280">Thời gian ghi nhận</td><td style="padding:8px;text-align:right">${escapeHtml(formattedDate)}</td></tr>
            </table>
            <p style="font-size:13px;color:#6b7280">Quý Phụ huynh có thể xem lại biên lai điện tử bất cứ lúc nào tại Cổng Thông Tin Phụ Huynh.</p>
          </div>
        </div>`,
    });
  }

  /**
   * 3. Gửi email Phiếu báo điểm học kỳ chuẩn Thông tư 22 cho Phụ huynh
   * @async
   * @param {Object} params
   * @param {string} params.to - Email phụ huynh
   * @param {string} [params.parentName] - Tên phụ huynh
   * @param {string} params.studentCode - Mã học sinh
   * @param {string} [params.studentName] - Họ tên học sinh
   * @param {string} [params.className] - Lớp học
   * @param {string} [params.semester='HK1'] - Học kỳ
   * @param {string} [params.schoolYear='2025-2026'] - Niên khóa
   * @param {Array<Object>} params.grades - Danh sách bản ghi điểm các môn học
   * @returns {Promise<Object>}
   */
  static async sendGradeReportEmail({
    to,
    parentName,
    studentCode,
    studentName,
    className,
    semester = 'HK1',
    schoolYear = '2025-2026',
    grades = [],
  }) {
    const safeParent = escapeHtml(parentName || 'Quý Phụ huynh');
    const safeStudent = escapeHtml(studentName || studentCode);
    const fmt = (v) => (v !== null && v !== undefined && v !== '' ? v : '—');

    const rowsHtml = grades.map((g) => {
      const subject = escapeHtml(g.subjectName || g.subject_name || 'Môn học');
      const oral = fmt(g.scoreOral ?? g.score_oral);
      const s15 = fmt(g.score15m ?? g.score_15m);
      const s1h = fmt(g.score1Hour ?? g.score_1hour);
      const mid = fmt(g.scoreMidTerm ?? g.score_mid_term);
      const fin = fmt(g.scoreFinalTerm ?? g.score_final_term);
      const avg = fmt(g.averageScore ?? g.average_score);
      const rank = escapeHtml(g.gradeLetter || g.grade_letter || '—');
      return `
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold">${subject}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${oral}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${s15}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${s1h}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${mid}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${fin}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;font-weight:bold;color:#1d4ed8">${avg}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${rank}</td>
        </tr>`;
    }).join('');

    const textLines = grades.map((g) => {
      const subject = g.subjectName || g.subject_name || 'Môn học';
      const avg = fmt(g.averageScore ?? g.average_score);
      const rank = g.gradeLetter || g.grade_letter || '—';
      return `- ${subject}: ĐTB = ${avg} (${rank})`;
    });

    return this.sendMail({
      to,
      subject: `[HTQLLH] Phiếu báo điểm ${semester} (${schoolYear}) - ${studentName || studentCode}`,
      text: [
        `Kính gửi ${parentName || 'Quý Phụ huynh'},`,
        '',
        `Nhà trường gửi bảng kết quả học tập ${semester} năm học ${schoolYear} của học sinh ${studentName || studentCode} (Mã HS: ${studentCode}, Lớp: ${className || '—'}):`,
        ...textLines,
        '',
        'Trân trọng,',
        'Giáo viên Chủ nhiệm & Ban Giám Hiệu - THPT HSU',
      ].join('\n'),
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:680px;margin:0 auto;color:#1f2937;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
          <div style="background:#1e3a8a;color:#ffffff;padding:16px 24px">
            <h2 style="margin:0;font-size:18px">PHIẾU BÁO ĐIỂM HỌC KỲ (${escapeHtml(semester)} - ${escapeHtml(schoolYear)})</h2>
            <p style="margin:4px 0 0;font-size:13px;opacity:0.9">Chuẩn Thông tư 22/2021/TT-BGDĐT — Trường THPT HSU</p>
          </div>
          <div style="padding:20px 24px;line-height:1.55">
            <p>Kính gửi <strong>${safeParent}</strong>,</p>
            <p>Nhà trường xin gửi bảng tổng hợp điểm số của học sinh <strong>${safeStudent}</strong> (Mã HS: <strong>${escapeHtml(studentCode)}</strong>, Lớp: <strong>${escapeHtml(className || '—')}</strong>):</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px">
              <thead>
                <tr style="background:#f3f4f6">
                  <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Môn học</th>
                  <th style="padding:8px;border:1px solid #e5e7eb">Miệng</th>
                  <th style="padding:8px;border:1px solid #e5e7eb">15p</th>
                  <th style="padding:8px;border:1px solid #e5e7eb">1 Tiết</th>
                  <th style="padding:8px;border:1px solid #e5e7eb">Giữa kỳ</th>
                  <th style="padding:8px;border:1px solid #e5e7eb">Cuối kỳ</th>
                  <th style="padding:8px;border:1px solid #e5e7eb">ĐTB</th>
                  <th style="padding:8px;border:1px solid #e5e7eb">Xếp loại</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || '<tr><td colspan="8" style="padding:12px;text-align:center;color:#6b7280">Chưa có dữ liệu điểm trong học kỳ này.</td></tr>'}
              </tbody>
            </table>
            <p style="font-size:13px;color:#6b7280">Phụ huynh có thể đăng nhập Cổng Thông Tin Phụ Huynh để gửi yêu cầu phúc khảo hoặc trao đổi trực tiếp với GVCN.</p>
          </div>
        </div>`,
    });
  }
}
