import nodemailer from 'nodemailer';

let transporterPromise = null;

async function createTransporter() {
    // 1) Có cấu hình SMTP trong .env -> dùng SMTP thật
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

    // 2) Production mà thiếu SMTP -> báo lỗi rõ ràng, không âm thầm bỏ qua
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Thiếu cấu hình SMTP_HOST trong môi trường production.');
    }

    // 3) Dev: dùng Ethereal (hộp thư giả, không gửi ra ngoài, tự tạo tài khoản, không cần đăng ký)
    const account = await nodemailer.createTestAccount();
    console.log('[EMAIL] Chưa cấu hình SMTP, dùng Ethereal để test. Link xem email sẽ được in ra console.');
    return nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: { user: account.user, pass: account.pass },
    });
}

function getTransporter() {
    if (!transporterPromise) {
        transporterPromise = createTransporter().catch((err) => {
            transporterPromise = null; // cho phép thử lại ở lần gửi sau
            throw err;
        });
    }
    return transporterPromise;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export class EmailService {
    static async sendPasswordResetEmail({ to, fullName, resetLink, expiresInMinutes }) {
        const transporter = await getTransporter();
        const name = escapeHtml(fullName || 'bạn');

        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM || '"HTQLLH" <no-reply@htqllh.local>',
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
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#1f2937;line-height:1.55">
          <p>Xin chào ${name},</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>
            <a href="${escapeHtml(resetLink)}"
               style="display:inline-block;padding:10px 18px;background:#1d4ed8;color:#ffffff;text-decoration:none;border-radius:6px">
              Đặt mật khẩu mới
            </a>
          </p>
          <p style="font-size:14px">Liên kết hết hạn sau ${expiresInMinutes} phút và chỉ dùng được một lần.</p>
          <p style="font-size:14px">Nếu nút không hoạt động, sao chép địa chỉ này vào trình duyệt:<br>
            <span style="word-break:break-all">${escapeHtml(resetLink)}</span></p>
          <p style="font-size:14px;color:#6b7280">Nếu bạn không yêu cầu, hãy bỏ qua email này. Mật khẩu hiện tại vẫn giữ nguyên.</p>
        </div>`,
        });

        // Chỉ có giá trị khi dùng Ethereal (dev)
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`[EMAIL] Xem email test tại: ${previewUrl}`);
        }
        return info;
    }
}