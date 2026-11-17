import { Router } from 'express';
import { can } from '../../common/middleware/can.js';
import { validate } from '../../common/middleware/validate.js';
import { idParamSchema } from '../../common/http/schemas.js';
import { ok } from '../../common/http/response.js';
import { conductQuery } from './conduct.schemas.js';

export function createConductRoutes({ conductService, authenticate }) {
  const router = Router();
  router.get(
    '/students/:id/conduct-suggestion',
    authenticate,
    can('conduct:read'),
    validate({ params: idParamSchema, query: conductQuery }),
    async (req, res) => {
      ok(res, await conductService.getSuggestion(req.user, req.valid.params.id, req.valid.query));
    },
  );
  return router;
}
