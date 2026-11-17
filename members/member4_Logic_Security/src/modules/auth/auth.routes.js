import { Router } from 'express';
import { validate } from '../../common/middleware/validate.js';
import { changePasswordBody, loginBody, refreshBody, switchRoleBody } from './auth.schemas.js';

export function createAuthRoutes({ controller, authenticate, loginLimiter, ipLimiter }) {
  const router = Router();

  // Public. Không có tự đăng ký: mọi tài khoản do Admin cấp qua POST /users.
  router.post('/login', loginLimiter, validate({ body: loginBody }), controller.login);
  router.post('/refresh', ipLimiter, validate({ body: refreshBody }), controller.refresh);

  // Cần đăng nhập
  router.post('/logout', authenticate, controller.logout);
  router.post('/logout-all', authenticate, controller.logoutAll);
  router.get('/me', authenticate, controller.me);
  router.put(
    '/password',
    authenticate,
    ipLimiter,
    validate({ body: changePasswordBody }),
    controller.changePassword,
  );
  router.post(
    '/switch-role',
    authenticate,
    validate({ body: switchRoleBody }),
    controller.switchRole,
  );
  router.post('/switch-back', authenticate, controller.switchBack);

  return router;
}
