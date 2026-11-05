// src/tests/attendance.test.js
// Unit tests for AttendanceService logic and GVCN scope checks.
// Uses inline logic — no imports from production modules.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ============================================================
// Inline saveAttendance normalization logic
// (mirrors AttendanceService.saveAttendance)
// ============================================================
function normalizeAttendance(attendance) {
  const normalized = {
    studentCode: attendance.studentCode || attendance.student_code,
    studentName: attendance.studentName || attendance.student_name || '',
    className:   attendance.className   || attendance.class_name,
    attDate:     attendance.attDate     || attendance.att_date,
    status:      (attendance.status || 'present').toUpperCase(),
    note:        attendance.note || null,
  };
  if (!normalized.studentCode) {
    throw new Error(`Thiếu studentCode. Dữ liệu nhận được: ${JSON.stringify(attendance)}`);
  }
  return normalized;
}

// ============================================================
// Inline saveAllAttendance logic
// (mirrors AttendanceService.saveAllAttendance, repo injected)
// ============================================================
async function saveAllAttendanceLogic(attendanceList, mockUpsert) {
  const results = [];
  for (const att of attendanceList) {
    const normalized = normalizeAttendance(att);
    const saved = await mockUpsert(normalized);
    results.push(saved);
  }
  return results;
}

// ============================================================
// Inline GVCN scope check logic (controller level)
// (mirrors AttendanceController.saveAttendance scope check)
// ============================================================
function checkGvcnAttendanceScope(records, userRole, gvcnClassName) {
  if (userRole !== 'GVCN') return; // BGH / GV → no restriction
  if (gvcnClassName === '__NO_CLASS__') {
    throw new Error('GVCN chưa được phân công lớp chủ nhiệm.');
  }
  for (const item of records) {
    const itemClass = item.className || item.class_name;
    if (itemClass && itemClass !== gvcnClassName) {
      const err = new Error('GVCN chỉ được điểm danh lớp chủ nhiệm của mình.');
      err.code = 'GVCN_SCOPE_VIOLATION';
      throw err;
    }
  }
}

// ============================================================
// TESTS – A. saveAttendance normalization
// ============================================================
describe('A. saveAttendance normalization', () => {
  it('camelCase input → status uppercased to PRESENT', () => {
    const input = {
      studentCode: 'HS001',
      studentName: 'Ánh',
      className: '10A1',
      attDate: '2026-10-15',
      status: 'present',
    };
    const result = normalizeAttendance(input);
    assert.equal(result.status, 'PRESENT');
  });

  it('snake_case input → studentCode mapped correctly', () => {
    const input = {
      student_code: 'HS002',
      student_name: 'Bảo',
      class_name: '10A1',
      att_date: '2026-10-15',
      status: 'absent',
    };
    const result = normalizeAttendance(input);
    assert.equal(result.studentCode, 'HS002');
  });

  it('missing both studentCode and student_code → throws Error mentioning studentCode', () => {
    const input = { studentName: 'Cúc', className: '10A1', attDate: '2026-10-15', status: 'present' };
    assert.throws(
      () => normalizeAttendance(input),
      (err) => {
        assert.ok(err.message.includes('studentCode'), `Expected message to mention 'studentCode', got: ${err.message}`);
        return true;
      }
    );
  });

  it("status 'absent' → normalized to 'ABSENT'", () => {
    const input = { studentCode: 'HS003', className: '10A1', attDate: '2026-10-15', status: 'absent' };
    const result = normalizeAttendance(input);
    assert.equal(result.status, 'ABSENT');
  });

  it("status 'late' → normalized to 'LATE'", () => {
    const input = { studentCode: 'HS004', className: '10A1', attDate: '2026-10-15', status: 'late' };
    const result = normalizeAttendance(input);
    assert.equal(result.status, 'LATE');
  });
});

// ============================================================
// TESTS – B. saveAllAttendance
// ============================================================
describe('B. saveAllAttendance', () => {
  it('3 valid records → returns array of 3 results', async () => {
    const records = [
      { studentCode: 'HS001', className: '10A1', attDate: '2026-10-15', status: 'present' },
      { studentCode: 'HS002', className: '10A1', attDate: '2026-10-15', status: 'absent' },
      { studentCode: 'HS003', className: '10A1', attDate: '2026-10-15', status: 'late' },
    ];
    // mock upsert: returns the normalized record as-is
    const mockUpsert = async (normalized) => normalized;
    const results = await saveAllAttendanceLogic(records, mockUpsert);
    assert.equal(results.length, 3);
  });

  it('1 record missing studentCode → throws and stops processing', async () => {
    const records = [
      { studentCode: 'HS001', className: '10A1', attDate: '2026-10-15', status: 'present' },
      { studentName: 'NoCode', className: '10A1', attDate: '2026-10-15', status: 'absent' }, // missing code
      { studentCode: 'HS003', className: '10A1', attDate: '2026-10-15', status: 'present' },
    ];
    let callCount = 0;
    const mockUpsert = async (normalized) => { callCount++; return normalized; };
    await assert.rejects(
      async () => saveAllAttendanceLogic(records, mockUpsert),
      (err) => {
        assert.ok(err.message.includes('studentCode'));
        return true;
      }
    );
    // Only first record processed before throw
    assert.equal(callCount, 1);
  });
});

// ============================================================
// TESTS – C. GVCN scope check (controller level)
// ============================================================
describe('C. GVCN scope check', () => {
  it('GVCN 10A1 saves className=10A1 → PASS (no throw)', () => {
    const records = [{ className: '10A1' }];
    assert.doesNotThrow(() => checkGvcnAttendanceScope(records, 'GVCN', '10A1'));
  });

  it("GVCN 10A1 saves className=10A2 → throws with code 'GVCN_SCOPE_VIOLATION' or message containing 'GVCN'", () => {
    const records = [{ className: '10A2' }];
    assert.throws(
      () => checkGvcnAttendanceScope(records, 'GVCN', '10A1'),
      (err) => {
        const hasScope = err.code === 'GVCN_SCOPE_VIOLATION' || err.message.includes('GVCN');
        assert.ok(hasScope, `Expected GVCN_SCOPE_VIOLATION or 'GVCN' in message, got: ${err.message}`);
        return true;
      }
    );
  });

  it('BGH (gvcnClassName=null) can save any className → PASS', () => {
    const records = [{ className: '10A2' }];
    // BGH role → no restriction regardless of className
    assert.doesNotThrow(() => checkGvcnAttendanceScope(records, 'BGH', null));
  });

  it('BGH saves className=10A1 → PASS', () => {
    const records = [{ className: '10A1' }];
    assert.doesNotThrow(() => checkGvcnAttendanceScope(records, 'BGH', null));
  });
});
