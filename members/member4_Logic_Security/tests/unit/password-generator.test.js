import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePassword } from '../../src/common/auth/password-generator.js';
import { passwordSchema } from '../../src/common/http/schemas.js';

test('generatePassword: đúng độ dài, luôn thỏa passwordSchema, không có ký tự dễ nhầm, không lặp', () => {
  const seen = new Set();
  for (let i = 0; i < 500; i += 1) {
    const password = generatePassword();
    assert.equal(password.length, 12);
    assert.equal(passwordSchema.safeParse(password).success, true, password);
    assert.doesNotMatch(password, /[0O1lI]/);
    seen.add(password);
  }
  assert.equal(seen.size, 500);
  assert.equal(generatePassword(20).length, 20);
});
