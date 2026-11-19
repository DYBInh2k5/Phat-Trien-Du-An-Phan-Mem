import { Errors } from '../../common/errors/app-error.js';
import { ROLES } from '../../common/auth/permissions.js';
import { normalizeName } from '../../common/auth/account-links.js';
import { buildMeta, toOffset } from '../../common/http/pagination.js';

const teacherSummary = (user) => ({
  id: user.id,
  username: user.username,
  fullName: user.fullName,
});

export function createClassesService({
  classesRepository,
  studentsRepository,
  usersRepository,
  audit,
}) {
  /** Giáo viên khớp họ tên GVCN (cách hệ thống liên kết GVCN <-> tài khoản, xem access-policy.js). */
  const teachersNamed = (teachers, name) =>
    name ? teachers.filter((t) => normalizeName(t.fullName) === normalizeName(name)) : [];

  async function requireClass(classId) {
    const klass = await studentsRepository.findClassById(classId);
    if (!klass) {
      throw Errors.notFound('Lớp');
    }
    return klass;
  }

  return {
    /** Danh sách lớp, kèm tài khoản giáo viên đang làm GVCN (rỗng nếu chưa có tài khoản nào khớp tên). */
    async listClasses() {
      const [classes, teachers] = await Promise.all([
        classesRepository.listClasses(),
        usersRepository.listByRole(ROLES.TEACHER),
      ]);
      return classes.map((klass) => ({
        ...klass,
        gvcnTeachers: teachersNamed(teachers, klass.gvcnName).map(teacherSummary),
      }));
    },

    async listStudents(query) {
      const { items, total } = await classesRepository.listStudents({
        classId: query.classId,
        unassigned: query.unassigned,
        q: query.q,
        limit: query.limit,
        offset: toOffset(query),
      });
      return { items, meta: buildMeta(query, total) };
    },

    /** Phân / chuyển lớp cho học sinh; classId = null => rút khỏi lớp. GVCN của lớp mới quản lý ngay. */
    async assignStudentClass(actor, studentId, { classId }) {
      const student = await studentsRepository.findById(studentId);
      if (!student) {
        throw Errors.notFound('Học sinh');
      }
      if (student.status !== 'ACTIVE') {
        throw Errors.badRequest('Học sinh không còn học (status khác ACTIVE), không phân lớp được');
      }
      const klass = classId === null ? null : await requireClass(classId);
      await classesRepository.setStudentClass(student.id, klass?.className ?? null);
      audit.record(actor, 'STUDENT_CLASS_ASSIGN', {
        entity: 'students',
        entityId: student.id,
        before: { className: student.className },
        after: { className: klass?.className ?? null },
      });
      return {
        id: student.id,
        studentCode: student.studentCode,
        fullName: student.fullName,
        className: klass?.className ?? null,
        classId: klass?.id ?? null,
        gvcnName: klass?.gvcnName ?? null,
      };
    },

    /**
     * Phân GVCN cho lớp; teacherUserId = null => bỏ GVCN.
     * Vì GVCN nối với tài khoản qua HỌ TÊN, từ chối nếu có giáo viên khác trùng họ tên (sẽ bị cấp quyền nhầm).
     */
    async assignClassTeacher(actor, classId, { teacherUserId }) {
      const klass = await requireClass(classId);
      let teacher = null;
      if (teacherUserId !== null) {
        teacher = await usersRepository.findById(teacherUserId);
        if (!teacher) {
          throw Errors.notFound('Giáo viên');
        }
        if (teacher.role !== ROLES.TEACHER) {
          throw Errors.badRequest('Tài khoản này không phải giáo viên (role TEACHER)');
        }
        const sameName = teachersNamed(
          await usersRepository.listByRole(ROLES.TEACHER),
          teacher.fullName,
        );
        if (sameName.some((t) => t.id !== teacher.id)) {
          throw Errors.conflict(
            `Có nhiều giáo viên cùng họ tên "${teacher.fullName}". GVCN liên kết theo họ tên nên không phân được; hãy làm họ tên khác nhau trước.`,
          );
        }
      }
      await classesRepository.setClassGvcn(klass.id, teacher?.fullName ?? null);
      audit.record(actor, 'CLASS_TEACHER_ASSIGN', {
        entity: 'school_classes',
        entityId: klass.id,
        before: { gvcnName: klass.gvcnName },
        after: { gvcnName: teacher?.fullName ?? null },
      });
      return {
        id: klass.id,
        className: klass.className,
        gradeLevel: klass.gradeLevel,
        gvcnName: teacher?.fullName ?? null,
        teacher: teacher && teacherSummary(teacher),
      };
    },
  };
}
