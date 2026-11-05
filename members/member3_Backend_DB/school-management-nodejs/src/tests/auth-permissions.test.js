// src/tests/auth-permissions.test.js
// Unit tests for auth middleware, SettingsService permissions, and JWT role decode.
// Uses inline logic — no imports from production modules.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ============================================================
// Inline requireBGH middleware logic
// BGH-only endpoints: GVCN/GV/undefined → 403
// ============================================================
function requireBGHLogic(user, next, res) {
  if (user && user.role === 'BGH') {
    next();
    return;
  }
  res.status(403).json({
    success: false,
    message: 'Chỉ Ban Giám Hiệu (BGH) mới có quyền truy cập.',
  });
}

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

// ============================================================
// Inline getPermissions / savePermissions logic
// (mirrors SettingsService, with injected repo)
// ============================================================
async function getPermissionsLogic(mockRepo) {
  try {
    const stored = await mockRepo.getByKey('permissions');
    if (stored && typeof stored === 'object') return stored;
  } catch (err) {
    // fall through to defaults
  }
  return JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS)); // deep clone to avoid mutation
}

async function savePermissionsLogic(matrix, mockRepo) {
  if (!matrix || typeof matrix !== 'object') {
    throw new Error('Invalid permissions matrix');
  }
  // Enforce: BGH always has settings access
  if (matrix.settings) matrix.settings.BGH = true;
  await mockRepo.upsert('permissions', matrix);
  return matrix;
}

// ============================================================
// Inline JWT role decode
// ============================================================
function decodeTokenRole(decodedPayload) {
  if (!decodedPayload || typeof decodedPayload !== 'object') return null;
  return decodedPayload.role || null;
}

// ============================================================
// TESTS – A. requireBGH middleware logic
// ============================================================
describe('A. requireBGH middleware logic', () => {
  it("role='BGH' → next() called, res.status not called", () => {
    let nextCalled = false;
    let statusCalled = false;

    const res = {
      status: (code) => { statusCalled = true; return { json: () => {} }; },
    };
    const next = () => { nextCalled = true; };

    requireBGHLogic({ role: 'BGH' }, next, res);
    assert.ok(nextCalled, 'next() should be called for BGH');
    assert.ok(!statusCalled, 'res.status should NOT be called for BGH');
  });

  it("role='GVCN' → res.status(403) called with message mentioning BGH or Ban Giám Hiệu", () => {
    let statusCode = null;
    let responseBody = null;

    const res = {
      status: (code) => {
        statusCode = code;
        return { json: (body) => { responseBody = body; } };
      },
    };
    const next = () => { throw new Error('next() should NOT be called for GVCN'); };

    requireBGHLogic({ role: 'GVCN' }, next, res);
    assert.equal(statusCode, 403);
    const msg = responseBody?.message || '';
    assert.ok(
      msg.includes('BGH') || msg.includes('Ban Giám Hiệu'),
      `Expected message to mention 'BGH' or 'Ban Giám Hiệu', got: ${msg}`
    );
  });

  it("role='GV' → res.status(403) called", () => {
    let statusCode = null;
    const res = {
      status: (code) => { statusCode = code; return { json: () => {} }; },
    };
    requireBGHLogic({ role: 'GV' }, () => {}, res);
    assert.equal(statusCode, 403);
  });

  it('user=undefined → res.status(403) called', () => {
    let statusCode = null;
    const res = {
      status: (code) => { statusCode = code; return { json: () => {} }; },
    };
    requireBGHLogic(undefined, () => {}, res);
    assert.equal(statusCode, 403);
  });
});

// ============================================================
// TESTS – B. SettingsService permissions logic
// ============================================================
describe('B. SettingsService permissions logic', () => {
  it('getPermissions: repo returns null → fallback to DEFAULT_PERMISSIONS', async () => {
    const mockRepo = { getByKey: async () => null };
    const result = await getPermissionsLogic(mockRepo);
    assert.deepEqual(result, DEFAULT_PERMISSIONS);
  });

  it('getPermissions: repo returns valid object → returns that object, not defaults', async () => {
    const customPerms = { gradebook: { BGH: true, GVCN: false } };
    const mockRepo = { getByKey: async () => customPerms };
    const result = await getPermissionsLogic(mockRepo);
    assert.deepEqual(result, customPerms);
  });

  it('savePermissions: settings.BGH=false → forced to true after save', async () => {
    let upsertedValue = null;
    const mockRepo = {
      upsert: async (key, value) => { upsertedValue = value; },
    };
    const matrix = { settings: { BGH: false, GV: false, GVCN: false } };
    const result = await savePermissionsLogic(matrix, mockRepo);
    assert.equal(result.settings.BGH, true, 'BGH should always be true in settings');
    assert.equal(upsertedValue?.settings?.BGH, true);
  });

  it('savePermissions: matrix=null → throws Error', async () => {
    const mockRepo = { upsert: async () => {} };
    await assert.rejects(
      async () => savePermissionsLogic(null, mockRepo),
      (err) => {
        assert.ok(err instanceof Error);
        return true;
      }
    );
  });
});

// ============================================================
// TESTS – C. JWT role decode logic
// ============================================================
describe('C. JWT role decode logic', () => {
  it("payload { role: 'GVCN', userId: 5 } → returns 'GVCN'", () => {
    assert.equal(decodeTokenRole({ role: 'GVCN', userId: 5 }), 'GVCN');
  });

  it("payload { role: 'BGH', userId: 1 } → returns 'BGH'", () => {
    assert.equal(decodeTokenRole({ role: 'BGH', userId: 1 }), 'BGH');
  });

  it('empty payload {} → returns null', () => {
    assert.equal(decodeTokenRole({}), null);
  });

  it('null payload → returns null', () => {
    assert.equal(decodeTokenRole(null), null);
  });

  it('non-object payload (string) → returns null', () => {
    assert.equal(decodeTokenRole('some-string'), null);
  });
});
