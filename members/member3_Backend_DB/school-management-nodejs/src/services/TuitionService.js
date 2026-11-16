/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/services/TuitionService.js
 * Vai trò: Tầng Dịch Vụ Nghiệp Vụ Quản Lý Học Phí & VietQR (Tuition Business Logic)
 * Kiến trúc: Clean Architecture - Business Logic / Service Layer
 * Tác giả: Nhóm Đồ Án PTDA Phần Mềm
 * Ngày cập nhật: 13/11/2026
 * Mô tả:
 *   - Khởi tạo phiên thanh toán Checkout và sinh chuỗi EMVCo VietQR chuẩn NAPAS kèm QR image.
 *   - Quản lý trạng thái giao dịch: OPEN -> PENDING (phụ huynh claim) -> PAID (webhook/kế toán duyệt).
 *   - Đảm bảo tính toán số nợ chuẩn xác tại Backend: remaining = amount_due - amount_paid.
 *   - Chống tranh chấp: Một khoản nợ chỉ có duy nhất 1 phiên thanh toán hiệu lực.
 *   - Tự động sinh mã biên lai điện tử duy nhất định dạng BL-YYYYMMDD-XXXX.
 *   - Ghi nhận Audit Logger cho mọi thao tác tài chính trọng yếu.
 * ==============================================================================
 */

import { TuitionRepository } from '../repositories/TuitionRepository.js';
import { PaymentRepository } from '../repositories/PaymentRepository.js';
import { buildVietQrData } from '../utils/vietQrHelper.js';
import { UnitOfWork } from '../utils/UnitOfWork.js';
import { AuditLogger } from '../utils/AuditLogger.js';

export class TuitionService {
  /**
   * Lấy danh sách học phí theo mã học sinh hoặc tên lớp
   * @param {Object} filter - { className, studentCode }
   * @returns {Promise<Array>}
   */
  static async getTuitions({ className, studentCode }) {
    if (studentCode) {
      return await TuitionRepository.findByStudentCode(studentCode);
    }
    if (className) {
      return await TuitionRepository.findByClassName(className);
    }
    return await TuitionRepository.findAll();
  }

  /**
   * Khởi tạo phiên thanh toán Checkout và sinh mã VietQR động
   * @param {number|string} tuitionId - ID khoản học phí cần đóng
   * @param {string} studentCode - Mã học sinh
   * @param {Object} currentUser - Thông tin tài khoản người dùng đang đăng nhập
   * @returns {Promise<Object>}
   */
  static async createCheckoutSession(tuitionId, studentCode, currentUser) {
    const tuition = await TuitionRepository.findById(tuitionId);
    if (!tuition) {
      throw new Error(`Không tìm thấy khoản học phí có ID: ${tuitionId}`);
    }

    // Bảo mật phân quyền: Nếu là Phụ huynh (PH) hoặc Học sinh (HS), chỉ được thanh toán cho đúng mã HS của mình
    if (['PH', 'HS'].includes(currentUser?.role) && tuition.student_code !== studentCode) {
      throw new Error('Bạn không có quyền thực hiện thanh toán cho học sinh khác.');
    }

    const amountDue = parseFloat(tuition.amount_due || 0);
    const amountPaid = parseFloat(tuition.amount_paid || 0);
    const remainingAmount = amountDue - amountPaid;

    if (remainingAmount <= 0) {
      throw new Error('Khoản học phí này đã được thanh toán đầy đủ.');
    }

    // Kiểm tra xem đã có phiên OPEN hoặc PENDING nào còn hạn (TTL 15 phút) chưa
    let activeSession = await PaymentRepository.findActiveSessionByTuitionId(tuitionId);
    
    // Cấu hình ngân hàng thụ hưởng của Nhà trường từ biến môi trường
    const bankBin = process.env.VIETQR_BANK_BIN || '970422'; // 970422: MBBank
    const bankAccountNo = process.env.VIETQR_ACCOUNT_NO || '0388888888';
    const bankAccountName = process.env.VIETQR_ACCOUNT_NAME || 'TRUONG THPT CHUYEN HTQLLH';

    if (activeSession) {
      // Tái sử dụng phiên thanh toán đang mở để chống tạo đơn dư thừa
      const qrData = buildVietQrData({
        bin: bankBin,
        accountNo: bankAccountNo,
        accountName: bankAccountName,
        amount: parseFloat(activeSession.amount),
        orderCode: activeSession.order_code || activeSession.orderCode
      });

      return {
        orderCode: activeSession.order_code || activeSession.orderCode,
        paymentId: activeSession.id,
        amount: parseFloat(activeSession.amount),
        status: activeSession.status,
        expiresAt: activeSession.expires_at || activeSession.expiresAt,
        bankInfo: {
          bankName: 'MBBank',
          bin: bankBin,
          accountNo: bankAccountNo,
          accountName: bankAccountName
        },
        ...qrData
      };
    }

    // Tạo mã đơn hàng duy nhất: HP + Timestamp (Ví dụ: HP2411130001)
    const orderCode = `HP${Date.now()}`;
    // Hạn thanh toán: 15 phút kể từ lúc tạo
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const newPayment = await PaymentRepository.create({
      orderCode,
      tuitionId: tuition.id,
      studentCode: tuition.student_code,
      amount: remainingAmount,
      paymentMethod: 'VIETQR',
      bankBin,
      bankAccountNo,
      status: 'OPEN',
      expiresAt,
      note: `Thanh toan hoc phi ${tuition.student_code} - ${tuition.semester || 'HK1'}`
    });

    const qrData = buildVietQrData({
      bin: bankBin,
      accountNo: bankAccountNo,
      accountName: bankAccountName,
      amount: remainingAmount,
      orderCode
    });

    AuditLogger.log(currentUser || { username: 'system', role: 'PH' }, 'CHECKOUT_TUITION', 'payments', orderCode, {
      tuitionId: tuition.id,
      amount: remainingAmount
    });

    return {
      orderCode,
      paymentId: newPayment.id,
      amount: remainingAmount,
      status: 'OPEN',
      expiresAt,
      bankInfo: {
        bankName: 'MBBank',
        bin: bankBin,
        accountNo: bankAccountNo,
        accountName: bankAccountName
      },
      ...qrData
    };
  }

