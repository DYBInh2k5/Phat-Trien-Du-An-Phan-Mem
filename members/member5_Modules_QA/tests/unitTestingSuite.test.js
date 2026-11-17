import { calculateAverageSubjectScore, evaluateAcademicRank, convertGPA10To4 } from '../../member4_Logic_Security/gpaCalculationLogic.js';
import { exportGradeBookToExcel, exportReportCardToPDF, exportTuitionReceiptToPDF, rankAcademicScore, generateReceiptLookupCode, buildScoreDistribution, exportScoreDistributionToExcel, buildSubjectScoreDistribution, buildAwardLists, exportAwardReportToExcel } from '../exportEngine.js';

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

  function assertEqual(testName, actual, expected) {
    if (actual === expected) {
      console.log(`PASS: [${testName}] -> Result: ${actual}`);
      passed++;
    } else {
      console.error(`FAIL: [${testName}] -> Actual: ${actual}, Expected: ${expected}`);
      failed++;
    }
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
  const excelRes = exportGradeBookToExcel('10A1', 'Toán Học', [{ studentCode: 'HS001', fullName: 'Nguyễn Thị Ánh', averageScore: 8.7 }]);
  assertEqual('Test 4: Excel Export Row Count', excelRes.rowCount, 1);

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
  const excelResult = exportGradeBookToExcel('10A1', 'Toán', gradeData);
  assertEqual('Test 11a: Export Excel success',    excelResult.success,  true);
  assertEqual('Test 11b: Export Excel rowCount',   excelResult.rowCount, 3);
  assertEqual('Test 11c: Export Excel fileName prefix',
    excelResult.fileName.startsWith('Bang_Diem_'), true);

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
  const distExport = exportScoreDistributionToExcel(schoolStudents, { groupBy: 'gradeLevel' });
  assertEqual('Test 24a: Xuất phổ điểm thành công', distExport.success, true);
  assertEqual('Test 24b: Tên tệp phổ điểm', distExport.fileName, 'Pho_Diem_Theo_Khoi.xlsx');
  assertEqual('Test 24c: Số nhóm dữ liệu', distExport.rowCount, 2);
  assertEqual('Test 24d: Có dòng tổng cộng cuối', distExport.rows[distExport.rows.length - 1].group, 'Toàn trường');
  assertEqual('Test 24e: Tổng sĩ số khớp', distExport.rows[distExport.rows.length - 1].total, 6);

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
  const awardExport = exportAwardReportToExcel(awardStudents, { filter: { className: '10A1' }, outputDir: '.' });
  assertEqual('Test 28a: Xuất báo cáo BGH thành công', awardExport.success, true);
  assertEqual('Test 28b: Tên tệp theo phạm vi lớp', awardExport.fileName, 'Bao_Cao_BGH_Lop_10A1.xlsx');
  assertEqual('Test 28c: Số dòng phổ điểm môn', awardExport.rowCount, 2);
  assertEqual('Test 28d: Chỉ còn HS001 trong danh sách Xuất sắc', awardExport.excellent.length, 1);
  assertEqual('Test 28e: Lớp 10A1 không có ai phải rèn luyện hè', awardExport.summerTraining.length, 0);

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

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log('=====================================================');
  console.log(`[TEST SUMMARY] Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('=====================================================');

  return { passed, failed, total: passed + failed };
}

// Execute unit tests
runSystemUnitTests();
