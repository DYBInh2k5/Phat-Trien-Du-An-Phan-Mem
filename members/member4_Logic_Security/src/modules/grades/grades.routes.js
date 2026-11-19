import { Router } from 'express';
import { can } from '../../common/middleware/can.js';
import { validate } from '../../common/middleware/validate.js';
import {
  bulkGradesBody,
  createGradeBody,
  idParamSchema,
  listGradeBooksQuery,
  listLocksQuery,
  lockBody,
  recalculateBody,
  termQuery,
  unlockBody,
  updateGradeBody,
} from './grades.schemas.js';

/** Mount tại /api/v1. Mỗi route: authenticate -> can(role) -> validate -> controller (ownership nằm ở service). */
export function createGradesRoutes({ controller, authenticate }) {
  const router = Router();

  // Sổ điểm
  router.get(
    '/grade-books',
    authenticate,
    can('grade:write'),
    validate({ query: listGradeBooksQuery }),
    controller.list,
  );
  router.post(
    '/grade-books',
    authenticate,
    can('grade:write'),
    validate({ body: createGradeBody }),
    controller.create,
  );
  router.post(
    '/grade-books/bulk',
    authenticate,
    can('grade:write'),
    validate({ body: bulkGradesBody }),
    controller.bulk,
  );
  router.put(
    '/grade-books/:id',
    authenticate,
    can('grade:write'),
    validate({ params: idParamSchema, body: updateGradeBody }),
    controller.update,
  );
  router.delete(
    '/grade-books/:id',
    authenticate,
    can('grade:delete'),
    validate({ params: idParamSchema }),
    controller.remove,
  );
  router.post(
    '/grade-books/:id/restore',
    authenticate,
    can('grade:restore'),
    validate({ params: idParamSchema }),
    controller.restore,
  );

  // Xem điểm / tổng kết theo học sinh (ownership kiểm tra trong service)
  router.get(
    '/students/:id/grades',
    authenticate,
    can('grade:read'),
    validate({ params: idParamSchema, query: termQuery }),
    controller.listByStudent,
  );
  router.get(
    '/students/:id/summary',
    authenticate,
    can('grade:read'),
    validate({ params: idParamSchema, query: termQuery }),
    controller.summary,
  );

  router.post(
    '/classes/:id/recalculate',
    authenticate,
    can('grade:write'),
    validate({ params: idParamSchema, body: recalculateBody }),
    controller.recalculate,
  );

  // Khóa / mở chốt sổ
  router.get(
    '/grade-locks',
    authenticate,
    can('grade:lock'),
    validate({ query: listLocksQuery }),
    controller.listLocks,
  );
  router.post(
    '/grade-locks',
    authenticate,
    can('grade:lock'),
    validate({ body: lockBody }),
    controller.lock,
  );
  router.post(
    '/grade-locks/unlock',
    authenticate,
    can('grade:unlock'),
    validate({ body: unlockBody }),
    controller.unlock,
  );

  return router;
}
