import bcrypt from 'bcryptjs';

/** Hash giả để so sánh khi không có user => thời gian phản hồi không lộ username tồn tại hay không. */
export function createPasswordHasher(rounds) {
  const dummyHash = bcrypt.hashSync('dummy-password-for-timing', rounds);
  return {
    hash: (plain) => bcrypt.hash(plain, rounds),
    verify: (plain, hash) => bcrypt.compare(plain, hash),
    verifyDummy: (plain) => bcrypt.compare(plain, dummyHash),
  };
}
