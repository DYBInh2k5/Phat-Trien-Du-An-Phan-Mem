import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { calculateAverageSubjectScore, evaluateAcademicRank, convertGPA10To4 } from '../../member4_Logic_Security/gpaCalculationLogic.js';
import { authorizeRoles, ROLES } from '../../member4_Logic_Security/rbacMiddleware.js';
import { AuditLogger } from '../../member3_Backend_DB/school-management-nodejs/src/utils/AuditLogger.js';
import { formatTlv, crc16Ccitt, generateVietQrPayload, buildVietQrData } from '../../member3_Backend_DB/school-management-nodejs/src/utils/vietQrHelper.js';
import { exportGradeBookToExcel, exportReportCardToPDF, exportTuitionReceiptToPDF, rankAcademicScore, generateReceiptLookupCode, buildScoreDistribution, exportScoreDistributionToExcel, buildSubjectScoreDistribution, buildAwardLists, exportAwardReportToExcel } from '../exportEngine.js';

/**
 * Thư mục tạm dành riêng cho các ca kiểm thử ghi tệp Excel.
 * Dùng os.tmpdir() thay vì '.' để không làm rác thư mục mã nguồn khi chạy test.
 */
const TMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'htqllh-member5-'));

/** require() cho tệp ESM — dò gói ghi Excel tùy chọn của môi trường chạy. */
const require = createRequire(import.meta.url);

/**
 * Member 5: QA Testing Suite (Week 9 – Extended)
 * Unit Tests for Business Logic, Academic Ranking, Export Engine,
 * and 15 Use Case implementations (UC-STU-03/05/06/07, UC-PAR-06/07/08/09,
 * UC-GVCN-07/10, UC-GVBM-09/10, UC-ADM-07, UC-STU-04).
 *
 * All tests run in Node.js without a browser or database connection.
 */

