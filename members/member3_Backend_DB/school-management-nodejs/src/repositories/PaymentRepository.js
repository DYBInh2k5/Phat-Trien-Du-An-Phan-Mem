/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/repositories/PaymentRepository.js
 * Vai trò: Tầng Truy Xuất Dữ Liệu Thanh Toán Học Phí (Payment Data Access Layer)
 * Kiến trúc: Clean Architecture - Repository Layer
 * Tác giả: Nhóm Đồ Án PTDA Phần Mềm
 * Ngày cập nhật: 13/11/2026
 * Mô tả:
 *   - Quản lý các phiên thanh toán học phí (payments) và đối soát giao dịch ngân hàng.
 *   - Sử dụng câu truy vấn SQL tham số hóa ($1, $2, ...) chống tấn công SQL Injection.
 *   - Tích hợp kho nhớ dự phòng (In-Memory Fallback) đảm bảo tính sẵn sàng cao khi offline CSDL.
 * ==============================================================================
 */

import { querySafe as query } from '../config/db.js';

// Kho lưu trữ tạm thời trong bộ nhớ khi CSDL PostgreSQL chưa kết nối
const inMemoryPayments = [];

export class PaymentRepository {
  /**
   * Tìm phiên thanh toán theo mã đơn hàng duy nhất (orderCode)
   * @param {string} orderCode - Mã giao dịch duy nhất (VD: HP1731510000001)
   * @returns {Promise<Object|null>}
   */
  static async findByOrderCode(orderCode) {
    const res = await query('SELECT * FROM payments WHERE order_code = $1 LIMIT 1', [orderCode]);
    if (res && res.rows) return res.rows[0] || null;

    // Fallback bộ nhớ
    return inMemoryPayments.find(p => p.order_code === orderCode || p.orderCode === orderCode) || null;
  }

  /**
   * Tìm phiên thanh toán theo ID
   * @param {number|string} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const res = await query('SELECT * FROM payments WHERE id = $1 LIMIT 1', [id]);
    if (res && res.rows) return res.rows[0] || null;

    return inMemoryPayments.find(p => String(p.id) === String(id)) || null;
  }

  /**
   * Tìm phiên thanh toán đang hoạt động (OPEN hoặc PENDING) cho một khoản học phí
   * Nhằm đảm bảo nguyên tắc: 1 khoản nợ chỉ có tối đa 1 phiên thanh toán đang mở
   * @param {number} tuitionId
   * @returns {Promise<Object|null>}
   */
  static async findActiveSessionByTuitionId(tuitionId) {
    const res = await query(
      `SELECT * FROM payments 
       WHERE tuition_id = $1 AND status IN ('OPEN', 'PENDING') AND expires_at > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [tuitionId]
    );
    if (res && res.rows) return res.rows[0] || null;

    return inMemoryPayments.find(p => 
      String(p.tuition_id || p.tuitionId) === String(tuitionId) &&
      ['OPEN', 'PENDING'].includes(p.status) &&
      new Date(p.expires_at || p.expiresAt) > new Date()
    ) || null;
  }

  /**
   * Lấy lịch sử tất cả các giao dịch thanh toán của một học sinh
   * @param {string} studentCode
   * @returns {Promise<Array>}
   */
  static async findByStudentCode(studentCode) {
    const res = await query(
      'SELECT * FROM payments WHERE student_code = $1 ORDER BY created_at DESC',
      [studentCode]
    );
    if (res && res.rows) return res.rows;

    return inMemoryPayments
      .filter(p => (p.student_code || p.studentCode) === studentCode)
      .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
  }

  /**
   * Tạo mới một phiên thanh toán học phí
   * @param {Object} paymentData
   * @returns {Promise<Object>}
   */
  static async create(paymentData) {
    const {
      orderCode,
      tuitionId,
      studentCode,
      amount,
      paymentMethod = 'VIETQR',
      bankBin = '970422',
      bankAccountNo = '0388888888',
      status = 'OPEN',
      expiresAt,
      note = ''
    } = paymentData;

    const res = await query(
      `INSERT INTO payments (
        order_code, tuition_id, student_code, amount, payment_method,
        bank_bin, bank_account_no, status, expires_at, note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [orderCode, tuitionId, studentCode, amount, paymentMethod, bankBin, bankAccountNo, status, expiresAt, note]
    );

    if (res && res.rows && res.rows[0]) {
      return res.rows[0];
    }

    // Lưu vào bộ nhớ tạm
    const newRecord = {
      id: inMemoryPayments.length + 1,
      order_code: orderCode,
      tuition_id: tuitionId,
      student_code: studentCode,
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      bank_bin: bankBin,
      bank_account_no: bankAccountNo,
      status,
      receipt_no: null,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    };
    inMemoryPayments.push(newRecord);
    return newRecord;
  }

  /**
   * Cập nhật trạng thái giao dịch thanh toán
   * @param {number|string} id - Khóa chính của bảng payments
   * @param {Object} updates - Các trường cần cập nhật
   * @returns {Promise<Object>}
   */
  static async updateStatus(id, { status, receiptNo = null, bankTransactionId = null, paidAt = null, note = null, client = null }) {
    const sql = `
      UPDATE payments
      SET status = $1,
          receipt_no = COALESCE($2, receipt_no),
          bank_transaction_id = COALESCE($3, bank_transaction_id),
          paid_at = COALESCE($4, paid_at),
          note = COALESCE($5, note),
          updated_at = NOW()
      WHERE id = $6 RETURNING *
    `;
    const params = [status, receiptNo, bankTransactionId, paidAt, note, id];

    if (client) {
      const res = await client.query(sql, params);
      return res.rows[0];
    }

    const res = await query(sql, params);
    if (res && res.rows && res.rows[0]) {
      return res.rows[0];
    }

    // Fallback bộ nhớ
    const item = inMemoryPayments.find(p => String(p.id) === String(id));
    if (item) {
      item.status = status;
      if (receiptNo) item.receipt_no = receiptNo;
      if (bankTransactionId) item.bank_transaction_id = bankTransactionId;
      if (paidAt) item.paid_at = paidAt;
      if (note) item.note = note;
      item.updated_at = new Date().toISOString();
      return item;
    }
    return null;
  }

  /**
   * Lấy danh sách các khoản thanh toán chờ duyệt dành cho Thủ quỹ / Kế toán
   * @returns {Promise<Array>}
   */
  static async findPendingPayments() {
    const res = await query(
      `SELECT p.*, t.student_name, t.class_name, t.semester, t.school_year
       FROM payments p
       JOIN tuitions t ON p.tuition_id = t.id
       WHERE p.status = 'PENDING'
       ORDER BY p.created_at ASC`
    );
    if (res && res.rows) return res.rows;

    return inMemoryPayments.filter(p => p.status === 'PENDING');
  }
}

