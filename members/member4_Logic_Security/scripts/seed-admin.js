// Seed tài khoản Admin (bắt buộc, chạy lại an toàn) và tuỳ chọn tài khoản demo:  npm run seed:admin  |  npm run seed:demo
import pg from 'pg';
import { z } from 'zod';
import { createPasswordHasher } from '../src/common/auth/password-hasher.js';
import { parentUsername, studentUsername } from '../src/common/auth/account-links.js';
import { ROLES } from '../src/common/auth/permissions.js';
import { passwordSchema } from '../src/common/http/schemas.js';
import { createUsersRepository } from '../src/modules/users/users.repository.js';

const DEFAULT_ADMIN_PASSWORD = 'ChangeMe@12345';

const env = z
  .object({
    NODE_ENV: z.string().default('development'),
    DATABASE_URL: z.string().min(1),
    BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
    ADMIN_USERNAME: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9._-]{3,50}$/)
      .default('admin'),
    ADMIN_PASSWORD: passwordSchema.default(DEFAULT_ADMIN_PASSWORD),
    ADMIN_FULL_NAME: z.string().trim().min(2).max(100).default('Quản trị viên'),
    DEMO_PASSWORD: passwordSchema.default('Demo@12345'),
  })
  .parse(process.env);

if (env.NODE_ENV === 'production' && env.ADMIN_PASSWORD === DEFAULT_ADMIN_PASSWORD) {
  console.error('Không được dùng mật khẩu admin mặc định ở production. Đặt ADMIN_PASSWORD.');
  process.exit(1);
}

const withDemo = process.argv.includes('--demo');
const pool = new pg.Pool({ connectionString: env.DATABASE_URL, max: 2 });
const users = createUsersRepository(pool);
const hasher = createPasswordHasher(env.BCRYPT_ROUNDS);

async function ensure({ username, password, fullName, role }) {
  const existing = await users.findByUsername(username);
  if (existing) {
    console.log(`= ${role.padEnd(7)} ${username} đã tồn tại, giữ nguyên`);
    return;
  }
  await users.create({ username, passwordHash: await hasher.hash(password), fullName, role });
  console.log(`+ ${role.padEnd(7)} ${username} đã tạo`);
}

try {
  await ensure({
    username: env.ADMIN_USERNAME,
    password: env.ADMIN_PASSWORD,
    fullName: env.ADMIN_FULL_NAME,
    role: ROLES.ADMIN,
  });

  if (withDemo) {
    // Khớp dữ liệu mẫu trong db/schema.sql: GVCN 10A1 "Nguyễn Văn An", học sinh HS001, phụ huynh của HS001
    await ensure({
      username: 'gv.an',
      password: env.DEMO_PASSWORD,
      fullName: 'Nguyễn Văn An',
      role: ROLES.TEACHER,
    });
    await ensure({
      username: studentUsername('HS001'),
      password: env.DEMO_PASSWORD,
      fullName: 'Nguyễn Thị Ánh',
      role: ROLES.STUDENT,
    });
    await ensure({
      username: parentUsername('HS001'),
      password: env.DEMO_PASSWORD,
      fullName: 'Nguyễn Thị Hương',
      role: ROLES.PARENT,
    });
    console.log(
      'Tài khoản demo dùng mật khẩu DEMO_PASSWORD (mặc định Demo@12345). Không dùng ở môi trường thật.',
    );
  }
} finally {
  await pool.end();
}
