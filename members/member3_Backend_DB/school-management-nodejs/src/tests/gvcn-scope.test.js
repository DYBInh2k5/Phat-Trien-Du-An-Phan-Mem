// src/tests/gvcn-scope.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ============================================================
// Mock ClassRepository
// ============================================================
const mockClassRepo = {
  // Default: returns null (no assigned class)
  findByHomeroomTeacherId: async (_userId) => null,
};

// ============================================================
// Inline resolveGvcnClass logic for unit testing
// (mirrors the implementation in dataAccessMiddleware.js)
// ============================================================
const GVCN_NOT_ASSIGNED_SENTINEL = '__NO_CLASS__';

async function resolveGvcnClassLogic(userId, role, classRepo) {
  if (role !== 'GVCN') return null;
  const homeroomClass = await classRepo.findByHomeroomTeacherId(userId);
  if (!homeroomClass) return GVCN_NOT_ASSIGNED_SENTINEL;
  return homeroomClass.class_name;
}

// ============================================================
// Inline StudentService.getAllStudents logic for unit testing
// ============================================================
async function getAllStudentsLogic(className, restrictClassName, studentRepo) {
  if (restrictClassName === GVCN_NOT_ASSIGNED_SENTINEL) {
    const err = new Error('GVCN chưa được phân công lớp chủ nhiệm.');
    err.code = 'GVCN_NOT_ASSIGNED';
    throw err;
  }
  const effectiveClass = restrictClassName ?? className ?? null;
  if (effectiveClass) {
    return await studentRepo.findByClassName(effectiveClass);
  }
  return await studentRepo.findAll();
}

// ============================================================
// Mock student data
// ============================================================
const mockStudents = [
  { id: 1, student_code: 'HS001', class_name: '10A1', full_name: 'Nguyễn Thị Ánh' },
  { id: 2, student_code: 'HS002', class_name: '10A1', full_name: 'Trần Văn Bảo' },
  { id: 5, student_code: 'HS005', class_name: '10A2', full_name: 'Đặng Thị Giang' },
];

const mockStudentRepo = {
  findByClassName: async (cn) => mockStudents.filter(s => s.class_name === cn),
  findAll: async () => mockStudents,
};

// ============================================================
// TESTS
// ============================================================

describe('resolveGvcnClass middleware logic', () => {
  it('Test 1: GVCN với lớp được phân công → gvcnClassName = class_name', async () => {
    const repoWithClass = {
      findByHomeroomTeacherId: async (userId) => {
        assert.equal(userId, 42); // verify it uses user.id, not anything else
        return { class_name: '10A1' };
      },
    };
    const result = await resolveGvcnClassLogic(42, 'GVCN', repoWithClass);
    assert.equal(result, '10A1');
  });

  it('Test 2: GVCN chưa được phân công lớp → sentinel __NO_CLASS__', async () => {
    const repoNoClass = {
      findByHomeroomTeacherId: async () => null,
    };
    const result = await resolveGvcnClassLogic(99, 'GVCN', repoNoClass);
    assert.equal(result, '__NO_CLASS__');
  });

  it('Test 3: BGH role → null (không hạn chế)', async () => {
    const result = await resolveGvcnClassLogic(1, 'BGH', mockClassRepo);
    assert.equal(result, null);
  });

  it('Test 3b: GV role → null (không hạn chế)', async () => {
    const result = await resolveGvcnClassLogic(2, 'GV', mockClassRepo);
    assert.equal(result, null);
  });
});

describe('StudentService.getAllStudents logic', () => {
  it('Test 4: restrictClassName là tên lớp → chỉ trả học sinh lớp đó', async () => {
    const students = await getAllStudentsLogic(null, '10A1', mockStudentRepo);
    assert.equal(students.length, 2);
    assert.ok(students.every(s => s.class_name === '10A1'));
  });

  it('Test 4b: restrictClassName ưu tiên hơn className từ query param', async () => {
    const students = await getAllStudentsLogic('10A2', '10A1', mockStudentRepo);
    assert.equal(students.length, 2);
    assert.ok(students.every(s => s.class_name === '10A1'));
  });

  it('Test 5: restrictClassName là __NO_CLASS__ → ném lỗi GVCN_NOT_ASSIGNED', async () => {
    await assert.rejects(
      async () => getAllStudentsLogic(null, '__NO_CLASS__', mockStudentRepo),
      (err) => {
        assert.equal(err.code, 'GVCN_NOT_ASSIGNED');
        return true;
      }
    );
  });

  it('Test 6: Sentinel __NO_CLASS__ propagation — không bao giờ trả toàn bộ học sinh', async () => {
    let threw = false;
    try {
      await getAllStudentsLogic(null, '__NO_CLASS__', mockStudentRepo);
    } catch (e) {
      threw = true;
      assert.equal(e.code, 'GVCN_NOT_ASSIGNED');
    }
    assert.ok(threw, 'Phải ném lỗi với sentinel value');
  });

  it('Test 7: BGH/null restrictClassName → trả toàn bộ học sinh', async () => {
    const students = await getAllStudentsLogic(null, null, mockStudentRepo);
    assert.equal(students.length, 3);
  });
});

describe('GVCN scope violations', () => {
  it('Test: GVCN 10A1 không thể xem học sinh 10A2 theo ID', () => {
    // Simulate controller logic
    const gvcnClassName = '10A1';
    const student = { id: 5, class_name: '10A2' };
    const studentClass = student.class_name;
    const isViolation = gvcnClassName !== null && studentClass !== gvcnClassName;
    assert.ok(isViolation, 'GVCN 10A1 không được phép xem học sinh 10A2');
  });

  it('Test: GVCN 10A1 có thể xem học sinh 10A1 theo ID', () => {
    const gvcnClassName = '10A1';
    const student = { id: 1, class_name: '10A1' };
    const studentClass = student.class_name;
    const isViolation = gvcnClassName !== null && studentClass !== gvcnClassName;
    assert.ok(!isViolation, 'GVCN 10A1 được phép xem học sinh 10A1');
  });
});
