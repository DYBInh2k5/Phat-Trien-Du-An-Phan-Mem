import { Router } from 'express';
import { can } from '../../common/middleware/can.js';
import { validate } from '../../common/middleware/validate.js';
import { idParamSchema } from '../../common/http/schemas.js';
import { adminCreateUserBody, listUsersQuery } from './users.schemas.js';

/**
 * Toàn bộ /users là quyền Admin.
 * Mật khẩu: Admin chỉ RESET (server sinh ngẫu nhiên, Admin không tự đặt); người dùng tự đổi qua PUT /auth/password.
 */
export function createUsersRoutes({ controller, authenticate }) {
  const router = Router();
  router.use(authenticate, can('user:manage'));
  router.post('/', validate({ body: adminCreateUserBody }), controller.create);
  router.get('/', validate({ query: listUsersQuery }), controller.list);
  router.post('/:id/reset-password', validate({ params: idParamSchema }), controller.resetPassword);
  return router;
}
