import { calculateAverageSubjectScore, evaluateAcademicRank, convertGPA10To4 } from '../../member4_Logic_Security/gpaCalculationLogic.js';
import { exportGradeBookToExcel, exportReportCardToPDF, exportTuitionReceiptToPDF } from '../exportEngine.js';

/**
 * Member 5: QA Testing Suite (Week 9)
 * Unit Tests for Business Logic, Academic Ranking, and Export Engine
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

  console.log('=====================================================');
  console.log(`[TEST SUMMARY] Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('=====================================================');

  return { passed, failed, total: passed + failed };
}

// Execute unit tests
runSystemUnitTests();
