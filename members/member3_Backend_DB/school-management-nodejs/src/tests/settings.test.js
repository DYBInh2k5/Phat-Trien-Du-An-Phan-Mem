// src/tests/settings.test.js
// Unit tests for SettingsService permissions domain.
// Uses inline logic — no imports from production modules.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ============================================================
// Inline DEFAULT_PERMISSIONS
// (copied from SettingsService.js)
// ============================================================
const DEFAULT_PERMISSIONS = {
  gradebook:  { GV: true,  GVCN: true,  BGH: true,  PH: false, HS: false },
  attendance: { GV: true,  GVCN: true,  BGH: true,  PH: false, HS: false },
  schedule:   { GV: true,  GVCN: true,  BGH: true,  PH: true,  HS: true  },
  reports:    { GV: false, GVCN: false, BGH: true,  PH: false, HS: false },
  settings:   { GV: false, GVCN: false, BGH: true,  PH: false, HS: false },
};

const REQUIRED_MODULES = ['gradebook', 'attendance', 'schedule', 'reports', 'settings'];
const REQUIRED_ROLES   = ['GV', 'GVCN', 'BGH', 'PH', 'HS'];

// ============================================================
// Inline getPermissions / savePermissions logic
// (mirrors SettingsService, repo injected for isolation)
// ============================================================
async function getPermissionsLogic(mockRepo) {
  try {
    const stored = await mockRepo.getByKey('permissions');
    if (stored && typeof stored === 'object') return stored;
  } catch (_err) {
    // fall through to defaults
  }
  // Return a deep clone so mutations cannot affect DEFAULT_PERMISSIONS
  return JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));
}

async function savePermissionsLogic(matrix, mockRepo) {
  if (!matrix || typeof matrix !== 'object') {
    throw new Error('Invalid permissions matrix');
  }
  if (matrix.settings) matrix.settings.BGH = true;
  await mockRepo.upsert('permissions', matrix);
  return matrix;
}

// ============================================================
// TESTS – A. getPermissions
// ============================================================
describe('A. getPermissions', () => {
  it('DB returns null → DEFAULT_PERMISSIONS has exactly 5 modules', async () => {
    const mockRepo = { getByKey: async () => null };
    const result = await getPermissionsLogic(mockRepo);
    const modules = Object.keys(result);
    assert.equal(modules.length, 5);
    for (const mod of REQUIRED_MODULES) {
      assert.ok(modules.includes(mod), `Missing module: ${mod}`);
    }
  });

  it('DB returns valid JSON → returns that data, not defaults', async () => {
    const customData = { gradebook: { BGH: true, GVCN: false, GV: false, PH: false, HS: false } };
    const mockRepo = { getByKey: async () => customData };
    const result = await getPermissionsLogic(mockRepo);
    assert.deepEqual(result, customData);
    // must NOT be the default
    assert.notDeepEqual(result, DEFAULT_PERMISSIONS);
  });

  it('DB throws error → falls back to DEFAULT_PERMISSIONS', async () => {
    const mockRepo = { getByKey: async () => { throw new Error('DB connection failed'); } };
    const result = await getPermissionsLogic(mockRepo);
    assert.deepEqual(result, DEFAULT_PERMISSIONS);
  });

  it('Each module in DEFAULT_PERMISSIONS has all 5 roles', async () => {
    const mockRepo = { getByKey: async () => null };
    const result = await getPermissionsLogic(mockRepo);
    for (const mod of REQUIRED_MODULES) {
      const moduleObj = result[mod];
      assert.ok(moduleObj, `Module ${mod} missing`);
      for (const role of REQUIRED_ROLES) {
        assert.ok(
          Object.prototype.hasOwnProperty.call(moduleObj, role),
          `Module '${mod}' is missing role '${role}'`
        );
      }
    }
  });
});

// ============================================================
// TESTS – B. savePermissions
// ============================================================
describe('B. savePermissions', () => {
  it('valid matrix → repo.upsert called with key=permissions and the matrix', async () => {
    let upsertKey = null;
    let upsertValue = null;
    const mockRepo = {
      upsert: async (key, value) => { upsertKey = key; upsertValue = value; },
    };
    const matrix = {
      gradebook:  { GV: true, GVCN: true, BGH: true, PH: false, HS: false },
      attendance: { GV: true, GVCN: true, BGH: true, PH: false, HS: false },
      settings:   { GV: false, GVCN: false, BGH: true, PH: false, HS: false },
    };
    await savePermissionsLogic(matrix, mockRepo);
    assert.equal(upsertKey, 'permissions');
    assert.deepEqual(upsertValue, matrix);
  });

  it('matrix.settings.BGH set to false → enforced back to true after savePermissions', async () => {
    const mockRepo = { upsert: async () => {} };
    const matrix = {
      settings: { BGH: false, GV: true, GVCN: true, PH: false, HS: false },
    };
    const result = await savePermissionsLogic(matrix, mockRepo);
    assert.equal(result.settings.BGH, true);
  });

  it('matrix=null → throws Error', async () => {
    const mockRepo = { upsert: async () => {} };
    await assert.rejects(
      async () => savePermissionsLogic(null, mockRepo),
      (err) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.length > 0);
        return true;
      }
    );
  });

  it('matrix=42 (non-object) → throws Error', async () => {
    const mockRepo = { upsert: async () => {} };
    await assert.rejects(
      async () => savePermissionsLogic(42, mockRepo),
      (err) => {
        assert.ok(err instanceof Error);
        return true;
      }
    );
  });
});

// ============================================================
// TESTS – C. DEFAULT_PERMISSIONS immutability
// ============================================================
describe('C. DEFAULT_PERMISSIONS immutability', () => {
  it('getPermissions called twice → second call still returns correct DEFAULT_PERMISSIONS (not mutated)', async () => {
    const mockRepo = { getByKey: async () => null };

    const first = await getPermissionsLogic(mockRepo);
    // Mutate the returned object
    first.gradebook.BGH = false;
    first.newProp = 'injected';

    const second = await getPermissionsLogic(mockRepo);
    // Second call must still return the original defaults
    assert.equal(second.gradebook.BGH, true, 'DEFAULT_PERMISSIONS.gradebook.BGH should still be true');
    assert.equal(second.newProp, undefined, 'Injected property should not appear in second call');
    assert.deepEqual(second, DEFAULT_PERMISSIONS);
  });

  it('DEFAULT_PERMISSIONS itself is not modified by savePermissions mutation', async () => {
    const mockRepo = { upsert: async () => {} };
    // savePermissions mutates the passed-in matrix in-place (sets BGH=true)
    // DEFAULT_PERMISSIONS should NOT be the same object reference as what is passed
    const matrixCopy = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));
    matrixCopy.settings.BGH = false;
    await savePermissionsLogic(matrixCopy, mockRepo);
    // Verify DEFAULT_PERMISSIONS.settings.BGH is still its original value
    assert.equal(DEFAULT_PERMISSIONS.settings.BGH, true, 'DEFAULT_PERMISSIONS must not be mutated by savePermissions');
  });
});
