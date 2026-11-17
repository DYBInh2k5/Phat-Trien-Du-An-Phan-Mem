import { Errors } from '../../common/errors/app-error.js';
import { canAccessStudent, canManageClass } from '../../common/auth/access-policy.js';
import { ROLES } from '../../common/auth/permissions.js';
import { buildMeta, toOffset } from '../../common/http/pagination.js';
import { withTransaction } from '../../db/transaction.js';
import {
  DEFAULT_POLICY,
  UNRANKED_LABEL,
  calcGpa10,
  calcGpa4,
  calcSubjectAverage,
  classifySubjectAverage,
  convertTo4,
  isSubjectComplete,
  rankAcademic,
} from '../academic/domain/index.js';
import { GRADE_STATUS, SCORE_FIELDS, toDomainScores } from './grade.mapper.js';

const samePeriod = (a, b) => a.semester === b.semester && a.schoolYear === b.schoolYear;

export function createGradesService({
  pool,
  config,
  gradesRepository,
  studentsRepository,
  audit,
  policy = DEFAULT_POLICY,
}) {
  // ---------- helpers ----------
  async function loadStudent(studentId, client) {
    const student = await studentsRepository.findById(studentId, client);
    if (!student) {
      throw Errors.notFound('Học sinh');
    }
    return student;
  }

  async function loadClass(classId, client) {
    const klass = await studentsRepository.findClassById(classId, client);
    if (!klass) {
      throw Errors.notFound('Lớp học');
    }
    return klass;
  }

  /** Ghi điểm / chốt sổ: Admin hoặc GVCN của lớp. */
  function assertCanManage(actor, klass) {
    if (!canManageClass(actor, klass)) {
      throw Errors.forbidden(
        'Chỉ Admin hoặc giáo viên chủ nhiệm của lớp mới được thực hiện thao tác này',
      );
    }
  }

  function assertCanView(actor, student) {
    if (!canAccessStudent(actor, student)) {
      throw Errors.forbidden('Bạn không có quyền xem dữ liệu của học sinh này');
    }
  }

  async function assertPeriodOpen(period, client) {
    if (await gradesRepository.isPeriodLocked(period, client)) {
      throw Errors.gradebookLocked();
    }
  }

  const withDefaults = (query) => ({
    semester: query.semester ?? config.currentTerm.semester,
    schoolYear: query.schoolYear ?? config.currentTerm.schoolYear,
  });

  function computeDerived(scores) {
    const averageScore = calcSubjectAverage(scores);
    return { averageScore, gradeLetter: classifySubjectAverage(averageScore, policy) };
  }

  /** Bảng tổng kết học kỳ của một học sinh: TBM từng môn, GPA hệ 10/4, học lực. */
  async function buildSummary(student, { semester, schoolYear }, client) {
    const [subjects, rows, isLocked] = await Promise.all([
      studentsRepository.listSubjects(client),
      gradesRepository.listByStudent(student.id, { semester, schoolYear }, client),
      gradesRepository.isPeriodLocked(
        { className: student.className, semester, schoolYear },
        client,
      ),
    ]);
    const byName = new Map(rows.map((r) => [r.subjectName, r]));

    const entries = subjects.map((subject) => {
      const row = byName.get(subject.name);
      const scores = row ? toDomainScores(row) : {};
      const average = row ? calcSubjectAverage(scores) : null; // tính lại từ điểm gốc, không tin cột lưu sẵn
      return {
        subjectName: subject.name,
        code: subject.code,
        credits: subject.credits,
        averageScore: average,
        score4: average === null ? null : convertTo4(average),
        gradeLetter: classifySubjectAverage(average, policy),
        isComplete: row ? isSubjectComplete(scores) : false,
      };
    });
    const items = entries.map((e) => ({ average: e.averageScore, credits: e.credits }));
    const gpa10 = calcGpa10(items);
    const isComplete = entries.length > 0 && entries.every((e) => e.isComplete);
    return {
      studentId: student.id,
      studentName: student.fullName,
      className: student.className,
      semester,
      schoolYear,
      subjects: entries.map(({ code: _code, ...rest }) => rest),
      gpa10,
      gpa4: calcGpa4(items),
      academicRank: isComplete
        ? rankAcademic(
            { subjects: entries.map((e) => ({ code: e.code, average: e.averageScore })), gpa10 },
            policy,
          )
        : UNRANKED_LABEL,
      isComplete,
      isLocked,
      policy: policy.code,
    };
  }

  /** Cột students.gpa / academic_rank chỉ phản ánh HỌC KỲ HIỆN HÀNH (cấu hình) để không ghi đè lẫn kỳ. */
  async function syncStudentResult(student, period, client) {
    if (!samePeriod(period, config.currentTerm)) {
      return false;
    }
    const summary = await buildSummary(student, period, client);
    const gpa = summary.isComplete ? summary.gpa10 : 0;
    const academicRank = summary.isComplete ? summary.academicRank : UNRANKED_LABEL;
    const changed = Number(student.gpa) !== gpa || student.academicRank !== academicRank;
    if (changed) {
      await studentsRepository.updateAcademicResult(student.id, { gpa, academicRank }, client);
    }
    return changed;
  }

  const snapshot = (grade) => ({
    scoreOral: grade.scoreOral,
    score15m: grade.score15m,
    score1Hour: grade.score1Hour,
    scoreMidTerm: grade.scoreMidTerm,
    scoreFinalTerm: grade.scoreFinalTerm,
    averageScore: grade.averageScore,
    status: grade.status,
  });

  /** Tính lại TBM/xếp loại từng dòng điểm của lớp + đồng bộ GPA học sinh. Dùng trong transaction. */
  async function recalculateClassTerm(klass, period, client) {
    const [students, rows] = await Promise.all([
      studentsRepository.listActiveByClassName(klass.className, client),
      gradesRepository.listActiveByClassTerm({ className: klass.className, ...period }, client),
    ]);
    let gradesUpdated = 0;
    for (const row of rows) {
      const scores = toDomainScores(row);
      const derived = computeDerived(scores);
      if (derived.averageScore !== row.averageScore || derived.gradeLetter !== row.gradeLetter) {
        await gradesRepository.updateScores(row.id, { scores, ...derived }, client);
        gradesUpdated += 1;
      }
    }
    let studentsUpdated = 0;
    for (const student of students) {
      if (await syncStudentResult(student, period, client)) {
        studentsUpdated += 1;
      }
    }
    return { processed: students.length, gradesUpdated, studentsUpdated };
  }

  // ---------- use cases ----------
  return {
    async listGradeBooks(actor, query) {
      const klass = await loadClass(query.classId);
      assertCanManage(actor, klass);
      if (query.includeDeleted && actor.role !== ROLES.ADMIN) {
        throw Errors.forbidden('Chỉ Admin được xem bản ghi đã xóa');
      }
      const period = withDefaults(query);
      const { items, total } = await gradesRepository.list({
        className: klass.className,
        subjectName: query.subjectName,
        ...period,
        includeDeleted: query.includeDeleted,
        sort: query.sort,
        limit: query.limit,
        offset: toOffset(query),
      });
      return { items, meta: buildMeta(query, total) };
    },

    async listStudentGrades(actor, studentId, query) {
      const student = await loadStudent(studentId);
      assertCanView(actor, student);
      return gradesRepository.listByStudent(studentId, query);
    },

    async getSummary(actor, studentId, query) {
      const student = await loadStudent(studentId);
      assertCanView(actor, student);
      return buildSummary(student, withDefaults(query));
    },

    createGrade(actor, input) {
      return withTransaction(pool, async (client) => {
        const student = await loadStudent(input.studentId, client);
        assertCanManage(actor, { gvcnName: student.gvcnName });
        if (student.status !== 'ACTIVE') {
          throw Errors.conflict('Học sinh không ở trạng thái đang học');
        }
        const subject = await studentsRepository.findSubjectByName(input.subjectName, client);
        if (!subject) {
          throw Errors.notFound('Môn học');
        }
        const period = { semester: input.semester, schoolYear: input.schoolYear };
        const key = { studentId: student.id, subjectName: subject.name, ...period };
        await gradesRepository.lockKey(
          client,
          `grade:${student.id}:${subject.name}:${period.semester}:${period.schoolYear}`,
        );
        await assertPeriodOpen({ className: student.className, ...period }, client);
        if (await gradesRepository.findActiveByKey(key, client)) {
          throw Errors.conflict('Điểm môn này trong học kỳ đã tồn tại, hãy dùng PUT để sửa');
        }
        const scores = Object.fromEntries(
          SCORE_FIELDS.map(({ dto, key: k }) => [k, input[dto] ?? null]),
        );
        const grade = await gradesRepository.insert(
          {
            ...key,
            studentCode: student.studentCode,
            studentName: student.fullName,
            className: student.className,
            scores,
            ...computeDerived(scores),
          },
          client,
        );
        await syncStudentResult(student, period, client);
        audit.record(actor, 'GRADE_CREATE', {
          entity: 'grade_books',
          entityId: grade.id,
          after: snapshot(grade),
        });
        return grade;
      });
    },

    updateGrade(actor, id, patch) {
      return withTransaction(pool, async (client) => {
        const current = await gradesRepository.findById(id, { client, forUpdate: true });
        if (!current || current.isDeleted) {
          throw Errors.notFound('Bản ghi điểm');
        }
        const student = await loadStudent(current.studentId, client);
        assertCanManage(actor, { gvcnName: student.gvcnName });
        const period = { semester: current.semester, schoolYear: current.schoolYear };
        await assertPeriodOpen({ className: current.className, ...period }, client);

        const scores = toDomainScores(current);
        for (const { dto, key } of SCORE_FIELDS) {
          if (patch[dto] !== undefined) {
            scores[key] = patch[dto]; // null = xóa điểm
          }
        }
        const updated = await gradesRepository.updateScores(
          id,
          { scores, ...computeDerived(scores) },
          client,
        );
        await syncStudentResult(student, period, client);
        audit.record(actor, 'GRADE_UPDATE', {
          entity: 'grade_books',
          entityId: id,
          before: snapshot(current),
          after: snapshot(updated),
        });
        return updated;
      });
    },

    deleteGrade(actor, id) {
      return withTransaction(pool, async (client) => {
        const current = await gradesRepository.findById(id, { client, forUpdate: true });
        if (!current) {
          throw Errors.notFound('Bản ghi điểm');
        }
        if (current.isDeleted) {
          throw Errors.alreadyDeleted();
        }
        const student = await loadStudent(current.studentId, client);
        assertCanManage(actor, { gvcnName: student.gvcnName });
        const period = { semester: current.semester, schoolYear: current.schoolYear };
        await assertPeriodOpen({ className: current.className, ...period }, client);
        await gradesRepository.setStatus(id, GRADE_STATUS.DELETED, client);
        await syncStudentResult(student, period, client);
        audit.record(actor, 'GRADE_DELETE', {
          entity: 'grade_books',
          entityId: id,
          before: snapshot(current),
        });
        return { id };
      });
    },

    restoreGrade(actor, id) {
      return withTransaction(pool, async (client) => {
        const current = await gradesRepository.findById(id, { client, forUpdate: true });
        if (!current) {
          throw Errors.notFound('Bản ghi điểm');
        }
        if (!current.isDeleted) {
          throw Errors.notDeleted();
        }
        const period = { semester: current.semester, schoolYear: current.schoolYear };
        await gradesRepository.lockKey(
          client,
          `grade:${current.studentId}:${current.subjectName}:${period.semester}:${period.schoolYear}`,
        );
        await assertPeriodOpen({ className: current.className, ...period }, client);
        const duplicate = await gradesRepository.findActiveByKey(
          { studentId: current.studentId, subjectName: current.subjectName, ...period },
          client,
        );
        if (duplicate) {
          throw Errors.conflict(
            'Đã có dòng điểm đang hoạt động cùng học sinh, môn, học kỳ, năm học',
          );
        }
        const restored = await gradesRepository.setStatus(id, GRADE_STATUS.APPROVED, client);
        const student = await loadStudent(current.studentId, client);
        await syncStudentResult(student, period, client);
        audit.record(actor, 'GRADE_RESTORE', {
          entity: 'grade_books',
          entityId: id,
          after: snapshot(restored),
        });
        return restored;
      });
    },

    /** Nhập điểm hàng loạt cho một lớp + môn. Một transaction: lỗi một dòng => rollback tất cả. */
    bulkUpsert(actor, input) {
      return withTransaction(pool, async (client) => {
        const klass = await loadClass(input.classId, client);
        assertCanManage(actor, klass);
        const subject = await studentsRepository.findSubjectByName(input.subjectName, client);
        if (!subject) {
          throw Errors.notFound('Môn học');
        }
        const period = { semester: input.semester, schoolYear: input.schoolYear };
        await gradesRepository.lockKey(
          client,
          `bulk:${klass.className}:${subject.name}:${period.semester}:${period.schoolYear}`,
        );
        await assertPeriodOpen({ className: klass.className, ...period }, client);

        const students = new Map(
          (await studentsRepository.listActiveByClassName(klass.className, client)).map((s) => [
            s.id,
            s,
          ]),
        );
        const problems = [];
        input.entries.forEach((entry, index) => {
          if (!students.has(entry.studentId)) {
            problems.push({
              in: 'body',
              field: `entries.${index}.studentId`,
              message: 'Học sinh không thuộc lớp này',
            });
          }
        });
        if (problems.length > 0) {
          throw Errors.validation(problems);
        }

        let created = 0;
        let updated = 0;
        const items = [];
        for (const entry of input.entries) {
          const student = students.get(entry.studentId);
          const key = { studentId: student.id, subjectName: subject.name, ...period };
          const existing = await gradesRepository.findActiveByKey(key, client);
          const scores = existing
            ? toDomainScores(existing)
            : Object.fromEntries(SCORE_FIELDS.map(({ key: k }) => [k, null]));
          for (const { dto, key: k } of SCORE_FIELDS) {
            if (entry[dto] !== undefined) {
              scores[k] = entry[dto];
            }
          }
          const derived = computeDerived(scores);
          if (existing) {
            items.push(
              await gradesRepository.updateScores(existing.id, { scores, ...derived }, client),
            );
            updated += 1;
          } else {
            items.push(
              await gradesRepository.insert(
                {
                  ...key,
                  studentCode: student.studentCode,
                  studentName: student.fullName,
                  className: klass.className,
                  scores,
                  ...derived,
                },
                client,
              ),
            );
            created += 1;
          }
        }
        for (const student of students.values()) {
          if (input.entries.some((e) => e.studentId === student.id)) {
            await syncStudentResult(student, period, client);
          }
        }
        audit.record(actor, 'GRADE_BULK_UPSERT', {
          entity: 'school_classes',
          entityId: klass.id,
          note: `${subject.name} ${period.semester} ${period.schoolYear}: +${created} ~${updated}`,
        });
        return { created, updated, items };
      });
    },

    recalculateClass(actor, classId, period) {
      return withTransaction(pool, async (client) => {
        const klass = await loadClass(classId, client);
        assertCanManage(actor, klass);
        await gradesRepository.lockKey(
          client,
          `period:${klass.className}:${period.semester}:${period.schoolYear}`,
        );
        await assertPeriodOpen({ className: klass.className, ...period }, client);
        const result = await recalculateClassTerm(klass, period, client);
        audit.record(actor, 'GRADE_RECALCULATE', {
          entity: 'school_classes',
          entityId: klass.id,
          note: JSON.stringify(result),
        });
        return { classId: klass.id, className: klass.className, ...period, ...result };
      });
    },

    // ---------- khóa / mở chốt sổ ----------
    lockPeriod(actor, input) {
      return withTransaction(pool, async (client) => {
        const klass = await loadClass(input.classId, client);
        assertCanManage(actor, klass);
        const period = { semester: input.semester, schoolYear: input.schoolYear };
        await gradesRepository.lockKey(
          client,
          `period:${klass.className}:${period.semester}:${period.schoolYear}`,
        );
        const counts = await gradesRepository.countPeriodByStatus(
          { className: klass.className, ...period },
          client,
        );
        const open = counts[GRADE_STATUS.APPROVED] ?? 0;
        if (open === 0) {
          if ((counts[GRADE_STATUS.LOCKED] ?? 0) > 0) {
            throw Errors.gradebookAlreadyLocked();
          }
          throw Errors.notFound('Dữ liệu điểm của học kỳ này');
        }
        const summary = await recalculateClassTerm(klass, period, client); // tính lại lần cuối trước khi chốt
        const lockedRows = await gradesRepository.transitionPeriod(
          {
            className: klass.className,
            ...period,
            from: GRADE_STATUS.APPROVED,
            to: GRADE_STATUS.LOCKED,
          },
          client,
        );
        audit.record(actor, 'GRADE_LOCK', {
          entity: 'school_classes',
          entityId: klass.id,
          note: input.note ?? `${klass.className} ${period.semester} ${period.schoolYear}`,
        });
        return {
          classId: klass.id,
          className: klass.className,
          ...period,
          lockedRows,
          note: input.note ?? null,
          summary,
        };
      });
    },

    unlockPeriod(actor, input) {
      return withTransaction(pool, async (client) => {
        const klass = await loadClass(input.classId, client);
        const period = { semester: input.semester, schoolYear: input.schoolYear };
        await gradesRepository.lockKey(
          client,
          `period:${klass.className}:${period.semester}:${period.schoolYear}`,
        );
        const unlockedRows = await gradesRepository.transitionPeriod(
          {
            className: klass.className,
            ...period,
            from: GRADE_STATUS.LOCKED,
            to: GRADE_STATUS.APPROVED,
          },
          client,
        );
        if (unlockedRows === 0) {
          throw Errors.conflict('Sổ điểm của kỳ này chưa được chốt');
        }
        audit.record(actor, 'GRADE_UNLOCK', {
          entity: 'school_classes',
          entityId: klass.id,
          note: `${klass.className} ${period.semester} ${period.schoolYear}: ${input.reason}`,
        });
        return {
          classId: klass.id,
          className: klass.className,
          ...period,
          unlockedRows,
          reason: input.reason,
        };
      });
    },

    async listLocks(query) {
      const { items, total } = await gradesRepository.listLockedPeriods({
        limit: query.limit,
        offset: toOffset(query),
      });
      return { items, meta: buildMeta(query, total) };
    },
  };
}
