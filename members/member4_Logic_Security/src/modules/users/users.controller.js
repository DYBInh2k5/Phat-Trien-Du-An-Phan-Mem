import { created, ok } from '../../common/http/response.js';

export function createUsersController({ usersService }) {
  return {
    async create(req, res) {
      created(res, await usersService.createByAdmin(req.user, req.valid.body));
    },
    async list(req, res) {
      const { items, meta } = await usersService.list(req.valid.query);
      ok(res, items, meta);
    },
    async resetPassword(req, res) {
      const result = await usersService.resetPassword(req.user, req.valid.params.id);
      res.set('Cache-Control', 'no-store'); // response chứa mật khẩu tạm
      ok(res, result);
    },
  };
}
