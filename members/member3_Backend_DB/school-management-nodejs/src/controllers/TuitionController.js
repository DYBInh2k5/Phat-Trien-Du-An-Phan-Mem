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
   * Webhook xử lý thông báo tiền về từ cổng thanh toán đối tác (payOS/SePay/Casso/Ngân hàng)
   * Có xác thực HMAC-SHA256 với timingSafeEqual
   * @route POST /api/tuition/webhook
   */
  static async handleWebhook(req, res) {
    try {
      const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'htqllh-payment-webhook-secret-2026';
      const signature = req.headers['x-signature'] || req.headers['x-webhook-signature'];

      // Kiểm tra chữ ký bảo mật nếu có cấu hình bí mật webhook
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

      const { orderCode, reference, bankTransactionId, note } = req.body;
      const targetOrderCode = orderCode || reference;

      if (!targetOrderCode) {
        return res.status(400).json({ success: false, message: 'Webhook thiếu thông tin orderCode.' });
      }

      const result = await TuitionService.processSuccessfulPayment({
        orderCode: targetOrderCode,
        bankTransactionId,
        note: note || 'Thanh toán tự động qua Webhook đối tác',
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
  static async simulateSuccess(req, res) {
    try {
      const allowSimulation = process.env.NODE_ENV !== 'production' || process.env.ALLOW_PAYMENT_SIMULATION === 'true';
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
}