export function runSystemUnitTests() {
  console.log('=====================================================');
  console.log('[UNIT TEST QA SUITE] Executing Automated System Tests');
  console.log('=====================================================');

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  function assertEqual(testName, actual, expected) {
    if (actual === expected) {
      console.log(`PASS: [${testName}] -> Result: ${actual}`);
      passed++;
    } else {
      console.error(`FAIL: [${testName}] -> Actual: ${actual}, Expected: ${expected}`);
      failed++;
    }
  }

  // Gói ghi .xlsx / ghi style là phụ thuộc tùy chọn của môi trường chạy (không kèm
  // trong bài nộp). Thiếu thư viện thì các ca liên quan được SKIP, không FAIL.
  const hasXlsxStyle = (() => {
    try { require.resolve('xlsx-js-style'); return true; } catch { return false; }
  })();
  const hasXlsx = (() => {
    try { require.resolve('xlsx'); return true; } catch { return false; }
  })();
  const hasExcelLib = hasXlsx || hasXlsxStyle;

  function assertFileWrite(testName, actual, expected) {
    if (!hasExcelLib) {
      skipped += 1;
      console.log(`SKIP: [${testName}] -> chưa cài gói xlsx (tùy chọn)`);
      return;
    }
    assertEqual(testName, actual, expected);
  }

  function assertStyle(testName, actual, expected) {
    if (!hasXlsxStyle) {
      skipped += 1;
      console.log(`SKIP: [${testName}] -> chưa cài xlsx-js-style (tùy chọn)`);
      return;
    }
    assertEqual(testName, actual, expected);
  }

  // Gọi Express middleware thật (không dựng lại logic) để kiểm tra 401/403/next.
  function callMiddlewareQA(middleware, req = {}) {
    const res = {
      statusCode: 200,
      body: null,
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.body = payload; return this; },
    };
    let nextCalled = false;
    middleware(req, res, () => { nextCalled = true; });
    return { status: res.statusCode, body: res.body, nextCalled };
  }

  // ─── Tests 1–5 (original) ────────────────────────────────────────────────

  // Test 1: GPA Calculation
  const avg = calculateAverageSubjectScore({ oral: 9, m15: 8, h1: 8, mid: 9, final: 8.5 });
  assertEqual('Test 1: GPA Weight Calculation', avg, 8.5);

  // Test 2: Academic Rank Evaluation (Thông tư 22: Tốt / Khá / Đạt / Chưa đạt)
  const rank = evaluateAcademicRank(8.5);
  assertEqual('Test 2: Academic Rank Evaluation', rank, 'Tốt');

  // Test 3: GPA 10 to 4 Scale Conversion
  const gpa4 = convertGPA10To4(8.7);
  assertEqual('Test 3: GPA 10/4 Scale Conversion', gpa4, 4.0);

  // Test 4: Excel Export Engine Validation
  // Ghi vào thư mục tạm và xác minh tệp .xlsx có thật trên đĩa — tránh trường hợp
  // thiếu SheetJS mà hàm vẫn trả success:true (thành công giả).
  const excelRes = exportGradeBookToExcel('10A1', 'Toán Học', [{ studentCode: 'HS001', fullName: 'Nguyễn Thị Ánh', averageScore: 8.7 }], TMP_DIR);
  assertEqual('Test 4a: Excel Export Row Count', excelRes.rowCount, 1);
  assertFileWrite('Test 4b: Excel Export có filePath', Boolean(excelRes.filePath), true);
  assertFileWrite('Test 4c: Tệp .xlsx tồn tại trên đĩa', Boolean(excelRes.filePath && fs.existsSync(excelRes.filePath)), true);

  // Test 5: PDF Report Card Engine Validation
  const pdfRes = exportReportCardToPDF({ studentCode: 'HS001', fullName: 'Nguyễn Thị Ánh', gpa: 8.7 });
  assertEqual('Test 5: PDF Report Card Success Status', pdfRes.success, true);

  // ─── Tests 6–17 (new: 15 UC implementations) ────────────────────────────

  // ─── Helper: mapScheduleSlot (UC-STU-03) ─────────────────────────────────
  /**
   * Maps a raw API schedule slot to the shape used by the timetable view.
   * weekStart defaults to the Monday of the current ISO week.
   */
  function mapScheduleSlot(apiSlot) {
    const now   = new Date();
    const day   = now.getDay(); // 0 = Sunday
    const diff  = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff)).toISOString().split('T')[0];
    return {
      id:          apiSlot.id,
      classId:     apiSlot.classId,
      dayOfWeek:   apiSlot.dayOfWeek,
      period:      apiSlot.period,
      subjectName: apiSlot.subjectName,
      teacherName: apiSlot.teacherName,
      room:        apiSlot.room,
      weekStart,
    };
  }

  // Test 6 — UC-STU-03: Schedule API slot mapping
  const rawSlot = { id: 1, classId: '10A1', dayOfWeek: 2, period: 3, subjectName: 'Toán', teacherName: 'GV Hùng', room: 'P.201' };
  const mappedSlot = mapScheduleSlot(rawSlot);
  assertEqual('Test 6a: Schedule slot dayOfWeek', mappedSlot.dayOfWeek, 2);
  assertEqual('Test 6b: Schedule slot period',    mappedSlot.period,    3);
  assertEqual('Test 6c: Schedule slot subject',   mappedSlot.subjectName, 'Toán');
  assertEqual('Test 6d: Schedule slot weekStart assigned', typeof mappedSlot.weekStart === 'string' && mappedSlot.weekStart.length === 10, true);

  // ─── Helper: mapGradeEntry (UC-STU-05) ───────────────────────────────────
  /**
   * Maps a raw API gradebook entry to the shape expected by the frontend.
   * semester: 'HK1' → 1, 'HK2' → 2.
   */
  function mapGradeEntry(apiEntry) {
    return {
      subjectName: apiEntry.subjectName,
      scores: {
        oral:    [apiEntry.scoreOral   ?? 0],
        m15:     [apiEntry.score15m    ?? 0],
        h1:      [apiEntry.score1hour  ?? 0],
        mid:     apiEntry.scoreMidTerm ?? 0,
        final:   apiEntry.scoreFinalTerm ?? 0,
        average: apiEntry.averageScore ?? 0,
      },
      semester: apiEntry.semester === 'HK2' ? 2 : 1,
    };
  }

  // Test 7 — UC-STU-05: Grade API mapping
  const rawGrade = { subjectName: 'Toán', scoreOral: 8, score15m: 7, score1hour: 8, scoreMidTerm: 8, scoreFinalTerm: 9, averageScore: 8.2, semester: 'HK1' };
  const mappedGrade = mapGradeEntry(rawGrade);
  assertEqual('Test 7a: Grade scores.oral[0]',  mappedGrade.scores.oral[0],  8);
  assertEqual('Test 7b: Grade scores.average',  mappedGrade.scores.average,  8.2);
  assertEqual('Test 7c: Grade semester',        mappedGrade.semester,        1);

  // ─── Helper: normalizeAttendanceStatus (UC-STU-06/07) ────────────────────
  function normalizeAttendanceStatus(status) {
    if (!status) return 'unknown';
    return status.toLowerCase();
  }

  // Test 8 — UC-STU-06/07: Attendance status normalization
  assertEqual('Test 8a: PRESENT → present', normalizeAttendanceStatus('PRESENT'), 'present');
  assertEqual('Test 8b: ABSENT → absent',   normalizeAttendanceStatus('ABSENT'),  'absent');
  assertEqual('Test 8c: LATE → late',       normalizeAttendanceStatus('LATE'),    'late');

  // ─── Helper: mapTuitionItem (UC-PAR-07/08) ───────────────────────────────
  function mapTuitionItem(apiItem) {
    return {
      id:     apiItem.id,
      name:   apiItem.item_name ?? apiItem.name,
      amount: apiItem.amount_due ?? apiItem.amount,
      status: (apiItem.payment_status ?? apiItem.status ?? '').toLowerCase(),
    };
  }

  // Test 9 — UC-PAR-07/08: Tuition item mapping
  const rawTuition = { id: 1, item_name: 'Học phí HK1', amount_due: 1500000, payment_status: 'PAID' };
  const mappedTuition = mapTuitionItem(rawTuition);
  assertEqual('Test 9a: Tuition id',     mappedTuition.id,     1);
  assertEqual('Test 9b: Tuition name',   mappedTuition.name,   'Học phí HK1');
  assertEqual('Test 9c: Tuition amount', mappedTuition.amount, 1500000);
  assertEqual('Test 9d: Tuition status', mappedTuition.status, 'paid');

  // ─── Helper: validateConductRank (UC-GVCN-07) ────────────────────────────
  // Hạnh kiểm theo Thông tư 22 (§9.1): Tốt / Khá / Đạt / Chưa đạt
  const VALID_CONDUCT_RANKS = ['Tốt', 'Khá', 'Đạt', 'Chưa đạt'];
  function validateConductRank(rank) {
    return typeof rank === 'string' && VALID_CONDUCT_RANKS.includes(rank);
  }

  // Test 10 — UC-GVCN-07: Conduct rank validation
  assertEqual('Test 10a: Tốt is valid',       validateConductRank('Tốt'),       true);
  assertEqual('Test 10b: Khá is valid',        validateConductRank('Khá'),        true);
  assertEqual('Test 10c: Đạt is valid',        validateConductRank('Đạt'),        true);
  assertEqual('Test 10d: Chưa đạt is valid',   validateConductRank('Chưa đạt'),   true);
  assertEqual('Test 10e: Xuất sắc is invalid', validateConductRank('Xuất sắc'),   false);
  assertEqual('Test 10f: empty is invalid',    validateConductRank(''),           false);

  // Test 11 — UC-GVCN-10/GVBM-10: Export GradeBook to Excel (3 students)
  const gradeData = [
    { studentCode: 'HS001', fullName: 'Nguyễn Thị Ánh',  averageScore: 8.5 },
    { studentCode: 'HS002', fullName: 'Trần Minh Khoa',  averageScore: 7.2 },
    { studentCode: 'HS003', fullName: 'Lê Hoàng Phúc',   averageScore: 6.8 },
  ];
  const excelResult = exportGradeBookToExcel('10A1', 'Toán', gradeData, TMP_DIR);
  assertEqual('Test 11a: Export Excel success',    excelResult.success,  true);
  assertEqual('Test 11b: Export Excel rowCount',   excelResult.rowCount, 3);
  assertEqual('Test 11c: Export Excel fileName prefix',
    excelResult.fileName.startsWith('SoDiem_'), true);
  // Xác minh tệp thật khi môi trường có SheetJS; thiếu thư viện thì SKIP
  assertFileWrite('Test 11d: Export Excel có filePath', Boolean(excelResult.filePath), true);
  assertFileWrite('Test 11e: Tệp Excel tồn tại trên đĩa', Boolean(excelResult.filePath && fs.existsSync(excelResult.filePath)), true);

  // Test 12 — UC-PAR-09: Export Tuition Receipt to PDF
  const receiptResult = exportTuitionReceiptToPDF({
    receiptNo:    'REC-2025-001',
    studentCode:  'HS001',
    amountPaid:   2060000,
    status:       'PAID',
  });
  assertEqual('Test 12a: Tuition receipt success',   receiptResult.success,   true);
  assertEqual('Test 12b: Tuition receipt receiptNo', receiptResult.receiptNo, 'REC-2025-001');

  // ─── Helper: validateReviewRequest (UC-GVBM-09) ──────────────────────────
  function validateReviewRequest(req) {
    if (!req || typeof req !== 'object') return false;
    const requiredFields = ['studentCode', 'subjectName', 'semester', 'reason'];
    return requiredFields.every(f => typeof req[f] === 'string' && req[f].trim().length > 0);
  }

  // Test 13 — UC-GVBM-09: Review request validation
  const validReview = { studentCode: 'HS001', subjectName: 'Toán', semester: 'HK1', reason: 'Bài thi bị chấm sai' };
  const invalidReview = { studentCode: 'HS001', subjectName: 'Toán', semester: 'HK1' }; // missing reason
  assertEqual('Test 13a: Valid review request',   validateReviewRequest(validReview),   true);
  assertEqual('Test 13b: Missing reason invalid', validateReviewRequest(invalidReview), false);

  // ─── Helper: calcTuitionSummary (UC-ADM-07) ──────────────────────────────
  function calcTuitionSummary(items = []) {
    const totalDue  = items.reduce((sum, i) => sum + (i.amountDue  ?? 0), 0);
    const totalPaid = items.reduce((sum, i) => sum + (i.amountPaid ?? 0), 0);
    return { totalDue, totalPaid, remaining: totalDue - totalPaid };
  }

  // Test 14 — UC-ADM-07: Tuition summary calculation
  const tuitionItems = [
    { amountDue: 1500000, amountPaid: 1500000, status: 'PAID'   },
    { amountDue:  800000, amountPaid:       0, status: 'UNPAID' },
  ];
  const summary = calcTuitionSummary(tuitionItems);
  assertEqual('Test 14a: totalDue',   summary.totalDue,   2300000);
  assertEqual('Test 14b: totalPaid',  summary.totalPaid,  1500000);
  assertEqual('Test 14c: remaining',  summary.remaining,   800000);

  // ─── Helper: isNotificationAccessibleForRole (UC-STU-04) ─────────────────
  // Roles that can receive notifications: HS (học sinh), BGH (ban giám hiệu), GVCN
  // Roles excluded: GV (giáo viên bộ môn only), PH (phụ huynh via separate channel)
  const NOTIFICATION_ROLES = new Set(['HS', 'BGH', 'GVCN']);
  function isNotificationAccessibleForRole(role) {
    return NOTIFICATION_ROLES.has(role);
  }

  // Test 15 — UC-STU-04: Notification role access check
  assertEqual('Test 15a: HS can access',   isNotificationAccessibleForRole('HS'),   true);
  assertEqual('Test 15b: BGH can access',  isNotificationAccessibleForRole('BGH'),  true);
  assertEqual('Test 15c: GVCN can access', isNotificationAccessibleForRole('GVCN'), true);
  assertEqual('Test 15d: GV no access',    isNotificationAccessibleForRole('GV'),   false);
  assertEqual('Test 15e: PH no access',    isNotificationAccessibleForRole('PH'),   false);

  // ─── Helper: validateLeaveRequest (UC-PAR-06) ────────────────────────────
  function validateLeaveRequest(req) {
    if (!req || typeof req !== 'object') return false;
    if (!req.fromDate || typeof req.fromDate !== 'string' || req.fromDate.trim() === '') return false;
    if (!req.toDate   || typeof req.toDate   !== 'string' || req.toDate.trim()   === '') return false;
    if (!req.reason   || typeof req.reason   !== 'string' || req.reason.trim()   === '') return false;
    return true;
  }

  // Test 16 — UC-PAR-06: Leave request validation
  const validLeave   = { fromDate: '2024-11-15', toDate: '2024-11-16', reason: 'Ốm' };
  const invalidLeave = { fromDate: '',            toDate: '2024-11-16', reason: 'Ốm' };
  assertEqual('Test 16a: Valid leave request',     validateLeaveRequest(validLeave),   true);
  assertEqual('Test 16b: Empty fromDate invalid',  validateLeaveRequest(invalidLeave), false);

  // Test 17 — Export Report Card to PDF (UC-GVCN-10 variant)
  const reportCardResult = exportReportCardToPDF(
    { studentCode: 'HS001', fullName: 'Nguyễn Thị Ánh', gpa: 8.5 },
    []
  );
  assertEqual('Test 17a: Report card success',     reportCardResult.success,     true);
  assertEqual('Test 17b: Report card studentCode', reportCardResult.studentCode, 'HS001');

  // ─── PBI-16: Phiếu báo điểm / Học bạ chuẩn Thông tư 22 ───────────────────

  // Test 18 — Xếp loại học lực 4 mức theo TT22
  assertEqual('Test 18a: GPA 8.0 → Tốt',       rankAcademicScore(8.0), 'Tốt');
  assertEqual('Test 18b: GPA 7.9 → Khá',       rankAcademicScore(7.9), 'Khá');
  assertEqual('Test 18c: GPA 6.5 → Khá',       rankAcademicScore(6.5), 'Khá');
  assertEqual('Test 18d: GPA 5.0 → Đạt',       rankAcademicScore(5.0), 'Đạt');
  assertEqual('Test 18e: GPA 4.9 → Chưa đạt',  rankAcademicScore(4.9), 'Chưa đạt');

  // Test 19 — Cấu trúc HTML học bạ: A4, quốc hiệu, tiêu ngữ, hạnh kiểm, nút in
  const fullGrades = [
    { subjectName: 'Toán Học',   scoreOral: 8, score15m: 7, score1hour: 8, scoreMidTerm: 8.5, scoreFinalTerm: 9, averageScore: 8.3 },
    { subjectName: 'Ngữ Văn',    scoreOral: 7, score15m: 7, score1hour: 6, scoreMidTerm: 6.5, scoreFinalTerm: 7, averageScore: 6.7 },
    { subjectName: 'Vật Lý',     scoreOral: 5, score15m: 4, score1hour: 5, scoreMidTerm: 4.5, scoreFinalTerm: 4, averageScore: 4.6 },
  ];
  const fullCard = exportReportCardToPDF(
    {
      studentCode: 'HS001', fullName: 'Nguyễn Thị Ánh', className: '10A1', gpa: 6.53,
      schoolYear: '2024-2025', semesterLabel: 'Học kỳ I', gvcnName: 'Lê Minh Châu',
    },
    fullGrades
  );
  const cardHtml = fullCard.htmlContent;
  assertEqual('Test 19a: Có khai báo khổ A4',          cardHtml.includes('size: A4'), true);
  assertEqual('Test 19b: Có quốc hiệu Sở GD&ĐT',       cardHtml.includes('SỞ GIÁO DỤC VÀ ĐÀO TẠO'), true);
  assertEqual('Test 19c: Có tiêu ngữ quốc gia',        cardHtml.includes('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'), true);
  assertEqual('Test 19d: Có khối hạnh kiểm',           cardHtml.includes('Hạnh kiểm'), true);
  assertEqual('Test 19e: Có khối xếp loại học lực',    cardHtml.includes('Xếp loại học lực'), true);
  assertEqual('Test 19f: Có lệnh window.print()',      cardHtml.includes('window.print()'), true);
  assertEqual('Test 19g: Đủ 6 đầu điểm mỗi môn',       cardHtml.includes('Miệng') && cardHtml.includes('15 phút') && cardHtml.includes('1 tiết') && cardHtml.includes('Giữa kỳ') && cardHtml.includes('Cuối kỳ') && cardHtml.includes('ĐTB'), true);
  assertEqual('Test 19h: Hạnh kiểm mặc định Tốt',      fullCard.conductRank, 'Tốt');
  assertEqual('Test 19i: Xếp loại học lực tự suy ra',  fullCard.academicRank, 'Khá');
  assertEqual('Test 19j: Điểm TB môn hiển thị 1 số lẻ', cardHtml.includes('8.3'), true);

  // ─── PBI-17b: Quy tắc đơn xin nghỉ học (BR-07) ───────────────────────────

  // Helper: kiểm tra ISO date thật (loại 2024-02-31) và khoảng ngày xuôi
  const LEAVE_CATEGORIES = ['Ốm', 'Việc gia đình', 'Khác'];
  function isValidIsoDateQA(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const d = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
  }
  function validateLeaveRequestQA(req) {
    if (!req || typeof req !== 'object') return false;
    if (!isValidIsoDateQA(req.fromDate) || !isValidIsoDateQA(req.toDate)) return false;
    if (new Date(req.toDate) < new Date(req.fromDate)) return false;
    if (!LEAVE_CATEGORIES.includes(req.reasonCategory)) return false;
    if (!String(req.reasonDetail ?? '').trim()) return false;
    if (req.periods !== undefined && (!Number.isInteger(req.periods) || req.periods < 1 || req.periods > 10)) return false;
    return true;
  }
  function defaultLeaveStatusQA(req) {
    return req.status ?? 'PENDING';
  }

  // Test 20 — PBI-17b: 3 lý do, khoảng ngày, số tiết, trạng thái mặc định
  assertEqual('Test 20a: Lý do Ốm hợp lệ',            validateLeaveRequestQA({ fromDate: '2026-11-16', toDate: '2026-11-17', reasonCategory: 'Ốm', reasonDetail: 'Sốt cao', periods: 8 }), true);
  assertEqual('Test 20b: Lý do Việc gia đình hợp lệ',  validateLeaveRequestQA({ fromDate: '2026-11-16', toDate: '2026-11-16', reasonCategory: 'Việc gia đình', reasonDetail: 'Đám giỗ', periods: 4 }), true);
  assertEqual('Test 20c: Lý do Khác hợp lệ',           validateLeaveRequestQA({ fromDate: '2026-11-16', toDate: '2026-11-16', reasonCategory: 'Khác', reasonDetail: 'Khám bệnh', periods: 2 }), true);
  assertEqual('Test 20d: Lý do ngoài danh mục bị chặn', validateLeaveRequestQA({ fromDate: '2026-11-16', toDate: '2026-11-16', reasonCategory: 'Đi chơi', reasonDetail: 'x', periods: 2 }), false);
  assertEqual('Test 20e: Ngày kết thúc trước ngày bắt đầu bị chặn', validateLeaveRequestQA({ fromDate: '2026-11-17', toDate: '2026-11-16', reasonCategory: 'Ốm', reasonDetail: 'x', periods: 4 }), false);
  assertEqual('Test 20f: Ngày không tồn tại (2026-02-31) bị chặn', validateLeaveRequestQA({ fromDate: '2026-02-31', toDate: '2026-03-01', reasonCategory: 'Ốm', reasonDetail: 'x' }), false);
  assertEqual('Test 20g: Số tiết ngoài 1..10 bị chặn', validateLeaveRequestQA({ fromDate: '2026-11-16', toDate: '2026-11-16', reasonCategory: 'Ốm', reasonDetail: 'x', periods: 11 }), false);
  assertEqual('Test 20h: Thiếu lý do chi tiết bị chặn', validateLeaveRequestQA({ fromDate: '2026-11-16', toDate: '2026-11-16', reasonCategory: 'Ốm', periods: 2 }), false);
  assertEqual('Test 20i: Đơn mới mặc định PENDING',    defaultLeaveStatusQA({ fromDate: '2026-11-16' }), 'PENDING');

  // ─── PBI-17c: Duyệt đơn + đồng bộ điểm danh EXCUSED (BR-07) ──────────────

  // Helper: quyết định duyệt đơn có kiểm tra vai trò + phạm vi lớp chủ nhiệm
  function resolveLeaveDecisionQA({ role, gvcnClassName, requestClassName }) {
    if (role !== 'GVCN') return { httpStatus: 403, reason: 'FORBIDDEN_ROLE' };
    if (gvcnClassName !== requestClassName) return { httpStatus: 403, reason: 'OUT_OF_SCOPE' };
    return { httpStatus: 200, reason: 'OK' };
  }

  // Helper: chỉ đơn APPROVED mới chuyển các ngày trong khoảng sang EXCUSED
  function syncAttendanceOnDecision(records, leaveDates, status) {
    if (status !== 'APPROVED') return records;
    return records.map((r) => (leaveDates.includes(r.date) ? { ...r, status: 'EXCUSED' } : r));
  }

  const attendanceRecords = [
    { date: '2026-11-16', status: 'UNEXCUSED' },
    { date: '2026-11-17', status: 'UNEXCUSED' },
    { date: '2026-11-18', status: 'UNEXCUSED' },
  ];

  // Test 21 — PBI-17c: Duyệt đơn & phạm vi GVCN
  const approvedRecords = syncAttendanceOnDecision(attendanceRecords, ['2026-11-16', '2026-11-17'], 'APPROVED');
  assertEqual('Test 21a: Ngày 16/11 chuyển EXCUSED',       approvedRecords[0].status, 'EXCUSED');
  assertEqual('Test 21b: Ngày 17/11 chuyển EXCUSED',       approvedRecords[1].status, 'EXCUSED');
  assertEqual('Test 21c: Ngày ngoài đơn giữ UNEXCUSED',    approvedRecords[2].status, 'UNEXCUSED');
  const rejectedRecords = syncAttendanceOnDecision(attendanceRecords, ['2026-11-16', '2026-11-17'], 'REJECTED');
  assertEqual('Test 21d: Đơn bị từ chối không đổi điểm danh', rejectedRecords[0].status, 'UNEXCUSED');
  assertEqual('Test 21e: GVCN đúng lớp được duyệt',        resolveLeaveDecisionQA({ role: 'GVCN', gvcnClassName: '10A1', requestClassName: '10A1' }).httpStatus, 200);
  assertEqual('Test 21f: GVCN khác lớp bị chặn 403',       resolveLeaveDecisionQA({ role: 'GVCN', gvcnClassName: '10A2', requestClassName: '10A1' }).httpStatus, 403);
  assertEqual('Test 21g: GV bộ môn không được duyệt 403',  resolveLeaveDecisionQA({ role: 'GV',   gvcnClassName: '10A1', requestClassName: '10A1' }).httpStatus, 403);

  // ─── KAN-133: Biên lai điện tử — duy nhất, có mã tra cứu, tra cứu 404 ────

  // Helper: tra cứu biên lai theo mã tra cứu (mô phỏng endpoint GET /receipts/:code)
  function findReceiptQA(receipts, lookupCode) {
    const found = receipts.find((r) => r.lookupCode === lookupCode);
    return found ? { httpStatus: 200, receipt: found } : { httpStatus: 404 };
  }

  const receiptA = exportTuitionReceiptToPDF({ studentCode: 'HS001', amountPaid: 2060000, paymentId: 'PAY-0001' });
  const receiptB = exportTuitionReceiptToPDF({ studentCode: 'HS001', amountPaid: 2060000, paymentId: 'PAY-0002' });
  const receiptC = exportTuitionReceiptToPDF({ studentCode: 'HS002', amountPaid: 500000 });
  const receiptD = exportTuitionReceiptToPDF({ studentCode: 'HS002', amountPaid: 500000 });

  // Test 22 — KAN-133 DoD: mỗi giao dịch sinh một biên lai duy nhất kèm mã tra cứu
  assertEqual('Test 22a: Mã GD khác nhau → số biên lai khác nhau', receiptA.receiptNo !== receiptB.receiptNo, true);
  assertEqual('Test 22b: Không có mã GD vẫn không trùng số biên lai', receiptC.receiptNo !== receiptD.receiptNo, true);
  assertEqual('Test 22c: Số biên lai mang mã giao dịch', receiptA.receiptNo, 'BL-HS001-PAY-0001');
  assertEqual('Test 22d: Có mã tra cứu dạng TC-', /^TC-[A-Z0-9]{8}-[A-Z0-9]{4}$/.test(receiptA.lookupCode), true);
  assertEqual('Test 22e: Mã tra cứu tất định theo số biên lai', generateReceiptLookupCode(receiptA.receiptNo), receiptA.lookupCode);
  assertEqual('Test 22f: Biên lai khác nhau → mã tra cứu khác nhau', receiptA.lookupCode !== receiptB.lookupCode, true);
  assertEqual('Test 22g: Biên lai in kèm mã tra cứu', receiptA.htmlContent.includes('Mã tra cứu'), true);
  assertEqual('Test 22h: Biên lai in kèm phương thức thanh toán', receiptA.htmlContent.includes('Phương thức'), true);
  assertEqual('Test 22i: Tra cứu mã hợp lệ → 200', findReceiptQA([receiptA, receiptB], receiptB.lookupCode).httpStatus, 200);
  assertEqual('Test 22j: Tra cứu mã không tồn tại → 404', findReceiptQA([receiptA, receiptB], 'TC-KHONGCO-0000').httpStatus, 404);

  // ─── EPIC-10 / KAN-111: Thống kê phổ điểm toàn trường ────────────────────

  const schoolStudents = [
    { studentCode: 'HS001', className: '10A1', gradeLevel: 10, gpa: 9.0 },
    { studentCode: 'HS002', className: '10A1', gradeLevel: 10, gpa: 8.5 },
    { studentCode: 'HS003', className: '10A1', gradeLevel: 10, gpa: 7.0 },
    { studentCode: 'HS004', className: '10A1', gradeLevel: 10, gpa: 4.0 },
    { studentCode: 'HS005', className: '11A1', gradeLevel: 11, gpa: 6.5 },
    { studentCode: 'HS006', className: '11A1', gradeLevel: 11, gpa: 5.0 },
  ];
  const distribution = buildScoreDistribution(schoolStudents, 'gradeLevel');

  // Test 23 — Phổ điểm theo khối, 4 mức Thông tư 22
  assertEqual('Test 23a: Số nhóm khối', distribution.length, 2);
  assertEqual('Test 23b: Khối 10 — sĩ số', distribution[0].total, 4);
  assertEqual('Test 23c: Khối 10 — Tốt', distribution[0].tot, 2);
  assertEqual('Test 23d: Khối 10 — Khá', distribution[0].kha, 1);
  assertEqual('Test 23e: Khối 10 — Đạt', distribution[0].dat, 0);
  assertEqual('Test 23f: Khối 10 — Chưa đạt', distribution[0].chuadat, 1);
  assertEqual('Test 23g: Khối 10 — %Tốt', distribution[0].totPct, 50);
  assertEqual('Test 23h: Khối 11 — %Đạt', distribution[1].datPct, 50);
  const schoolWide = buildScoreDistribution(schoolStudents, 'school');
  assertEqual('Test 23i: Toàn trường gộp 1 nhóm', schoolWide.length, 1);
  assertEqual('Test 23j: Toàn trường — sĩ số', schoolWide[0].total, 6);

  // Test 24 — Xuất Excel phổ điểm có dòng tổng cộng
  const distExport = exportScoreDistributionToExcel(schoolStudents, { groupBy: 'gradeLevel', outputDir: TMP_DIR });
  assertEqual('Test 24a: Xuất phổ điểm thành công', distExport.success, true);
  assertEqual('Test 24b: Tên tệp phổ điểm', distExport.fileName, 'Pho_Diem_Theo_Khoi.xlsx');
  assertEqual('Test 24c: Số nhóm dữ liệu', distExport.rowCount, 2);
  assertEqual('Test 24d: Có dòng tổng cộng cuối', distExport.rows[distExport.rows.length - 1].group, 'Toàn trường');
  assertEqual('Test 24e: Tổng sĩ số khớp', distExport.rows[distExport.rows.length - 1].total, 6);
  // Chốt chặn "thành công giả": phải có tệp thật trong thư mục tạm
  assertFileWrite('Test 24f: Phổ điểm có filePath', Boolean(distExport.filePath), true);
  assertFileWrite('Test 24g: Tệp phổ điểm tồn tại trên đĩa', Boolean(distExport.filePath && fs.existsSync(distExport.filePath)), true);

  // Học sinh chưa có điểm không được xếp vào "Chưa đạt" (tránh thổi phồng
  // phổ điểm và danh sách rèn luyện hè).
  const distWithUngraded = buildScoreDistribution([
    ...schoolStudents,
    { studentCode: 'HS007', className: '11A1', gradeLevel: 11 },
  ], 'gradeLevel');
  const grade11WithUngraded = distWithUngraded.find((row) => row.group === 11);
  assertEqual('Test 24h: HS chưa có điểm không bị tính là Chưa đạt', grade11WithUngraded.chuadat, 0);
  assertEqual('Test 24i: HS chưa có điểm vào bucket riêng', grade11WithUngraded.chuaCoDiem, 1);
  assertEqual('Test 24j: Tỷ lệ xếp loại tính trên số HS có điểm', grade11WithUngraded.datPct, 50);

  // ─── KAN-133: Tra cứu lịch sử nộp học phí nhiều năm ──────────────────────

  // Helper: lọc lịch sử biên lai theo học sinh + năm học, mới nhất trước
  function filterReceiptHistoryQA(receipts, { studentCode, schoolYear } = {}) {
    return receipts
      .filter((r) => (!studentCode || r.studentCode === studentCode))
      .filter((r) => (!schoolYear || r.schoolYear === schoolYear))
      .sort((a, b) => String(b.paidAt).localeCompare(String(a.paidAt)));
  }

  const receiptHistory = [
    { receiptNo: 'BL-HS001-2024-01', studentCode: 'HS001', schoolYear: '2024-2025', paidAt: '2024-10-01', amount: 1500000 },
    { receiptNo: 'BL-HS001-2024-02', studentCode: 'HS001', schoolYear: '2024-2025', paidAt: '2025-01-15', amount: 800000 },
    { receiptNo: 'BL-HS001-2025-01', studentCode: 'HS001', schoolYear: '2025-2026', paidAt: '2025-09-10', amount: 2100000 },
    { receiptNo: 'BL-HS002-2025-01', studentCode: 'HS002', schoolYear: '2025-2026', paidAt: '2025-09-12', amount: 2100000 },
  ];

  // Test 25 — Lịch sử học phí nhiều năm theo học sinh
  assertEqual('Test 25a: HS001 có 3 biên lai', filterReceiptHistoryQA(receiptHistory, { studentCode: 'HS001' }).length, 3);
  assertEqual('Test 25b: Lọc theo năm học 2024-2025', filterReceiptHistoryQA(receiptHistory, { studentCode: 'HS001', schoolYear: '2024-2025' }).length, 2);
  assertEqual('Test 25c: Biên lai mới nhất đứng đầu', filterReceiptHistoryQA(receiptHistory, { studentCode: 'HS001' })[0].receiptNo, 'BL-HS001-2025-01');
  assertEqual('Test 25d: Không lẫn biên lai học sinh khác', filterReceiptHistoryQA(receiptHistory, { studentCode: 'HS001' }).every((r) => r.studentCode === 'HS001'), true);
  assertEqual('Test 25e: Học sinh không có biên lai → rỗng', filterReceiptHistoryQA(receiptHistory, { studentCode: 'HS999' }).length, 0);

  // ─── PBI-23 / EPIC-04: Phổ điểm từng môn + xét khen thưởng & rèn luyện hè ─

  const awardStudents = [
    {
      studentCode: 'HS001', fullName: 'Nguyễn Thị Ánh', className: '10A1', gradeLevel: 10, conductRank: 'Tốt',
      subjects: [
        { subjectName: 'Toán', averageScore: 9.0 },
        { subjectName: 'Ngữ văn', averageScore: 8.2 },
      ],
    },
    {
      studentCode: 'HS002', fullName: 'Trần Bảo Long', className: '10A1', gradeLevel: 10, conductRank: 'Tốt',
      subjects: [
        { subjectName: 'Toán', averageScore: 7.1 },
        { subjectName: 'Ngữ văn', averageScore: 6.0 },
      ],
    },
    {
      studentCode: 'HS003', fullName: 'Lê Minh Khoa', className: '10A2', gradeLevel: 10, conductRank: 'Yếu',
      subjects: [
        { subjectName: 'Toán', averageScore: 4.5 },
        { subjectName: 'Ngữ văn', averageScore: 8.5 },
      ],
    },
  ];

  // Test 26 — Phổ điểm từng môn (biểu đồ BGH)
  const subjectDist = buildSubjectScoreDistribution(awardStudents);
  const toanDist = subjectDist.find((row) => row.subject === 'Toán');
  const vanDist  = subjectDist.find((row) => row.subject === 'Ngữ văn');
  assertEqual('Test 26a: Có 2 môn', subjectDist.length, 2);
  assertEqual('Test 26b: Sĩ số môn Toán', toanDist.total, 3);
  assertEqual('Test 26c: Môn Toán — Tốt', toanDist.tot, 1);
  assertEqual('Test 26d: Môn Toán — Chưa đạt', toanDist.chuadat, 1);
  assertEqual('Test 26e: Môn Ngữ văn — Đạt (6.0)', vanDist.dat, 1);
  assertEqual('Test 26f: Lọc theo lớp 10A1 — sĩ số Toán', buildSubjectScoreDistribution(awardStudents, { filter: { className: '10A1' } }).find((row) => row.subject === 'Toán').total, 2);
  assertEqual('Test 26g: Lọc theo khối 11 → không có môn', buildSubjectScoreDistribution(awardStudents, { gradeLevel: 11 }).length, 0);

  // Test 27 — Danh sách Học sinh Xuất sắc & cần rèn luyện hè
  const awards = buildAwardLists(awardStudents);
  assertEqual('Test 27a: Học sinh Xuất sắc — đúng 1 em', awards.excellent.length, 1);
  assertEqual('Test 27b: Đúng HS001', awards.excellent[0].studentCode, 'HS001');
  assertEqual('Test 27c: Hạnh kiểm HS002 không phải Yếu → không vào rèn luyện hè', awards.summerTraining.length, 1);
  assertEqual('Test 27d: HS003 vào danh sách rèn luyện hè', awards.summerTraining[0].studentCode, 'HS003');
  assertEqual('Test 27e: Lý do gồm môn Chưa đạt + hạnh kiểm Yếu', awards.summerTraining[0].reason.includes('Toán') && awards.summerTraining[0].reason.includes('Hạnh kiểm: Yếu'), true);
  assertEqual('Test 27f: Lọc theo lớp 10A2 chỉ còn HS003', buildAwardLists(awardStudents, { filter: { className: '10A2' } }).excellent.length, 0);
  assertEqual('Test 27g: Phạm vi báo cáo toàn trường', awards.scope, 'Toàn trường');

  // Test 28 — Xuất báo cáo BGH ra Excel (3 sheet)
  const awardExport = exportAwardReportToExcel(awardStudents, { filter: { className: '10A1' }, outputDir: TMP_DIR });
  assertEqual('Test 28a: Xuất báo cáo BGH thành công', awardExport.success, true);
  assertEqual('Test 28b: Tên tệp theo phạm vi lớp', awardExport.fileName, 'Bao_Cao_BGH_Lop_10A1.xlsx');
  assertEqual('Test 28c: Số dòng phổ điểm môn', awardExport.rowCount, 2);
  assertEqual('Test 28d: Chỉ còn HS001 trong danh sách Xuất sắc', awardExport.excellent.length, 1);
  assertEqual('Test 28e: Lớp 10A1 không có ai phải rèn luyện hè', awardExport.summerTraining.length, 0);
  // Báo cáo 3 sheet cũng phải ghi ra tệp thật, không chỉ trả object
  assertFileWrite('Test 28f: Báo cáo BGH có filePath', Boolean(awardExport.filePath), true);
  assertFileWrite('Test 28g: Tệp báo cáo BGH tồn tại trên đĩa', Boolean(awardExport.filePath && fs.existsSync(awardExport.filePath)), true);

  // ─── KAN-22: Chịu tải 5 request đồng thời (Connection Pool) ──────────────

  // Giả lập pool: tối đa `max` kết nối, phần dư xếp hàng thay vì bị từ chối
  function createPoolQA(max = 5) {
    return { max, active: 0, queued: [], peak: 0, rejected: 0 };
  }

  function acquirePoolQA(pool) {
    if (pool.active < pool.max) {
      pool.active += 1;
      pool.peak = Math.max(pool.peak, pool.active);
      return 'ACQUIRED';
    }
    pool.queued.push('WAITING');
    return 'QUEUED';
  }

  function releasePoolQA(pool) {
    if (pool.queued.length > 0) {
      pool.queued.pop();
      return 'ACQUIRED';
    }
    pool.active = Math.max(0, pool.active - 1);
    return 'RELEASED';
  }

  // Test 29 — 10 truy vấn dồn dập, pool 5 kết nối không cạn kiệt
  const pool = createPoolQA(5);
  const firstFive = Array.from({ length: 5 }, () => acquirePoolQA(pool));
  const overflow = Array.from({ length: 5 }, () => acquirePoolQA(pool));
  assertEqual('Test 29a: 5 request đầu lấy được kết nối', firstFive.every((s) => s === 'ACQUIRED'), true);
  assertEqual('Test 29b: 5 request sau bị xếp hàng chứ không lỗi', overflow.every((s) => s === 'QUEUED'), true);
  assertEqual('Test 29c: Không request nào bị từ chối', pool.rejected, 0);
  assertEqual('Test 29d: Số kết nối đồng thời không vượt hạn mức', pool.peak, 5);
  assertEqual('Test 29e: Hàng đợi có 5 request chờ', pool.queued.length, 5);
  releasePoolQA(pool);
  assertEqual('Test 29f: Trả kết nối → request chờ được phục vụ', pool.queued.length, 4);
  assertEqual('Test 29g: Kết nối active vẫn trong hạn mức', pool.active <= pool.max, true);

  // ─── KAN-24: Phòng thủ brute-force mật khẩu (Rate Limiter 429) ───────────

  function createRateLimiterQA({ maxAttempts = 5, windowMs = 60000 } = {}) {
    return { maxAttempts, windowMs, hits: new Map() };
  }

  // Trả 401 cho lần sai trong hạn mức, 429 khi vượt; khoá hết hạn theo window
  function attemptLoginQA(limiter, key, now) {
    const entry = limiter.hits.get(key);
    if (!entry || now - entry.start >= limiter.windowMs) {
      limiter.hits.set(key, { count: 1, start: now });
      return 401;
    }
    entry.count += 1;
    return entry.count > limiter.maxAttempts ? 429 : 401;
  }

  const limiter = createRateLimiterQA({ maxAttempts: 5, windowMs: 60000 });
  const t0 = 1_000_000;
  const attempts = Array.from({ length: 6 }, (_, i) => attemptLoginQA(limiter, 'ip:10.0.0.1', t0 + i * 1000));
  assertEqual('Test 30a: 5 lần sai đầu trả 401', attempts.slice(0, 5).every((code) => code === 401), true);
  assertEqual('Test 30b: Lần thứ 6 bị chặn 429', attempts[5], 429);
  assertEqual('Test 30c: IP khác không bị ảnh hưởng', attemptLoginQA(limiter, 'ip:10.0.0.2', t0 + 6000), 401);
  assertEqual('Test 30d: Hết cửa sổ thời gian → được thử lại', attemptLoginQA(limiter, 'ip:10.0.0.1', t0 + 61000), 401);
  assertEqual('Test 30e: Sai tiếp trong cửa sổ mới bị đếm lại', attemptLoginQA(limiter, 'ip:10.0.0.1', t0 + 62000), 401);

  // ─── PBI-05: Điểm danh chuyên cần 4 trạng thái (GVCN) ────────────────────

  const ATTENDANCE_STATUSES_QA = ['PRESENT', 'EXCUSED', 'ABSENT', 'LATE'];

  // Mở trang điểm danh: mặc định toàn bộ học sinh "Có mặt"
  function buildAttendanceSheetQA(students) {
    return students.map((s) => ({ studentCode: s.studentCode, status: 'PRESENT' }));
  }

  // Lưu lịch sử điểm danh: chỉ nhận 4 trạng thái hợp lệ, gắn ngày + người ghi
  function saveAttendanceQA(records, { date, recordedBy }) {
    const saved = [];
    let rejected = 0;
    records.forEach((r) => {
      if (!ATTENDANCE_STATUSES_QA.includes(r.status)) { rejected += 1; return; }
      saved.push({ ...r, date, recordedBy });
    });
    return { saved, rejected };
  }

  // Cổng phụ huynh chỉ hiển thị ghi chú cho học sinh vắng KHÔNG PHÉP
  function parentAbsenceNotesQA(records) {
    return records
      .filter((r) => r.status === 'ABSENT')
      .map((r) => `${r.studentCode}: Vắng không phép ngày ${r.date}`);
  }

  const classStudents = [{ studentCode: 'HS001' }, { studentCode: 'HS002' }, { studentCode: 'HS003' }];
  const attendanceSheet = buildAttendanceSheetQA(classStudents);
  assertEqual('Test 31a: Mặc định tất cả Có mặt', attendanceSheet.every((r) => r.status === 'PRESENT'), true);
  assertEqual('Test 31b: Cả 4 trạng thái đều lưu được', saveAttendanceQA(
    ATTENDANCE_STATUSES_QA.map((status) => ({ studentCode: 'HS010', status })),
    { date: '2026-11-17', recordedBy: 'gvcn.10a1' },
  ).saved.length, 4);
  assertEqual('Test 31c: Trạng thái lạ "NGHI" bị từ chối', ATTENDANCE_STATUSES_QA.includes('NGHI'), false);

  const attendanceSave = saveAttendanceQA(
    [
      { studentCode: 'HS001', status: 'PRESENT' },
      { studentCode: 'HS002', status: 'ABSENT' },
      { studentCode: 'HS003', status: 'EXCUSED' },
      { studentCode: 'HS004', status: 'LATE' },
      { studentCode: 'HS005', status: 'NGHI' },
    ],
    { date: '2026-11-17', recordedBy: 'gvcn.10a1' },
  );
  assertEqual('Test 31d: Lưu đúng 4 bản ghi hợp lệ', attendanceSave.saved.length, 4);
  assertEqual('Test 31e: Từ chối 1 trạng thái không hợp lệ', attendanceSave.rejected, 1);
  assertEqual('Test 31f: Bản ghi có ngày điểm danh', attendanceSave.saved[0].date, '2026-11-17');
  assertEqual('Test 31g: Bản ghi có người thực hiện', attendanceSave.saved[0].recordedBy, 'gvcn.10a1');

  const absenceNotes = parentAbsenceNotesQA(attendanceSave.saved);
  assertEqual('Test 31h: Cổng PH chỉ báo vắng không phép', absenceNotes.length, 1);
  assertEqual('Test 31i: Đúng học sinh vắng không phép', absenceNotes[0].startsWith('HS002'), true);
  assertEqual('Test 31j: Vắng có phép không sinh cảnh báo', absenceNotes.some((n) => n.startsWith('HS003')), false);

  // ─── PBI-07 / KAN-13: Cảnh báo vắng ≥ 20% (nguy cơ cấm thi) ──────────────

  // Tỷ lệ vắng = (số buổi vắng / tổng số buổi học) × 100%, làm tròn 1 chữ số
  function computeAbsenceRateQA(absentSessions, totalSessions) {
    if (!totalSessions || totalSessions <= 0) return 0;
    return Math.round((absentSessions / totalSessions) * 1000) / 10;
  }

  function absenceBadgeQA(absentSessions, totalSessions) {
    return computeAbsenceRateQA(absentSessions, totalSessions) >= 20 ? 'danger' : 'normal';
  }

  assertEqual('Test 32a: 10/45 buổi = 22.2%', computeAbsenceRateQA(10, 45), 22.2);
  assertEqual('Test 32b: 22.2% → cảnh báo đỏ', absenceBadgeQA(10, 45), 'danger');
  assertEqual('Test 32c: Đúng ngưỡng 20% (9/45) → cảnh báo', absenceBadgeQA(9, 45), 'danger');
  assertEqual('Test 32d: 9/45 = 20%', computeAbsenceRateQA(9, 45), 20);
  assertEqual('Test 32e: Dưới ngưỡng 8/45 = 17.8% → không cảnh báo', absenceBadgeQA(8, 45), 'normal');
  assertEqual('Test 32f: Vắng 0 buổi → 0% và không cảnh báo', absenceBadgeQA(0, 45), 'normal');
  assertEqual('Test 32g: Tổng buổi = 0 không chia cho 0', computeAbsenceRateQA(0, 0), 0);

  // ─── KAN-12: Chặn điểm danh sai tiết / trùng tiết (GVBM) ─────────────────

  const gvbmAssignment = { teacherId: 'gv.toan01', className: '10A1', subject: 'Toán', period: 2 };

  // GVBM chỉ được điểm danh đúng lớp + đúng tiết được phân công, và không trùng
  // tiết với một lớp khác trong cùng ngày.
  function canRecordPeriodAttendanceQA({ role, teacherId, assignment, className, date, period, existing }) {
    if (role !== 'GVBM') return { httpStatus: 403, reason: 'FORBIDDEN_ROLE' };
    if (assignment.className !== className || assignment.period !== period) {
      return { httpStatus: 403, reason: 'WRONG_PERIOD' };
    }
    const clash = existing.some((e) => e.teacherId === teacherId && e.date === date
      && e.period === period && e.className !== className);
    if (clash) return { httpStatus: 409, reason: 'DUPLICATE_SLOT' };
    return { httpStatus: 200, reason: 'OK' };
  }

  const otherSlot = [{ teacherId: 'gv.toan01', className: '10A2', date: '2026-11-17', period: 2 }];
  assertEqual('Test 33a: Điểm danh đúng tiết được phân công → 200', canRecordPeriodAttendanceQA({
    role: 'GVBM', teacherId: 'gv.toan01', assignment: gvbmAssignment,
    className: '10A1', date: '2026-11-17', period: 2, existing: [],
  }).httpStatus, 200);
  assertEqual('Test 33b: Sai tiết bị chặn 403', canRecordPeriodAttendanceQA({
    role: 'GVBM', teacherId: 'gv.toan01', assignment: gvbmAssignment,
    className: '10A1', date: '2026-11-17', period: 3, existing: [],
  }).httpStatus, 403);
  assertEqual('Test 33c: Trùng tiết với lớp khác → 409', canRecordPeriodAttendanceQA({
    role: 'GVBM', teacherId: 'gv.toan01', assignment: gvbmAssignment,
    className: '10A1', date: '2026-11-17', period: 2, existing: otherSlot,
  }).httpStatus, 409);
  assertEqual('Test 33d: Khác ngày không tính trùng tiết', canRecordPeriodAttendanceQA({
    role: 'GVBM', teacherId: 'gv.toan01', assignment: gvbmAssignment,
    className: '10A1', date: '2026-11-18', period: 2, existing: otherSlot,
  }).httpStatus, 200);
  assertEqual('Test 33e: GVCN không dùng chức năng điểm danh theo tiết → 403',
    callMiddlewareQA(authorizeRoles('GVBM'), { user: { role: ROLES.GVCN } }).status, 403);

  // ─── PBI-13: Nhật ký kiểm toán sửa điểm (module AuditLogger thật) ─────────
  // Dùng chính AuditLogger của backend thay vì object mô phỏng, để thay đổi
  // hợp đồng ghi log ở member3 làm bộ test đỏ ngay.

  const auditBefore = AuditLogger.getAuditLogs().length;
  const auditEntityBefore = AuditLogger.getAuditLogs({ user: 'gv.toan01' })
    .filter((entry) => entry.entityId === 'HS00001').length;
  const auditEntry = AuditLogger.log({
    action: 'UPDATE_SCORE',
    user: 'gv.toan01',
    role: 'GVBM',
    entity: 'grade_books',
    entityId: 'HS00001',
    previousValue: 7.5,
    newValue: 8.0,
    ipAddress: '192.168.1.15',
  });
  assertEqual('Test 34a: Ghi old_score = 7.5', auditEntry.previousValue, 7.5);
  assertEqual('Test 34b: Ghi new_score = 8.0', auditEntry.newValue, 8.0);
  assertEqual('Test 34c: Ghi đúng user_id', auditEntry.user, 'gv.toan01');
  assertEqual('Test 34d: Ghi đúng student_id', auditEntry.entityId, 'HS00001');
  assertEqual('Test 34e: Ghi IP người thực hiện', auditEntry.ipAddress, '192.168.1.15');
  assertEqual('Test 34f: Timestamp ISO 8601',
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(auditEntry.timestamp), true);
  assertEqual('Test 34g: AuditLogger không mở API UPDATE', typeof AuditLogger.update, 'undefined');
  assertEqual('Test 34h: AuditLogger không mở API DELETE', typeof AuditLogger.delete, 'undefined');
  assertEqual('Test 34i: Tra cứu lại thấy thêm đúng 1 bản ghi',
    AuditLogger.getAuditLogs({ user: 'gv.toan01' }).filter((entry) => entry.entityId === 'HS00001').length,
    auditEntityBefore + 1);
  assertEqual('Test 34j: id tự tăng theo số bản ghi', auditEntry.id, auditBefore + 1);

  // ─── PBI-09 / KAN-16: 5 ca điểm TBM theo Thông tư 22 ─────────────────────

  assertEqual('Test 35a: Ca thường (7,8,6,9,8) → 7.7',
    calculateAverageSubjectScore({ oral: 7, m15: 8, h1: 6, mid: 9, final: 8 }), 7.7);
  assertEqual('Test 35b: Ca biên dưới — tất cả 0.0 → 0',
    calculateAverageSubjectScore({ oral: 0, m15: 0, h1: 0, mid: 0, final: 0 }), 0);
  assertEqual('Test 35c: Ca biên trên — tất cả 10.0 → 10',
    calculateAverageSubjectScore({ oral: 10, m15: 10, h1: 10, mid: 10, final: 10 }), 10);
  assertEqual('Test 35d: Điểm khống (chưa nhập) coi như 0 → 4.8',
    calculateAverageSubjectScore({ mid: 8, final: 9 }), 4.8);
  assertEqual('Test 35e: Làm tròn 77/9 = 8.555… → 8.6',
    calculateAverageSubjectScore({ oral: 8, m15: 8, h1: 8, mid: 9, final: 9 }), 8.6);
  assertEqual('Test 35f: TBM 7.7 xếp loại Khá', evaluateAcademicRank(7.7), 'Khá');
  assertEqual('Test 35g: TBM 10.0 xếp loại Tốt', evaluateAcademicRank(10), 'Tốt');

  // ─── PBI-19: Ma trận phân quyền RBAC 5 vai trò (middleware thật) ─────────
  // Ma trận endpoint của hệ thống chỉ là dữ liệu đầu vào; hành vi 401/403/next
  // do chính rbacMiddleware.js của member4 quyết định.

  const ROLE_ENDPOINTS_QA = {
    BGH:  ['/api/students', '/api/gradebook', '/api/attendance', '/api/audit-logs'],
    GVCN: ['/api/gradebook', '/api/attendance', '/api/leave-requests'],
    GVBM: ['/api/gradebook', '/api/attendance'],
    HS:   ['/api/grades/me', '/api/schedule'],
    PH:   ['/api/tuition', '/api/parent-portal'],
  };
  const rolesForEndpointQA = (apiPath) => Object.keys(ROLE_ENDPOINTS_QA)
    .filter((role) => ROLE_ENDPOINTS_QA[role].includes(apiPath));
  const guardQA = (apiPath) => authorizeRoles(...rolesForEndpointQA(apiPath));

  const noTokenCases = Object.keys(ROLE_ENDPOINTS_QA)
    .map((role) => callMiddlewareQA(authorizeRoles(role), {}).status);
  assertEqual('Test 36a: Thiếu token → 401 với cả 5 vai trò', noTokenCases.every((code) => code === 401), true);
  assertEqual('Test 36b: HS gọi /api/students → 403',
    callMiddlewareQA(guardQA('/api/students'), { user: { role: ROLES.HS } }).status, 403);
  assertEqual('Test 36c: PH gọi /api/students → 403',
    callMiddlewareQA(guardQA('/api/students'), { user: { role: ROLES.PH } }).status, 403);
  assertEqual('Test 36d: GVBM gọi /api/gradebook → đi tiếp',
    callMiddlewareQA(guardQA('/api/gradebook'), { user: { role: 'GVBM' } }).nextCalled, true);
  assertEqual('Test 36e: GVCN duyệt đơn /api/leave-requests → đi tiếp',
    callMiddlewareQA(guardQA('/api/leave-requests'), { user: { role: ROLES.GVCN } }).nextCalled, true);
  assertEqual('Test 36f: BGH xem /api/audit-logs → đi tiếp',
    callMiddlewareQA(guardQA('/api/audit-logs'), { user: { role: ROLES.BGH } }).nextCalled, true);
  assertEqual('Test 36g: Vai trò lạ bị chặn 403',
    callMiddlewareQA(guardQA('/api/gradebook'), { user: { role: 'GUEST' } }).status, 403);

  // Quét 5 vai trò × toàn bộ endpoint: middleware thật phải cho qua đúng role
  // trong ma trận và trả 403 cho mọi role còn lại.
  const matrixPaths = [...new Set(Object.values(ROLE_ENDPOINTS_QA).flat())];
  let matrixMismatch = 0;
  Object.keys(ROLE_ENDPOINTS_QA).forEach((role) => {
    matrixPaths.forEach((apiPath) => {
      const result = callMiddlewareQA(guardQA(apiPath), { user: { role } });
      const expectedAllowed = ROLE_ENDPOINTS_QA[role].includes(apiPath);
      if (expectedAllowed !== result.nextCalled || (!expectedAllowed && result.status !== 403)) {
        matrixMismatch += 1;
      }
    });
  });
  assertEqual('Test 36h: Ma trận 5 vai trò × toàn bộ endpoint khớp middleware thật', matrixMismatch, 0);

  // ─── PBI-15: Tên tệp + định dạng Excel sổ điểm ──────────────────────────

  const pbi15Export = exportGradeBookToExcel('10A1', 'Toán Học', gradeData, TMP_DIR, 'HK1');
  assertEqual('Test 37a: Tên tệp SoDiem_10A1_ToánHọc_HK1.xlsx', pbi15Export.fileName, 'SoDiem_10A1_ToánHọc_HK1.xlsx');
  assertEqual('Test 37b: Học kỳ HK2 đổi đúng tên tệp',
    exportGradeBookToExcel('10A1', 'Toán Học', gradeData, TMP_DIR, 'HK2').fileName, 'SoDiem_10A1_ToánHọc_HK2.xlsx');
  assertFileWrite('Test 37c: Xuất sổ điểm có filePath', Boolean(pbi15Export.filePath), true);

  // Style ô chỉ ghi được khi môi trường có xlsx-js-style (fork của SheetJS).
  // Đọc lại chính tệp trên đĩa để xác minh, không tin object trả về.
  let styledBook = null;
  if (hasXlsxStyle && pbi15Export.filePath) {
    const XLSX_STYLE = require('xlsx-js-style');
    styledBook = XLSX_STYLE.readFile(pbi15Export.filePath, { cellStyles: true, bookFiles: true });
  }
  const stylesXml = styledBook ? Buffer.from(styledBook.files['xl/styles.xml'].content).toString('utf8') : '';
  const styledSheet = styledBook ? styledBook.Sheets[styledBook.SheetNames[0]] : {};

  assertStyle('Test 37d: styles.xml có font in đậm', stylesXml.includes('<b/>'), true);
  assertStyle('Test 37e: styles.xml có màu header D9E1F2', stylesXml.includes('FFD9E1F2'), true);
  assertStyle('Test 37f: styles.xml có màu hàng xen kẽ F2F2F2', stylesXml.includes('FFF2F2F2'), true);
  assertStyle('Test 37g: Ô tiêu đề A1 nền xanh nhạt', styledSheet.A1?.s?.fgColor?.rgb, 'D9E1F2');
  assertStyle('Test 37h: Hàng dữ liệu đầu (A2) nền trắng', styledSheet.A2?.s?.patternType ?? 'none', 'none');
  assertStyle('Test 37i: Hàng dữ liệu thứ hai (A3) nền xám nhạt', styledSheet.A3?.s?.fgColor?.rgb, 'F2F2F2');

  // ─── PBI-24: VietQR thật của backend (EMVCo + CRC16) ────────────────────
  // Gọi thẳng vietQrHelper.js của member3 để UAT-15 không còn "PASS auto"
  // trên giấy mà không có ca kiểm thử nào.

  assertEqual('Test 38a: TLV tag 00 độ dài 02', formatTlv('00', '01'), '000201');

  const qrPayload = generateVietQrPayload({ accountNo: '0388888888', amount: 1500000, orderCode: 'HP20261001' });
  assertEqual('Test 38b: Payload bắt đầu 000201 và có tag CRC 6304',
    qrPayload.startsWith('000201') && qrPayload.includes('6304'), true);
  assertEqual('Test 38c: CRC16 cuối chuỗi khớp khi tính lại',
    qrPayload.slice(-4), crc16Ccitt(qrPayload.slice(0, -4)));
  assertEqual('Test 38d: Payload chứa số tiền và nội dung chuyển khoản',
    qrPayload.includes('1500000') && qrPayload.includes('HP20261001'), true);

  const qrData = buildVietQrData({ accountNo: '0388888888', amount: 1500000, orderCode: 'HP20261001' });
  assertEqual('Test 38e: buildVietQrData trả đúng payload và URL ảnh VietQR',
    qrData.emvcoPayload === qrPayload
      && qrData.qrImageUrl.includes('0388888888')
      && qrData.qrImageUrl.includes('1500000'), true);

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log('=====================================================');
  console.log(`[TEST SUMMARY] Total: ${passed + failed + skipped} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`);
  console.log('=====================================================');

  return { passed, failed, skipped, total: passed + failed + skipped };
}

// Execute unit tests
runSystemUnitTests();