  /**
   * Phụ huynh gửi yêu cầu xác nhận "Tôi đã nộp tiền" (Chuyển trạng thái sang PENDING)
   * @param {string} orderCode - Mã giao dịch thanh toán
   * @param {Object} claimData - { proofImage, note }
   * @param {Object} currentUser - Tài khoản phụ huynh
   * @returns {Promise<Object>}
   */
  static async claimPayment(orderCode, claimData = {}, currentUser) {
    const payment = await PaymentRepository.findByOrderCode(orderCode);
    if (!payment) {
      throw new Error(`Không tìm thấy phiên giao dịch: ${orderCode}`);
    }

    if (payment.status === 'PAID') {
      return { success: true, message: 'Giao dịch đã được hệ thống ghi nhận thành công từ trước.', payment };
    }

    if (new Date(payment.expires_at || payment.expiresAt) < new Date()) {
      await PaymentRepository.updateStatus(payment.id, { status: 'EXPIRED' });
      throw new Error('Phiên thanh toán đã hết hạn (quá 15 phút). Vui lòng tạo mã QR thanh toán mới.');
    }

    const updated = await PaymentRepository.updateStatus(payment.id, {
      status: 'PENDING',
      note: claimData.note || 'Phụ huynh đã xác nhận chuyển khoản, chờ đối soát'
    });

    AuditLogger.log(currentUser || { username: 'parent', role: 'PH' }, 'CLAIM_TUITION_PAYMENT', 'payments', orderCode, {
      status: 'PENDING'
    });

    return {
      success: true,
      message: 'Đã gửi thông tin thanh toán thành công. Thủ quỹ/Nhà trường sẽ đối soát và xác nhận biên lai cho bạn.',
      payment: updated
    };
  }

  /**
   * Tra cứu trạng thái phiên thanh toán (Dùng cho Polling Frontend)
   * @param {string} orderCode
   * @returns {Promise<Object>}
   */
  static async getPaymentStatus(orderCode) {
    const payment = await PaymentRepository.findByOrderCode(orderCode);
    if (!payment) {
      throw new Error(`Không tìm thấy đơn hàng: ${orderCode}`);
    }

    // Kiểm tra hết hạn tự động nếu đang ở trạng thái OPEN
    if (payment.status === 'OPEN' && new Date(payment.expires_at || payment.expiresAt) < new Date()) {
      await PaymentRepository.updateStatus(payment.id, { status: 'EXPIRED' });
      payment.status = 'EXPIRED';
    }

    return {
      orderCode: payment.order_code || payment.orderCode,
      status: payment.status,
      amount: parseFloat(payment.amount),
      receiptNo: payment.receipt_no || payment.receiptNo || null,
      paidAt: payment.paid_at || payment.paidAt || null,
      expiresAt: payment.expires_at || payment.expiresAt
    };
  }

