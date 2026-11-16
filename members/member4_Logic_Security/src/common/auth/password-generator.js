import { randomInt } from 'node:crypto';

// Bỏ ký tự dễ nhìn nhầm khi đọc cho người dùng: 0/O, 1/l/I
const LETTERS = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const ALPHABET = LETTERS + DIGITS;

const pick = (chars) => chars[randomInt(chars.length)];

/**
 * Sinh mật khẩu tạm ngẫu nhiên (CSPRNG), luôn có cả chữ và số => thỏa passwordSchema.
 * @param {number} length
 */
export function generatePassword(length = 12) {
  const chars = [pick(LETTERS), pick(DIGITS)];
  while (chars.length < length) {
    chars.push(pick(ALPHABET));
  }
  // Fisher-Yates để vị trí chữ/số bắt buộc không cố định
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
