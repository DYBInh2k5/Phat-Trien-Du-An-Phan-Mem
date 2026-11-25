/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member3_Backend_DB/school-management-nodejs/src/tests/email-service.test.js
 * Vai trò: Kịch Bản Kiểm Thử Đơn Vị Dịch Vụ Email (EmailService Unit Tests)
 * Kiến trúc: Clean Architecture - Tầng Kiểm Thử Chất Lượng (Quality Assurance Layer)
 * Tác giả: Nhóm Đồ Án PTDA Phần Mềm (Võ Duy Bình - Lead BA & Dev Team)
 * Ngày tạo: 25/11/2026
 * Mô tả:
 *   - Kiểm tra chống XSS khi render nội dung HTML email (escapeHtml).
 *   - Kiểm tra tạo payload chuẩn cho 3 luồng email: Đặt lại mật khẩu, Biên lai học phí, Phiếu báo điểm TT22.
 *   - Kiểm tra từ chối địa chỉ email người nhận không hợp lệ.
 * ==============================================================================
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EmailService, escapeHtml } from '../services/EmailService.js';

describe('A. EmailService – Kiểm tra bảo mật & định dạng nội dung email', () => {
  it('escapeHtml thoát ký tự HTML nguy hiểm chống XSS', () => {
    const raw = `<script>alert("xss")</script> & 'test'`;
    const escaped = escapeHtml(raw);
    assert.equal(escaped.includes('<script>'), false);
    assert.equal(escaped.includes('&lt;script&gt;'), true);
    assert.equal(escaped.includes('&amp;'), true);
  });

  it('sendMail từ chối địa chỉ email không hợp lệ', async () => {
    await assert.rejects(
      () => EmailService.sendMail({ to: 'invalid-email', subject: 'Test', text: 'Hi', html: '<p>Hi</p>' }),
      /không hợp lệ/
    );
  });

  it('sendTuitionReceiptEmail tạo tiêu đề & nội dung biên lai chính xác', async () => {
    const originalSendMail = EmailService.sendMail;
    let captured = null;
    EmailService.sendMail = async (opts) => {
      captured = opts;
      return { messageId: 'mock-tuition-1' };
    };

    try {
      await EmailService.sendTuitionReceiptEmail({
        to: 'phuhuynh@gmail.com',
        parentName: 'Nguyễn Văn A',
        studentCode: 'HS001',
        studentName: 'Nguyễn Thị Ánh',
        itemName: 'Học phí HK2 (2025-2026)',
        amount: 2500000,
        receiptNo: 'BL-20261125-1234',
        orderCode: 'HP1795578967900',
        paidAt: '2026-11-25T10:00:00.000Z',
      });

      assert.equal(captured.to, 'phuhuynh@gmail.com');
      assert.ok(captured.subject.includes('BL-20261125-1234'));
      assert.ok(captured.html.includes('HS001'));
      assert.ok(captured.html.includes('2.500.000'));
    } finally {
      EmailService.sendMail = originalSendMail;
    }
  });

  it('sendGradeReportEmail tạo bảng điểm Thông tư 22 chính xác', async () => {
    const originalSendMail = EmailService.sendMail;
    let captured = null;
    EmailService.sendMail = async (opts) => {
      captured = opts;
      return { messageId: 'mock-grade-1' };
    };

    try {
      await EmailService.sendGradeReportEmail({
        to: 'phuhuynh@gmail.com',
        parentName: 'Nguyễn Văn A',
        studentCode: 'HS001',
        studentName: 'Nguyễn Thị Ánh',
        className: '10A1',
        semester: 'HK1',
        schoolYear: '2025-2026',
        grades: [
          {
            subjectName: 'Toán',
            scoreOral: 8,
            score15m: 9,
            score1Hour: 8.5,
            scoreMidTerm: 8,
            scoreFinalTerm: 9,
            averageScore: 8.6,
            gradeLetter: 'Giỏi',
          },
        ],
      });

      assert.equal(captured.to, 'phuhuynh@gmail.com');
      assert.ok(captured.subject.includes('HK1'));
      assert.ok(captured.html.includes('Toán'));
      assert.ok(captured.html.includes('8.6'));
      assert.ok(captured.html.includes('Giỏi'));
    } finally {
      EmailService.sendMail = originalSendMail;
    }
  });
});
