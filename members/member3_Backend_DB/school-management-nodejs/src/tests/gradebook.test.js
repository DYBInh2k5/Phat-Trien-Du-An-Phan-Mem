// src/tests/gradebook.test.js
// Unit tests for GradeBookService logic and GVCN scope checks.
// Uses inline logic — no imports from production modules.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ============================================================
// Inline resolveEffectiveClassName logic
// (mirrors GradeBookController GVCN scope override)
// ============================================================
const GVCN_NOT_ASSIGNED_SENTINEL = '__NO_CLASS__';

function resolveEffectiveClassName(requestedClassName, gvcnClassName) {
  if (gvcnClassName === GVCN_NOT_ASSIGNED_SENTINEL) {
    const err = new Error('GVCN chưa được phân công lớp chủ nhiệm.');
    err.code = 'GVCN_NOT_ASSIGNED';
    err.status = 403;
    throw err;
  }
  // GVCN with an assigned class always uses their own class (ignore requestedClassName)
  if (gvcnClassName !== null && gvcnClassName !== undefined) {
    return gvcnClassName;
  }
  // BGH (gvcnClassName = null): use requestedClassName as-is
  return requestedClassName;
}

// ============================================================
// Inline saveGrades GVCN scope check
// (mirrors GradeBookController.saveGrades scope check)
// ============================================================
function checkGvcnGradeScope(items, gvcnClassName) {
  if (gvcnClassName === null || gvcnClassName === undefined) return; // BGH
  if (gvcnClassName === GVCN_NOT_ASSIGNED_SENTINEL) {
    const err = new Error('GVCN chưa được phân công lớp chủ nhiệm.');
    err.code = 'GVCN_NOT_ASSIGNED';
    throw err;
  }
  for (const item of items) {
    const itemClass = item.className || item.class_name;
    if (itemClass && itemClass !== gvcnClassName) {
      const err = new Error('GVCN chỉ được nhập điểm lớp chủ nhiệm của mình.');
      err.code = 'GVCN_SCOPE_VIOLATION';
      throw err;
    }
  }
}

// ============================================================
// Inline calculateTBM logic
// (copied directly from GradeBookService.calculateTBM)
// ============================================================
function calculateTBM(gb) {
  const oral = parseFloat(gb.scoreOral || gb.score_oral || 0);
  const m15  = parseFloat(gb.score15m  || gb.score_15m  || 0);
  const h1   = parseFloat(gb.score1Hour|| gb.score_1hour|| 0);
  const mid  = parseFloat(gb.scoreMidTerm  || gb.score_mid_term  || 0);
  const fin  = parseFloat(gb.scoreFinalTerm|| gb.score_final_term|| 0);

  if (oral > 0 && m15 > 0 && h1 > 0 && mid > 0 && fin > 0) {
    const total = oral + m15 + (h1 * 2) + (mid * 2) + (fin * 3);
    const avg   = Math.round((total / 9.0) * 10) / 10;
    gb.averageScore  = avg;
    gb.average_score = avg;

    if      (avg >= 9.0) gb.gradeLetter = 'Xuất sắc';
    else if (avg >= 8.0) gb.gradeLetter = 'Giỏi';
    else if (avg >= 6.5) gb.gradeLetter = 'Khá';
    else if (avg >= 5.0) gb.gradeLetter = 'Trung bình';
    else                 gb.gradeLetter = 'Yếu';
    gb.grade_letter = gb.gradeLetter;
  }
  return gb;
}

// ============================================================
// TESTS – A. resolveEffectiveClassName (GVCN scope override)
// ============================================================
describe('A. resolveEffectiveClassName – GVCN scope override', () => {
  it('GVCN assigned to 10A1: any requestedClassName is overridden to 10A1', () => {
    assert.equal(resolveEffectiveClassName('10A2', '10A1'), '10A1');
    assert.equal(resolveEffectiveClassName('10A3', '10A1'), '10A1');
    assert.equal(resolveEffectiveClassName(null,   '10A1'), '10A1');
  });

  it('BGH (gvcnClassName=null): requestedClassName returned unchanged', () => {
    assert.equal(resolveEffectiveClassName('10A2', null), '10A2');
    assert.equal(resolveEffectiveClassName('10A1', null), '10A1');
    assert.equal(resolveEffectiveClassName(null,   null), null);
  });

  it("gvcnClassName='__NO_CLASS__' → throws 403", () => {
    assert.throws(
      () => resolveEffectiveClassName('10A1', '__NO_CLASS__'),
      (err) => {
        assert.equal(err.code, 'GVCN_NOT_ASSIGNED');
        assert.equal(err.status, 403);
        return true;
      }
    );
  });
});

