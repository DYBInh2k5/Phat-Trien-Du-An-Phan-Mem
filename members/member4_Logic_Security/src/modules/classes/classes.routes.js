import { Router } from 'express';
import { can } from '../../common/middleware/can.js';
import { validate } from '../../common/middleware/validate.js';
import { idParamSchema } from '../../common/http/schemas.js';
import { ok } from '../../common/http/response.js';
import {
  assignClassTeacherBody,
  assignStudentClassBody,
  listStudentsQuery,
} from './classes.schemas.js';

/** Mount tại /api/v1. Phân lớp cho học sinh và phân GVCN cho lớp: chỉ Admin. */
export function createClassesRoutes({ classesService, authenticate }) {
  const router = Router();
  router.get('/classes', authenticate, can('class:manage'), async (_req, res) => {
    ok(res, await classesService.listClasses());
  });
  router.put(
    '/classes/:id/teacher',
    authenticate,
    can('class:manage'),
    validate({ params: idParamSchema, body: assignClassTeacherBody }),
    async (req, res) => {
      ok(
        res,
        await classesService.assignClassTeacher(req.user, req.valid.params.id, req.valid.body),
      );
    },
  );
  router.get(
    '/students',
    authenticate,
    can('class:manage'),
    validate({ query: listStudentsQuery }),
    async (req, res) => {
      const { items, meta } = await classesService.listStudents(req.valid.query);
      ok(res, items, meta);
    },
  );
  router.put(
    '/students/:id/class',
    authenticate,
    can('class:manage'),
    validate({ params: idParamSchema, body: assignStudentClassBody }),
    async (req, res) => {
      ok(
        res,
        await classesService.assignStudentClass(req.user, req.valid.params.id, req.valid.body),
      );
    },
  );
  return router;
}
