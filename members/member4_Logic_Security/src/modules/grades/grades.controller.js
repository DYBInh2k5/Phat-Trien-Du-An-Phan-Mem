import { created, ok } from '../../common/http/response.js';

export function createGradesController({ gradesService }) {
  return {
    async list(req, res) {
      const { items, meta } = await gradesService.listGradeBooks(req.user, req.valid.query);
      ok(res, items, meta);
    },
    async listByStudent(req, res) {
      ok(
        res,
        await gradesService.listStudentGrades(req.user, req.valid.params.id, req.valid.query),
      );
    },
    async summary(req, res) {
      ok(res, await gradesService.getSummary(req.user, req.valid.params.id, req.valid.query));
    },
    async create(req, res) {
      created(res, await gradesService.createGrade(req.user, req.valid.body));
    },
    async update(req, res) {
      ok(res, await gradesService.updateGrade(req.user, req.valid.params.id, req.valid.body));
    },
    async remove(req, res) {
      ok(res, await gradesService.deleteGrade(req.user, req.valid.params.id));
    },
    async restore(req, res) {
      ok(res, await gradesService.restoreGrade(req.user, req.valid.params.id));
    },
    async bulk(req, res) {
      ok(res, await gradesService.bulkUpsert(req.user, req.valid.body));
    },
    async recalculate(req, res) {
      ok(res, await gradesService.recalculateClass(req.user, req.valid.params.id, req.valid.body));
    },
    async lock(req, res) {
      created(res, await gradesService.lockPeriod(req.user, req.valid.body));
    },
    async unlock(req, res) {
      ok(res, await gradesService.unlockPeriod(req.user, req.valid.body));
    },
    async listLocks(req, res) {
      const { items, meta } = await gradesService.listLocks(req.valid.query);
      ok(res, items, meta);
    },
  };
}