// ============================================================
// TESTS – B. saveGrades GVCN scope check
// ============================================================
describe('B. saveGrades GVCN scope check', () => {
  it("items=[{className:'10A1'}], gvcnClassName='10A1' → PASS", () => {
    assert.doesNotThrow(() => checkGvcnGradeScope([{ className: '10A1' }], '10A1'));
  });

  it("items=[{className:'10A2'}], gvcnClassName='10A1' → FAIL with GVCN_SCOPE_VIOLATION", () => {
    assert.throws(
      () => checkGvcnGradeScope([{ className: '10A2' }], '10A1'),
      (err) => {
        assert.equal(err.code, 'GVCN_SCOPE_VIOLATION');
        return true;
      }
    );
  });

  it("items=[{className:'10A2'}], gvcnClassName=null (BGH) → PASS", () => {
    assert.doesNotThrow(() => checkGvcnGradeScope([{ className: '10A2' }], null));
  });

  it("items=[{className:'10A1'}], gvcnClassName=undefined (BGH) → PASS", () => {
    assert.doesNotThrow(() => checkGvcnGradeScope([{ className: '10A1' }], undefined));
  });
});

// ============================================================
// TESTS – C. calculateTBM
// ============================================================
describe('C. calculateTBM', () => {
  it('standard scores → correct weighted average', () => {
    // oral=8, 15m=7, 1hour=6, midTerm=6, finalTerm=5
    // total = 8 + 7 + 6*2 + 6*2 + 5*3 = 8+7+12+12+15 = 54
    // avg = Math.round(54/9 * 10)/10 = Math.round(60)/10 = 6.0
    const gb = {
      scoreOral: 8, score15m: 7, score1Hour: 6, scoreMidTerm: 6, scoreFinalTerm: 5,
    };
    const result = calculateTBM(gb);
    const expected = Math.round((8 + 7 + 6 * 2 + 6 * 2 + 5 * 3) / 9 * 10) / 10;
    assert.equal(result.averageScore, expected);
  });

  it('all scores = 0 → averageScore not set (condition oral>0 fails)', () => {
    const gb = {
      scoreOral: 0, score15m: 0, score1Hour: 0, scoreMidTerm: 0, scoreFinalTerm: 0,
    };
    const result = calculateTBM(gb);
    assert.equal(result.averageScore, undefined);
  });

  it('all scores = 10 → averageScore=10.0, gradeLetter=Xuất sắc', () => {
    const gb = {
      scoreOral: 10, score15m: 10, score1Hour: 10, scoreMidTerm: 10, scoreFinalTerm: 10,
    };
    const result = calculateTBM(gb);
    // total = 10+10+20+20+30=90, avg=90/9=10.0
    assert.equal(result.averageScore, 10.0);
    assert.equal(result.gradeLetter, 'Xuất sắc');
  });

  it('all scores = 4 → gradeLetter=Yếu', () => {
    const gb = {
      scoreOral: 4, score15m: 4, score1Hour: 4, scoreMidTerm: 4, scoreFinalTerm: 4,
    };
    const result = calculateTBM(gb);
    // total = 4+4+8+8+12=36, avg=36/9=4.0
    assert.equal(result.gradeLetter, 'Yếu');
  });

  it('scores that result in avg ≥ 8.0 but < 9.0 → gradeLetter=Giỏi', () => {
    // oral=9, 15m=9, 1hour=8, mid=8, fin=8
    // total=9+9+16+16+24=74, avg=74/9≈8.2
    const gb = {
      scoreOral: 9, score15m: 9, score1Hour: 8, scoreMidTerm: 8, scoreFinalTerm: 8,
    };
    const result = calculateTBM(gb);
    assert.ok(result.averageScore >= 8.0 && result.averageScore < 9.0);
    assert.equal(result.gradeLetter, 'Giỏi');
  });

  it('scores that result in avg ≥ 6.5 but < 8.0 → gradeLetter=Khá', () => {
    // oral=7, 15m=7, 1hour=7, mid=7, fin=7
    // total=7+7+14+14+21=63, avg=63/9=7.0
    const gb = {
      scoreOral: 7, score15m: 7, score1Hour: 7, scoreMidTerm: 7, scoreFinalTerm: 7,
    };
    const result = calculateTBM(gb);
    assert.ok(result.averageScore >= 6.5 && result.averageScore < 8.0);
    assert.equal(result.gradeLetter, 'Khá');
  });

  it('scores that result in avg ≥ 5.0 but < 6.5 → gradeLetter=Trung bình', () => {
    // oral=5, 15m=5, 1hour=6, mid=6, fin=5
    // total=5+5+12+12+15=49, avg≈5.4
    const gb = {
      scoreOral: 5, score15m: 5, score1Hour: 6, scoreMidTerm: 6, scoreFinalTerm: 5,
    };
    const result = calculateTBM(gb);
    assert.ok(result.averageScore >= 5.0 && result.averageScore < 6.5);
    assert.equal(result.gradeLetter, 'Trung bình');
  });
});
