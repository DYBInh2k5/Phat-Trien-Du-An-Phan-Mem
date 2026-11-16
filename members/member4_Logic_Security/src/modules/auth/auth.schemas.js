import { z } from 'zod';
import { ROLES } from '../../common/auth/permissions.js';
import { passwordSchema } from '../../common/http/schemas.js';

export const loginBody = z.strictObject({
  username: z.string().trim().min(1).max(50),
  // Login không áp luật độ mạnh mật khẩu (chỉ giới hạn độ dài để chống DoS bcrypt)
  password: z.string().min(1).max(128),
});

/** Người dùng tự đổi mật khẩu của mình: phải nhập đúng mật khẩu hiện tại. */
export const changePasswordBody = z
  .strictObject({
    currentPassword: z.string().min(1).max(128),
    newPassword: passwordSchema,
  })
  .refine((body) => body.newPassword !== body.currentPassword, {
    path: ['newPassword'],
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
  });

export const refreshBody = z.strictObject({ refreshToken: z.string().min(20).max(2048) });

export const switchRoleBody = z.union([
  z.strictObject({ targetRole: z.enum(Object.values(ROLES)) }),
  z.strictObject({ targetUserId: z.coerce.number().int().positive() }),
]);
