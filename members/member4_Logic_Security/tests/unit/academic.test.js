import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calcSubjectAverage,
  calcGpa10,
  calcGpa4,
  convertTo4,
  round1,
  isSubjectComplete,
  rankAcademic,
  classifySubjectAverage,
  suggestConduct,
  summarizeAttendance,
  UNRANKED_LABEL,
} from '../../src/modules/academic/domain/index.js';

test('round1: half-up, không dính lỗi nhị phân', () => {
  assert.equal(round1(8.45), 8.5);
  assert.equal(round1(8.449), 8.4);
  assert.equal(round1(0.05), 0.1);
  assert.equal(round1(10), 10);
});

test('TBM: ví dụ tính tay (9, 8.5, 8, 9, 9.5)', () => {
  // (9*1 + 8.5*1 + 8*2 + 9*2 + 9.5*3) / 9 = 80 / 9 = 8.888... -> 8.9
  const avg = calcSubjectAverage({
    oral: 9,
    quarterHour: 8.5,
    oneHour: 8,
    midTerm: 9,
    finalTerm: 9.5,
  });
  assert.equal(avg, 8.9);
});

test('TBM: cột null bị bỏ khỏi cả tử và mẫu', () => {
  // chỉ có giữa kỳ 6 (hệ số 2) và cuối kỳ 9 (hệ số 3): (12 + 27) / 5 = 7.8
  assert.equal(calcSubjectAverage({ midTerm: 6, finalTerm: 9, oral: null }), 7.8);
});

test('TBM: chưa có điểm nào => null; điểm 0 hợp lệ khác với null', () => {
  assert.equal(calcSubjectAverage({}), null);
  assert.equal(calcSubjectAverage({ finalTerm: 0 }), 0);
});

test('TBM: điểm ngoài 0-10 hoặc không phải số => ném lỗi', () => {
  assert.throws(() => calcSubjectAverage({ finalTerm: 11 }), RangeError);
  assert.throws(() => calcSubjectAverage({ finalTerm: -1 }), RangeError);
  assert.throws(() => calcSubjectAverage({ finalTerm: '9' }), RangeError);
  assert.throws(() => calcSubjectAverage({ finalTerm: NaN }), RangeError);
});

test('isSubjectComplete: cần giữa kỳ và cuối kỳ', () => {
  assert.equal(isSubjectComplete({ midTerm: 5, finalTerm: 6 }), true);
  assert.equal(isSubjectComplete({ midTerm: 5 }), false);
  assert.equal(isSubjectComplete({ midTerm: 0, finalTerm: 0 }), true);
});

test('GPA10: trọng số tín chỉ, bỏ môn chưa có TBM', () => {
  // (9*2 + 6*1) / 3 = 8.0
  assert.equal(
    calcGpa10([
      { average: 9, credits: 2 },
      { average: 6, credits: 1 },
      { average: null, credits: 2 },
    ]),
    8,
  );
  assert.equal(calcGpa10([]), null);
  assert.equal(calcGpa10([{ average: 7 }]), 7); // credits thiếu => 1
});

test('Quy đổi hệ 4: các mốc biên', () => {
  assert.equal(convertTo4(10), 4.0);
  assert.equal(convertTo4(8.5), 4.0);
  assert.equal(convertTo4(8.4), 3.0);
  assert.equal(convertTo4(7.0), 3.0);
  assert.equal(convertTo4(5.5), 2.0);
  assert.equal(convertTo4(4.0), 1.0);
  assert.equal(convertTo4(3.9), 0.0);
  assert.equal(convertTo4(0), 0.0);
  assert.throws(() => convertTo4(10.1), RangeError);
});

test('GPA4: trung bình có trọng số các điểm đã quy đổi', () => {
  // 9 -> 4.0 (tc 2), 6 -> 2.0 (tc 1): (8 + 2) / 3 = 3.33
  assert.equal(
    calcGpa4([
      { average: 9, credits: 2 },
      { average: 6, credits: 1 },
    ]),
    3.33,
  );
});

const subjects = (m, l, e) => [
  { code: 'MATH', average: m },
  { code: 'LIT', average: l },
  { code: 'ENG', average: e },
];

test('Xếp loại: Xuất sắc / Giỏi / Khá / Trung bình / Yếu', () => {
  assert.equal(rankAcademic({ subjects: subjects(9.5, 9, 9), gpa10: 9.2 }), 'Xuất sắc');
  assert.equal(rankAcademic({ subjects: subjects(8.5, 8, 8), gpa10: 8.2 }), 'Giỏi');
  assert.equal(rankAcademic({ subjects: subjects(7, 7, 6.5), gpa10: 6.8 }), 'Khá');
  assert.equal(rankAcademic({ subjects: subjects(5, 5.5, 5), gpa10: 5.2 }), 'Trung bình');
  assert.equal(rankAcademic({ subjects: subjects(4, 4, 4), gpa10: 4 }), 'Yếu');
});

test('Xếp loại: một môn quá thấp kéo tụt mức dù GPA cao', () => {
  // GPA 8.2 đáng lẽ Giỏi nhưng có môn 6.0 (< 6.5) => rớt xuống Khá
  assert.equal(rankAcademic({ subjects: subjects(9, 9, 6), gpa10: 8.2 }), 'Khá');
  // môn thấp nhất 3.0 (< 3.5) => Yếu dù GPA 6.5
  assert.equal(rankAcademic({ subjects: subjects(9, 9, 3), gpa10: 6.5 }), 'Yếu');
});

test('Xếp loại: Toán và Văn đều thấp thì không đạt Giỏi dù GPA đủ', () => {
  const list = [
    { code: 'MATH', average: 7.5 },
    { code: 'LIT', average: 7.5 },
    { code: 'ENG', average: 10 },
  ];
  assert.equal(rankAcademic({ subjects: list, gpa10: 8.3 }), 'Khá');
});

test('Xếp loại: thiếu dữ liệu => Chưa xếp loại', () => {
  assert.equal(rankAcademic({ subjects: [], gpa10: null }), UNRANKED_LABEL);
  assert.equal(rankAcademic({ subjects: subjects(9, null, 9), gpa10: 9 }), UNRANKED_LABEL);
});

test('Xếp loại một môn theo TBM', () => {
  assert.equal(classifySubjectAverage(9), 'Xuất sắc');
  assert.equal(classifySubjectAverage(8.9), 'Giỏi');
  assert.equal(classifySubjectAverage(6.5), 'Khá');
  assert.equal(classifySubjectAverage(5), 'Trung bình');
  assert.equal(classifySubjectAverage(4.9), 'Yếu');
  assert.equal(classifySubjectAverage(null), UNRANKED_LABEL);
});

test('Hạnh kiểm gợi ý từ chuyên cần', () => {
  assert.equal(suggestConduct({ unexcused: 0, late: 0 }), 'Tốt');
  assert.equal(suggestConduct({ unexcused: 3, late: 0 }), 'Khá');
  assert.equal(suggestConduct({ unexcused: 0, late: 9 }), 'Trung bình');
  assert.equal(suggestConduct({ unexcused: 11, late: 0 }), 'Yếu');
});

test('Tổng hợp điểm danh theo nhóm, không phân biệt hoa thường', () => {
  const summary = summarizeAttendance([
    { status: 'absent', total: 2 },
    { status: 'EXCUSED', total: 1 },
    { status: 'LATE', total: 4 },
    { status: 'PRESENT', total: 50 },
  ]);
  assert.deepEqual(summary, { excused: 1, unexcused: 2, late: 4 });
});
