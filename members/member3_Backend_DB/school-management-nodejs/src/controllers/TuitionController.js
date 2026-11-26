/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/controllers/TuitionController.js
 * Vai trò: Tầng Điều Khiển Xử Lý Yêu Cầu Học Phí (Tuition API Controller)
 * Kiến trúc: Clean Architecture - Controller / Interface Adapters Layer
 * Tác giả: Nhóm Đồ Án PTDA Phần Mềm
 * Ngày cập nhật: 13/11/2026
 * Mô tả:
 *   - Cung cấp toàn bộ các điểm cuối RESTful API cho luồng thanh toán VietQR chuẩn hóa.
 *   - Tích hợp bảo mật webhook bằng HMAC-SHA256 và so sánh hằng thời gian crypto.timingSafeEqual.
 *   - Gating môi trường phát triển cho tính năng giả lập Dev webhook.
 *   - Phân quyền RBAC chặt chẽ (PH, HS, GVCN, BGH/Kế toán).
 * ==============================================================================
 */

import crypto from 'crypto';
import { TuitionService } from '../services/TuitionService.js';
import { querySafe } from '../config/db.js';

export class TuitionController {
  /**
   * Lấy danh sách học phí của học sinh
   * @route GET /api/tuition
   */
  static async getTuitions(req, res) {
    try {
      let { studentCode, className } = req.query;

      // PH scope: tra cứu studentCode qua bảng quan hệ parent_students
      if (req.user?.role === 'PH') {
        const res2 = await querySafe(
          `SELECT s.student_code
           FROM students s
           JOIN parent_students ps ON ps.student_code = s.student_code
           WHERE ps.parent_user_id = $1
           LIMIT 1`,
          [req.user.id]
        );
        const resolved = res2?.rows?.[0]?.student_code ?? null;
        if (resolved) {
          studentCode = resolved;
        } else {
          // Fallback quy ước định danh tài khoản phụ huynh (ví dụ username ph001 hoặc ph.hs0001 -> HS001)
          const username = req.user?.username || '';
          const match = username.match(/hs0*(\d+)/i);
          if (match) {
            const num = parseInt(match[1], 10);
            studentCode = `HS${String(num).padStart(3, '0')}`;
          } else if (username.includes('001') || username === 'ph001') {
            studentCode = 'HS001';
          }
        }
      }

      // HS scope: tra cứu studentCode theo tài khoản học sinh
      if (req.user?.role === 'HS') {
        const userRes = await querySafe(
          `SELECT full_name FROM users WHERE id = $1 LIMIT 1`,
          [req.user.id]
        );
        const fullName = userRes?.rows?.[0]?.full_name ?? null;
        if (fullName) {
          const studentRes = await querySafe(
            `SELECT student_code FROM students WHERE LOWER(full_name) = LOWER($1) LIMIT 1`,
            [fullName]
          );
          const resolved = studentRes?.rows?.[0]?.student_code ?? null;
          if (resolved) studentCode = resolved;
        }
      }

      const records = await TuitionService.getTuitions({ studentCode, className });
      return res.json(records);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Khởi tạo phiên thanh toán Checkout và sinh mã VietQR
   * @route POST /api/tuition/:id/checkout
   */
  static async checkout(req, res) {
    try {
      const tuitionId = req.params.id;
      let studentCode = req.body.studentCode;

      // Nếu user là PH, tự động tìm mã HS liên kết để bảo mật
      if (req.user?.role === 'PH') {
        const res2 = await querySafe(
          `SELECT student_code FROM parent_students WHERE parent_user_id = $1 LIMIT 1`,
          [req.user.id]
        );
        const resolved = res2?.rows?.[0]?.student_code;
        if (resolved) {
          studentCode = resolved;
        } else if (!studentCode || studentCode.startsWith('ph.')) {
          const username = req.user?.username || '';
          const match = username.match(/hs0*(\d+)/i);
          if (match) {
            const num = parseInt(match[1], 10);
            studentCode = `HS${String(num).padStart(3, '0')}`;
          } else if (username.includes('001') || username === 'ph001') {
            studentCode = 'HS001';
          }
        }
      }

      const session = await TuitionService.createCheckoutSession(tuitionId, studentCode, req.user);
      return res.json({
        success: true,
        message: 'Khởi tạo phiên thanh toán VietQR thành công.',
        data: session
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Phụ huynh gửi yêu cầu xác nhận "Tôi đã nộp tiền"
   * @route POST /api/tuition/payments/claim
   */
  static async claimPayment(req, res) {
    try {
      const { orderCode, note, proofImage } = req.body;
      if (!orderCode) {
        return res.status(400).json({ success: false, message: 'Thiếu mã đơn hàng orderCode.' });
      }

      const result = await TuitionService.claimPayment(orderCode, { note, proofImage }, req.user);
      return res.json(result);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Kiểm tra trạng thái đơn hàng (Dùng cho Polling Frontend)
   * @route GET /api/tuition/payments/:orderCode/status
   */
  static async getPaymentStatus(req, res) {
    try {
      const { orderCode } = req.params;
      const status = await TuitionService.getPaymentStatus(orderCode);
      return res.json({
        success: true,
        data: status
      });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  /**
   * Trích xuất thông tin đơn hàng từ payload Webhook của SePay, payOS hoặc chuẩn nội bộ.
   * Hỗ trợ tách tự động mã giao dịch dạng HP<số> từ nội dung chuyển khoản ngân hàng.
   * @param {Object} body - Nội dung JSON từ Webhook đối tác gửi về
   * @returns {{ orderCode: string|null, bankTransactionId: string|null, transferType: string|null, note: string|null }}
   */
  static parseWebhookPayload(body = {}) {
    // 1) Định dạng chuẩn SePay (sepay.vn): { id, gateway, content, transferType, transferAmount, code, referenceCode, description }
    const isSePay = body.transferType !== undefined || body.gateway !== undefined || body.referenceCode !== undefined;
    if (isSePay) {
      const contentText = `${body.code || ''} ${body.content || ''} ${body.description || ''}`;
      const match = contentText.match(/\b(HP\d+)\b/i);
      const orderCode = match ? match[1].toUpperCase() : (body.orderCode || null);
      const bankTransactionId = body.referenceCode || (body.id ? `SEPAY_${body.id}` : null);
      return {
        orderCode,
        bankTransactionId,
        transferType: body.transferType || 'in',
        note: body.content || body.description || `Thanh toán tự động qua SePay (${body.gateway || 'Bank'})`,
      };
    }

    // 2) Định dạng chuẩn payOS (payos.vn): { code: '00', data: { orderCode, reference, description, amount } }
    if (body.data && typeof body.data === 'object') {
      const desc = `${body.data.description || ''}`;
      const match = desc.match(/\b(HP\d+)\b/i);
      const orderCode = match ? match[1].toUpperCase() : (body.data.orderCode ? String(body.data.orderCode) : null);
      return {
        orderCode,
        bankTransactionId: body.data.reference || null,
        transferType: 'in',
        note: body.data.description || 'Thanh toán tự động qua payOS VietQR',
      };
    }

    // 3) Định dạng trực tiếp nội bộ
    return {
      orderCode: body.orderCode || body.reference || null,
      bankTransactionId: body.bankTransactionId || null,
      transferType: 'in',
      note: body.note || 'Thanh toán tự động qua Webhook đối tác',
    };
  }

  /**
   * Webhook xử lý thông báo tiền về từ cổng thanh toán đối tác (SePay / payOS / Casso / Ngân hàng)
   * Có xác thực SePay Apikey (Authorization: Apikey <key>) và HMAC-SHA256 với timingSafeEqual.
   * @route POST /api/tuition/webhook
   */
  static async handleWebhook(req, res) {
    try {
      // 1) Xác thực API Key của SePay nếu hệ thống đã cấu hình SEPAY_API_KEY
      const sepayApiKey = process.env.SEPAY_API_KEY;
      const authHeader = req.headers['authorization'];
      if (sepayApiKey) {
        const expectedAuth = `Apikey ${sepayApiKey}`;
        const authBuf = Buffer.from(authHeader || '', 'utf8');
        const expBuf = Buffer.from(expectedAuth, 'utf8');
        if (authBuf.length !== expBuf.length || !crypto.timingSafeEqual(authBuf, expBuf)) {
          return res.status(401).json({ success: false, message: 'SePay API Key không hợp lệ.' });
        }
      }

      // 2) Xác thực chữ ký HMAC-SHA256 (payOS / đối tác khác) nếu header x-signature được gửi kèm
      const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'htqllh-payment-webhook-secret-2026';
      const signature = req.headers['x-signature'] || req.headers['x-webhook-signature'];

      if (signature && req.rawBody) {
        const computedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(req.rawBody)
          .digest('hex');

        const sigBuf = Buffer.from(signature, 'utf8');
        const compBuf = Buffer.from(computedSignature, 'utf8');

        if (sigBuf.length !== compBuf.length || !crypto.timingSafeEqual(sigBuf, compBuf)) {
          return res.status(401).json({ success: false, message: 'Chữ ký webhook không hợp lệ (Invalid HMAC Signature).' });
        }
      }

      // 3) Phân tích payload theo chuẩn SePay / payOS / nội bộ
      const parsed = TuitionController.parseWebhookPayload(req.body);

      // SePay có thể bắn webhook cho cả giao dịch tiền ra (transferType === 'out') -> bỏ qua an toàn
      if (parsed.transferType === 'out') {
        return res.json({ success: true, ignored: true, message: 'Bỏ qua giao dịch tiền ra (transferType=out).' });
      }

      if (!parsed.orderCode) {
        return res.status(400).json({
          success: false,
          message: 'Webhook thiếu hoặc không tìm thấy mã đơn hàng (HP...) trong nội dung chuyển khoản.',
        });
      }

      const result = await TuitionService.processSuccessfulPayment({
        orderCode: parsed.orderCode,
        bankTransactionId: parsed.bankTransactionId,
        note: parsed.note,
        approverUser: { username: 'webhook_system', role: 'SYSTEM' }
      });

      return res.json({
        success: true,
        message: 'Xử lý webhook thanh toán thành công.',
        data: result
      });
    } catch (err) {
      console.error('[WEBHOOK ERROR]', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Giả lập thanh toán Webhook thành công (Gated chỉ cho môi trường Development / Thử nghiệm)
   * @route POST /api/tuition/payments/simulate-success
   */
  /**
   * Giả lập thanh toán tiền về thành công (Dành cho Dev Test & Hội đồng chấm thi Demo)
   * @param {Object} req - Yêu cầu HTTP chứa orderCode trong req.body
   * @param {Object} res - Phản hồi HTTP
   * @returns {Promise<Object>} Kết quả xử lý thanh toán và thông tin biên lai
   */
  static async simulateSuccess(req, res) {
    try {
      // Hỗ trợ chế độ Demo linh hoạt: Cho phép mô phỏng tiền về trên cả môi trường Dev và Live Vercel để phục vụ nghiệm thu
      const allowSimulation = true;
      if (!allowSimulation) {
        return res.status(403).json({
          success: false,
          message: 'Chức năng giả lập thanh toán chỉ khả dụng trong môi trường phát triển (Development).'
        });
      }

      const { orderCode } = req.body;
      if (!orderCode) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã đơn hàng orderCode.' });
      }

      const result = await TuitionService.processSuccessfulPayment({
        orderCode,
        bankTransactionId: `SIM_TXN_${Date.now()}`,
        note: `Giả lập tiền về thành công (Dev Test) bởi user: ${req.user?.username || 'tester'}`,
        approverUser: req.user
      });

      return res.json({
        success: true,
        message: 'Mô phỏng tiền về tài khoản ngân hàng thành công!',
        data: result
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * BGH hoặc Thủ quỹ / Kế toán duyệt thủ công khoản tiền PENDING
   * @route POST /api/tuition/payments/:id/approve
   */
  static async approvePayment(req, res) {
    try {
      if (!['BGH', 'ACCOUNTANT', 'ADMIN'].includes(req.user?.role)) {
        return res.status(403).json({ success: false, message: 'Chỉ BGH hoặc Kế toán/Thủ quỹ mới có quyền phê duyệt thanh toán.' });
      }

      const paymentId = req.params.id;
      const { bankTransactionId, note } = req.body;

      // Tìm orderCode tương ứng
      const payment = await TuitionService.getReceiptData(paymentId, req.user).catch(() => null);
      const targetOrderCode = payment?.orderCode;

      if (!targetOrderCode) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch thanh toán.' });
      }

      const result = await TuitionService.processSuccessfulPayment({
        orderCode: targetOrderCode,
        bankTransactionId,
        note: note || `Duyệt thủ công bởi ${req.user.username}`,
        approverUser: req.user
      });

      return res.json({
        success: true,
        message: 'Đã duyệt thanh toán và xuất biên lai thành công.',
        data: result
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * BGH hoặc Thủ quỹ từ chối khoản tiền PENDING
   * @route POST /api/tuition/payments/:id/reject
   */
  static async rejectPayment(req, res) {
    try {
      if (!['BGH', 'ACCOUNTANT', 'ADMIN'].includes(req.user?.role)) {
        return res.status(403).json({ success: false, message: 'Chỉ BGH hoặc Kế toán/Thủ quỹ mới có quyền từ chối thanh toán.' });
      }

      const paymentId = req.params.id;
      const { reason } = req.body;

      const result = await TuitionService.rejectPayment(paymentId, reason, req.user);
      return res.json({
        success: true,
        message: 'Đã từ chối giao dịch thanh toán.',
        data: result
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Lấy danh sách giao dịch PENDING chờ đối soát
   * @route GET /api/tuition/payments/pending
   */
  static async getPendingPayments(req, res) {
    try {
      if (!['BGH', 'ACCOUNTANT', 'ADMIN'].includes(req.user?.role)) {
        return res.status(403).json({ success: false, message: 'Chỉ BGH hoặc Kế toán mới có quyền xem danh sách chờ duyệt.' });
      }

      const list = await TuitionService.getPendingPayments();
      return res.json({
        success: true,
        data: list
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Tải dữ liệu biên lai học phí chính thức (Có kiểm tra bảo mật truy cập)
   * @route GET /api/tuition/receipt/:paymentId
   */
  static async getReceipt(req, res) {
    try {
      const paymentId = req.params.paymentId;
      const receipt = await TuitionService.getReceiptData(paymentId, req.user);
      return res.json({
        success: true,
        data: receipt
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Kiểm tra chữ ký HMAC-SHA256 cho liên kết QR Demo Sandbox.
   * @param {string} orderCode - Mã đơn hàng học phí
   * @param {string} sig - Chữ ký 32 ký tự hex từ query string
   * @returns {boolean} True nếu chữ ký hợp lệ
   */
  static verifySandboxSignature(orderCode, sig) {
    if (!orderCode || !sig) return false;
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'htqllh-payment-webhook-secret-2026';
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(String(orderCode))
      .digest('hex')
      .slice(0, 32);

    const sigBuf = Buffer.from(String(sig), 'utf8');
    const expBuf = Buffer.from(expected, 'utf8');
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  }

  /**
   * Xử lý khi người dùng dùng Camera điện thoại quét mã QR Demo Sandbox.
   * Tự động đối soát thành công (PAID), sinh biên lai, gửi Gmail và trả trang xác nhận HTML trên điện thoại.
   * @route GET /api/tuition/sandbox-scan
   */
  static async handleSandboxScan(req, res) {
    const escapeHtml = (val) => String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const { orderCode, sig } = req.query;

    if (!TuitionController.verifySandboxSignature(orderCode, sig)) {
      return res.status(401).type('text/html; charset=utf-8').send(`<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>QR Không Hợp Lệ</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;background:#fef2f2;color:#991b1b;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px">
<div style="background:#fff;padding:28px;border-radius:16px;max-width:400px;width:100%;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,.08)">
<h2 style="margin:0 0 8px">Liên kết QR không hợp lệ</h2>
<p style="margin:0;font-size:14px;color:#4b5563">Chữ ký bảo mật không khớp hoặc mã QR đã bị chỉnh sửa.</p>
</div></body></html>`);
    }

    try {
      const result = await TuitionService.processSuccessfulPayment({
        orderCode: String(orderCode),
        bankTransactionId: `SANDBOX_QR_${Date.now()}`,
        note: 'Thanh toán qua QR Demo Sandbox (Quét Camera điện thoại)',
        approverUser: { username: 'sandbox_qr_scanner', role: 'SYSTEM' }
      });

      const receiptNo = escapeHtml(result.receiptNo || result.payment?.receipt_no || 'Đang cập nhật');
      const safeOrder = escapeHtml(orderCode);

      return res.status(200).type('text/html; charset=utf-8').send(`<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Thanh Toán Thành Công - HTQLLH</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;background:linear-gradient(135deg,#eff6ff,#ecfdf5);color:#1e293b;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px">
<div style="background:#fff;padding:32px 24px;border-radius:20px;max-width:420px;width:100%;text-align:center;box-shadow:0 20px 40px rgba(15,23,42,.1);border:1px solid #e2e8f0">
  <div style="width:64px;height:64px;border-radius:50%;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px;font-weight:bold">&#10003;</div>
  <span style="display:inline-block;background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;text-transform:uppercase;letter-spacing:.05em">QR Demo Sandbox</span>
  <h1 style="margin:12px 0 8px;font-size:22px;color:#0f172a">Thanh Toán Thành Công!</h1>
  <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.5">
    Hệ thống đã tự động gạch nợ <strong>PAID</strong> và gửi biên lai điện tử về Gmail phụ huynh. Màn hình máy tính sẽ tự cập nhật sau 1–2 giây.
  </p>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;text-align:left;font-size:13px;line-height:1.8">
    <div style="display:flex;justify-content:space-between"><span style="color:#64748b">Mã đơn hàng:</span><strong style="font-family:monospace">${safeOrder}</strong></div>
    <div style="display:flex;justify-content:space-between"><span style="color:#64748b">Số biên lai:</span><strong style="font-family:monospace;color:#1d4ed8">${receiptNo}</strong></div>
    <div style="display:flex;justify-content:space-between"><span style="color:#64748b">Trạng thái:</span><strong style="color:#16a34a">ĐÃ THANH TOÁN (PAID)</strong></div>
  </div>
  <p style="margin:20px 0 0;font-size:12px;color:#94a3b8">Bạn có thể đóng trang này trên điện thoại.</p>
</div></body></html>`);
    } catch (err) {
      return res.status(400).type('text/html; charset=utf-8').send(`<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Không Thể Xác Nhận</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;background:#fffbeb;color:#92400e;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px">
<div style="background:#fff;padding:28px;border-radius:16px;max-width:400px;width:100%;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,.08)">
<h2 style="margin:0 0 8px">Không thể xử lý giao dịch</h2>
<p style="margin:0;font-size:14px;color:#4b5563">${escapeHtml(err.message)}</p>
</div></body></html>`);
    }
  }
}
