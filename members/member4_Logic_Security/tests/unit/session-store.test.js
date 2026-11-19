import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionStore } from '../../src/common/auth/session-store.js';

const clock = (start = 1_000_000) => {
  const state = { now: start };
  return { state, now: () => state.now };
};

test('phiên chưa thu hồi thì hợp lệ', () => {
  const store = createSessionStore();
  assert.equal(store.isRevoked({ sid: 'a', userId: 1, issuedAtMs: Date.now() }), false);
});

test('revokeSession chỉ chặn đúng phiên đó', () => {
  const store = createSessionStore();
  store.revokeSession('a', 60);
  assert.equal(store.isRevoked({ sid: 'a', userId: 1, issuedAtMs: Date.now() }), true);
  assert.equal(store.isRevoked({ sid: 'b', userId: 1, issuedAtMs: Date.now() }), false);
});

test('revokeAllForUser: token phát hành trước mốc bị chặn, token mới sau mốc vẫn dùng được', () => {
  const c = clock();
  const store = createSessionStore({ now: c.now });
  store.revokeAllForUser(1);
  assert.equal(store.isRevoked({ sid: 'old', userId: 1, issuedAtMs: c.state.now - 5 }), true);
  assert.equal(store.isRevoked({ sid: 'same-ms', userId: 1, issuedAtMs: c.state.now }), true);
  assert.equal(store.isRevoked({ sid: 'new', userId: 1, issuedAtMs: c.state.now + 1 }), false);
  assert.equal(
    store.isRevoked({ sid: 'other-user', userId: 2, issuedAtMs: c.state.now - 5 }),
    false,
  );
});

test('markRefreshUsed: lần đầu true, dùng lại false', () => {
  const store = createSessionStore();
  assert.equal(store.markRefreshUsed('jti-1', 60), true);
  assert.equal(store.markRefreshUsed('jti-1', 60), false);
  assert.equal(store.markRefreshUsed('jti-2', 60), true);
});

test('bản ghi hết hạn được dọn khi có thao tác mới (không phình bộ nhớ)', () => {
  const c = clock();
  const store = createSessionStore({ now: c.now });
  store.revokeSession('a', 10);
  store.markRefreshUsed('j', 10);
  c.state.now += 11_000;
  store.revokeSession('b', 10); // kích hoạt sweep
  assert.equal(store.isRevoked({ sid: 'a', userId: 1, issuedAtMs: c.state.now }), false);
  assert.equal(store.markRefreshUsed('j', 10), true); // jti cũ đã hết hạn nên được dọn
});