  /**
   * Xử lý xác nhận thanh toán thành công (Core Business Logic cho cả Webhook, Duyệt thủ công và Dev Simulator)
   * Đảm bảo tính nhất quán qua ACID Transaction (UnitOfWork) và tính Idempotent (chống trùng lặp)
   * @param {Object} params - { orderCode, bankTransactionId, note, approverUser }
   * @returns {Promise<Object>}
   */
  static async processSuccessfulPayment({ orderCode, bankTransactionId = null, note = '', approverUser = null }) {
    const uow = new UnitOfWork();
    return await uow.execute(async (client) => {
      const payment = await PaymentRepository.findByOrderCode(orderCode);
      if (!payment) {
        throw new Error(`Không tìm thấy phiên giao dịch: ${orderCode}`);
      }

      // Idempotency: Nếu đã PAID từ trước thì không cộng dồn tiền lần thứ hai
      if (payment.status === 'PAID') {
        return {
          alreadyProcessed: true,
          receiptNo: payment.receipt_no || payment.receiptNo,
          payment
        };
      }

      const tuition = await TuitionRepository.findById(payment.tuition_id || payment.tuitionId);
      if (!tuition) {
        throw new Error(`Khoản học phí liên kết không tồn tại.`);
      }

      const currentPaid = parseFloat(tuition.amount_paid || 0);
      const paymentAmount = parseFloat(payment.amount || 0);
      const amountDue = parseFloat(tuition.amount_due || 0);
      const newPaid = currentPaid + paymentAmount;

      let newStatus = 'UNPAID';
      if (newPaid >= amountDue) {
        newStatus = 'PAID';
      } else if (newPaid > 0) {
        newStatus = 'PARTIAL';
      }

      // Sinh mã biên lai điện tử duy nhất: BL-YYYYMMDD-XXXX
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const receiptNo = `BL-${datePart}-${randomSuffix}`;

      // 1. Cập nhật bảng tuitions
      tuition.amountPaid = newPaid;
      tuition.status = newStatus;
      tuition.receiptNo = receiptNo;
      await TuitionRepository.save(tuition, client);

      // 2. Cập nhật bảng payments
      const updatedPayment = await PaymentRepository.updateStatus(payment.id, {
        status: 'PAID',
        receiptNo,
        bankTransactionId: bankTransactionId || `TXN${Date.now()}`,
        paidAt: new Date().toISOString(),
        note: note || 'Xác nhận thanh toán học phí thành công',
        client
      });

      AuditLogger.log(approverUser || { username: 'payment_gateway', role: 'SYSTEM' }, 'PAYMENT_SUCCESS', 'payments', orderCode, {
        amount: paymentAmount,
        receiptNo,
        tuitionId: tuition.id
      });

      return {
        alreadyProcessed: false,
        receiptNo,
        payment: updatedPayment,
        tuition
      };
    });
  }

  /**
   * Kế toán / Thủ quỹ / BGH từ chối khoản thanh toán PENDING
   * @param {number|string} paymentId
   * @param {string} reason - Lý do từ chối (VD: Sai số tiền, chưa thấy tiền về TK)
   * @param {Object} approverUser
   * @returns {Promise<Object>}
   */
  static async rejectPayment(paymentId, reason, approverUser) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error(`Không tìm thấy phiên giao dịch ID: ${paymentId}`);
    }

    if (payment.status === 'PAID') {
      throw new Error('Không thể từ chối giao dịch đã được thanh toán thành công.');
    }

    const updated = await PaymentRepository.updateStatus(payment.id, {
      status: 'REJECTED',
      note: `Từ chối bởi ${approverUser?.username || 'Kế toán'}: ${reason || 'Không khớp giao dịch ngân hàng'}`
    });

    AuditLogger.log(approverUser, 'REJECT_PAYMENT', 'payments', payment.order_code, { reason });
    return updated;
  }

  /**
   * Lấy thông tin chi tiết biên lai học phí phục vụ in ấn hoặc xuất PDF
   * @param {number|string} paymentId
   * @param {Object} currentUser
   * @returns {Promise<Object>}
   */
  static async getReceiptData(paymentId, currentUser) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error(`Không tìm thấy giao dịch ID: ${paymentId}`);
    }

    if (payment.status !== 'PAID') {
      throw new Error('Chỉ có thể lấy biên lai cho các giao dịch đã hoàn tất thanh toán (PAID).');
    }

    const tuition = await TuitionRepository.findById(payment.tuition_id || payment.tuitionId);

    // Kiểm tra quyền: Chỉ phụ huynh/học sinh của hồ sơ hoặc BGH/Thủ quỹ mới có quyền xem
    if (['PH', 'HS'].includes(currentUser?.role) && tuition?.student_code !== currentUser?.studentCode && tuition?.student_code !== currentUser?.username) {
      if (tuition?.student_code !== payment.student_code) {
        throw new Error('Bạn không có quyền truy cập biên lai này.');
      }
    }

    return {
      receiptNo: payment.receipt_no || payment.receiptNo,
      orderCode: payment.order_code || payment.orderCode,
      paidAt: payment.paid_at || payment.paidAt || payment.updated_at,
      amount: parseFloat(payment.amount),
      studentCode: payment.student_code,
      studentName: tuition?.student_name || 'Học sinh',
      className: tuition?.class_name || '—',
      semester: tuition?.semester || 'HK1',
      schoolYear: tuition?.school_year || '2024-2025',
      paymentMethod: payment.payment_method || 'VIETQR',
      bankTransactionId: payment.bank_transaction_id,
      note: payment.note
    };
  }

  /**
   * Lấy danh sách giao dịch PENDING chờ đối soát cho Kế toán / BGH
   */
  static async getPendingPayments() {
    return await PaymentRepository.findPendingPayments();
  }
}
