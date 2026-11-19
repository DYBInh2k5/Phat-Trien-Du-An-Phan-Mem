import { z } from 'zod';
import { paginationShape, sortSchema } from '../../common/http/pagination.js';
import { passwordSchema } from '../../common/http/schemas.js';
import { ALL_ROLES, ROLES } from '../../common/auth/permissions.js';

const studentCode = z.string().trim().min(3).max(30);
const staffUsername = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9._-]{3,50}$/, 'username chỉ gồm a-z, 0-9, . _ - (3-50 ký tự)');
const fullName = z.string().trim().min(2).max(100);

/** Admin cấp tài khoản: mọi role. Teacher/Admin tự đặt username; Student/Parent suy ra từ mã học sinh. */
export const adminCreateUserBody = z.discriminatedUnion('role', [
  z.strictObject({
    role: z.enum([ROLES.ADMIN, ROLES.TEACHER]),
    username: staffUsername,
    password: passwordSchema,
    fullName,
  }),
  z.strictObject({ role: z.literal(ROLES.STUDENT), studentCode, password: passwordSchema }),
  z.strictObject({
    role: z.literal(ROLES.PARENT),
    studentCode,
    password: passwordSchema,
    fullName: fullName.optional(),
  }),
]);

export const listUsersQuery = z.strictObject({
  ...paginationShape,
  role: z.enum(ALL_ROLES).optional(),
  q: z.string().trim().min(1).max(50).optional(),
  sort: sortSchema(['username', 'fullName', 'createdAt', 'id'], 'id'),
});
