/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/tests/tuition-payment.test.js
 * Vai trò: Kiểm thử Tự động Nghiệp vụ Thanh Toán Học Phí Trực Tuyến & VietQR (SD-04)
 * Kiến trúc: Unit Test Suite - Business Domain & Controller Testing
 * Tác giả: Nhóm Đồ Án PTDA Phần Mềm
 * Ngày tạo: 14/11/2026
 * Mô tả:
 *   - Kiểm tra chuẩn sinh mã EMVCo VietQR và mã kiểm tra CRC16-CCITT.
 *   - Kiểm tra tính toán số tiền còn nợ tại Backend (chống tampering).
 *   - Kiểm tra quy tắc 1 phiên thanh toán duy nhất cho mỗi khoản nợ.
 *   - Kiểm tra quy trình UnitOfWork, cập nhật trạng thái PAID và sinh biên lai duy nhất.
 *   - Kiểm tra tính Idempotent (chống cộng dồn hai lần).
 * ==============================================================================
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { crc16Ccitt, generateVietQrPayload, formatTlv } from '../utils/vietQrHelper.js';
import { TuitionService } from '../services/TuitionService.js';
import { TuitionRepository } from '../repositories/TuitionRepository.js';
import { PaymentRepository } from '../repositories/PaymentRepository.js';

describe('A. VietQR EMVCo & CRC16 Helper Tests', () => {
  test('formatTlv tạo chuỗi đúng chuẩn ID + Length(2) + Value', () => {
    const tlv = formatTlv('00', '01');
    assert.strictEqual(tlv, '000201');

    const tlvName = formatTlv('08', 'HP2026');
    assert.strictEqual(tlvName, '0806HP2026');
  });

  test('crc16Ccitt tính toán mã checksum 4 ký tự Hex hợp lệ', () => {
    const checksum = crc16Ccitt('00020101021238540010A00000072701240006970422011003888888880208QRIBFTTC5303704540725000005802VN62140810HP202610016304');
    assert.strictEqual(typeof checksum, 'string');
    assert.strictEqual(checksum.length, 4);
    assert.match(checksum, /^[0-9A-F]{4}$/);
  });

  test('generateVietQrPayload sinh chuỗi EMVCo hoàn chỉnh có tag 6304 và kết thúc bằng CRC16', () => {
    const payload = generateVietQrPayload({
      bin: '970422',
      accountNo: '0388888888',
      amount: 1500000,
      orderCode: 'HPTEST001'
    });

    assert.ok(payload.startsWith('000201'));
    assert.ok(payload.includes('970422')); // BIN MBBank
    assert.ok(payload.includes('0388888888')); // Số tài khoản
    assert.ok(payload.includes('1500000')); // Số tiền
    assert.ok(payload.includes('HPTEST001')); // Nội dung
    assert.ok(payload.includes('6304')); // Tag CRC16
    assert.strictEqual(payload.slice(-4), crc16Ccitt(payload.slice(0, -4)));
  });
});

describe('B. Tuition Checkout & Concurrency Rule Tests', () => {
  test('Backend tự tính số tiền còn nợ (amount_due - amount_paid)', async () => {
    // Giả lập một khoản học phí trong DB
    const mockTuition = {
      id: 9991,
      student_code: 'HS001',
      student_name: 'Nguyễn Văn A',
      class_name: '10A1',
      amount_due: 2000000,
      amount_paid: 500000,
      status: 'PARTIAL'
    };

    TuitionRepository.findById = async (id) => (id === 9991 ? mockTuition : null);
    PaymentRepository.findActiveSessionByTuitionId = async () => null;

    let createdRecord = null;
    PaymentRepository.create = async (data) => {
      createdRecord = { id: 101, ...data };
      return createdRecord;
    };

    const session = await TuitionService.createCheckoutSession(9991, 'HS001', { username: 'ph_hs001', role: 'PH' });
    
    // Số tiền thanh toán phải đúng bằng 2.000.000 - 500.000 = 1.500.000
    assert.strictEqual(session.amount, 1500000);
    assert.ok(session.orderCode.startsWith('HP'));
    assert.ok(session.emvcoPayload);
    assert.strictEqual(session.status, 'OPEN');
  });

  test('Quy tắc 1 phiên duy nhất: Tái sử dụng phiên thanh toán đang hoạt động', async () => {
    const mockTuition = {
      id: 9992,
      student_code: 'HS001',
      amount_due: 1000000,
      amount_paid: 0,
      status: 'UNPAID'
    };

    const existingActiveSession = {
      id: 202,
      order_code: 'HP_EXISTING_123',
      tuition_id: 9992,
      amount: 1000000,
      status: 'OPEN',
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    };

    TuitionRepository.findById = async () => mockTuition;
    PaymentRepository.findActiveSessionByTuitionId = async () => existingActiveSession;

    const session = await TuitionService.createCheckoutSession(9992, 'HS001', { username: 'ph_hs001', role: 'PH' });
    
    // Phải trả về chính orderCode cũ, không tạo mã mới
    assert.strictEqual(session.orderCode, 'HP_EXISTING_123');
    assert.strictEqual(session.paymentId, 202);
  });
});

describe('C. Process Successful Payment & Idempotency Tests', () => {
  test('Xác nhận thanh toán thành công: Cập nhật tuition sang PAID và sinh biên lai duy nhất', async () => {
    const mockTuition = {
      id: 9993,
      student_code: 'HS001',
      student_name: 'Nguyễn Văn A',
      amount_due: 1500000,
      amount_paid: 0,
      status: 'UNPAID'
    };

    const mockPayment = {
      id: 303,
      order_code: 'HP_TEST_SUCCESS',
      tuition_id: 9993,
      student_code: 'HS001',
      amount: 1500000,
      status: 'PENDING'
    };

    PaymentRepository.findByOrderCode = async (code) => (code === 'HP_TEST_SUCCESS' ? mockPayment : null);
    TuitionRepository.findById = async () => mockTuition;

    let savedTuition = null;
    TuitionRepository.save = async (t) => {
      savedTuition = t;
      return t;
    };

    let updatedPaymentStatus = null;
    PaymentRepository.updateStatus = async (id, updates) => {
      updatedPaymentStatus = { id, ...updates };
      return updatedPaymentStatus;
    };

    const result = await TuitionService.processSuccessfulPayment({
      orderCode: 'HP_TEST_SUCCESS',
      bankTransactionId: 'BANK_TXN_8888',
      note: 'Thanh toán tự động test'
    });

    assert.strictEqual(result.alreadyProcessed, false);
    assert.ok(result.receiptNo.startsWith('BL-'));
    assert.strictEqual(savedTuition.status, 'PAID');
    assert.strictEqual(savedTuition.amountPaid, 1500000);
    assert.strictEqual(updatedPaymentStatus.status, 'PAID');
    assert.strictEqual(updatedPaymentStatus.bankTransactionId, 'BANK_TXN_8888');
  });

  test('Tính Idempotent: Giao dịch đã PAID không bị cộng dồn lần thứ 2', async () => {
    const paidPayment = {
      id: 304,
      order_code: 'HP_ALREADY_PAID',
      status: 'PAID',
      receipt_no: 'BL-20261114-1234'
    };

    PaymentRepository.findByOrderCode = async () => paidPayment;

    const result = await TuitionService.processSuccessfulPayment({
      orderCode: 'HP_ALREADY_PAID',
      bankTransactionId: 'RETRY_TXN'
    });

    assert.strictEqual(result.alreadyProcessed, true);
    assert.strictEqual(result.receiptNo, 'BL-20261114-1234');
  });
});
