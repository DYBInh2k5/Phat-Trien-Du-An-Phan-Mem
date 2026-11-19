import { done, ok } from '../../common/http/response.js';

const context = (req) => ({ ip: req.ip, userAgent: req.get('user-agent') ?? null });

export function createAuthController({ authService }) {
  return {
    async login(req, res) {
      ok(res, await authService.login(req.valid.body, context(req)));
    },
    async refresh(req, res) {
      ok(res, await authService.refresh(req.valid.body));
    },
    logout(req, res) {
      authService.logout(req.user);
      done(res);
    },
    logoutAll(req, res) {
      authService.logoutAll(req.user);
      done(res);
    },
    async changePassword(req, res) {
      await authService.changePassword(req.user, req.valid.body);
      done(res);
    },
    async me(req, res) {
      ok(res, await authService.me(req.user));
    },
    async switchRole(req, res) {
      ok(res, await authService.switchRole(req.user, req.valid.body));
    },
    async switchBack(req, res) {
      ok(res, await authService.switchBack(req.user));
    },
  };
}
