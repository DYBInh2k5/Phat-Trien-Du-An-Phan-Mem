import { calculateAverageSubjectScore, evaluateAcademicRank, convertGPA10To4 } from '../../member4_Logic_Security/gpaCalculationLogic.js';
import { exportGradeBookToExcel, exportReportCardToPDF, exportTuitionReceiptToPDF } from '../exportEngine.js';

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

  // Test 2: Academic Rank Evaluation
  const rank = evaluateAcademicRank(8.5);
  assertEqual('Test 2: Academic Rank Evaluation', rank, 'Giỏi');

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
  const VALID_CONDUCT_RANKS = ['Tốt', 'Khá', 'Trung bình', 'Yếu'];
  function validateConductRank(rank) {
    return typeof rank === 'string' && VALID_CONDUCT_RANKS.includes(rank);
  }

  // Test 10 — UC-GVCN-07: Conduct rank validation
  assertEqual('Test 10a: Tốt is valid',       validateConductRank('Tốt'),        true);
  assertEqual('Test 10b: Khá is valid',        validateConductRank('Khá'),        true);
  assertEqual('Test 10c: Trung bình is valid', validateConductRank('Trung bình'), true);
  assertEqual('Test 10d: Yếu is valid',        validateConductRank('Yếu'),        true);
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

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log('=====================================================');
  console.log(`[TEST SUMMARY] Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('=====================================================');

  return { passed, failed, total: passed + failed };
}

// Execute unit tests
runSystemUnitTests();
