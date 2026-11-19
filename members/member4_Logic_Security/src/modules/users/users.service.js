import { Errors } from '../../common/errors/app-error.js';
import { ROLES } from '../../common/auth/permissions.js';
import { parentUsername, studentUsername } from '../../common/auth/account-links.js';
import { generatePassword as defaultGeneratePassword } from '../../common/auth/password-generator.js';
import { buildMeta, toOffset } from '../../common/http/pagination.js';
import { toPublicUser } from './users.repository.js';

export function createUsersService({
  usersRepository,
  studentsRepository,
  passwordHasher,
  sessionStore,
  audit,
  generatePassword = defaultGeneratePassword,
}) {
  async function requireActiveStudent(studentCode) {
    const student = await studentsRepository.findByCode(studentCode);
    if (!student || student.status !== 'ACTIVE') {
      return null;
    }
    return student;
  }

  async function createAccount({ username, password, fullName, role }) {
    if (await usersRepository.findByUsername(username)) {
      throw Errors.conflict('Tài khoản đã tồn tại');
    }
    const passwordHash = await passwordHasher.hash(password);
    return usersRepository.create({ username, passwordHash, fullName, role });
  }

  return {
    /** Admin cấp tài khoản cho mọi role (đường duy nhất để tạo tài khoản). */
    async createByAdmin(actor, input) {
      let account;
      if (input.role === ROLES.STUDENT || input.role === ROLES.PARENT) {
        const student = await requireActiveStudent(input.studentCode);
        if (!student) {
          throw Errors.notFound('Học sinh');
        }
        account =
          input.role === ROLES.STUDENT
            ? { username: studentUsername(student.studentCode), fullName: student.fullName }
            : {
                username: parentUsername(student.studentCode),
                fullName: input.fullName ?? student.parentName ?? `Phụ huynh ${student.fullName}`,
              };
      } else {
        account = { username: input.username, fullName: input.fullName };
      }
      const user = await createAccount({ ...account, password: input.password, role: input.role });
      audit.record(actor, 'USER_CREATE', {
        entity: 'users',
        entityId: user.id,
        after: { role: user.role, username: user.username },
      });
      const result = toPublicUser(user);
      if (user.role === ROLES.TEACHER) {
        // Báo cho Admin biết giáo viên này đang là GVCN của lớp nào (liên kết theo họ tên).
        const classes = await studentsRepository.listClassesByGvcn(user.fullName);
        result.managedClasses = classes.map((klass) => klass.className);
      }
      return result;
    },

    async list(query) {
      const { items, total } = await usersRepository.list({
        role: query.role,
        q: query.q,
        sort: query.sort,
        limit: query.limit,
        offset: toOffset(query),
      });
      return { items: items.map(toPublicUser), meta: buildMeta(query, total) };
    },

    /**
     * Admin reset mật khẩu khi người dùng quên. Server sinh mật khẩu tạm ngẫu nhiên (Admin không tự đặt),
     * trả về ĐÚNG MỘT LẦN để Admin chuyển cho người dùng; DB chỉ lưu hash. Mọi phiên cũ của user bị thu hồi.
     */
    async resetPassword(actor, userId) {
      const target = await usersRepository.findById(userId);
      if (!target) {
        throw Errors.notFound('Người dùng');
      }
      const temporaryPassword = generatePassword();
      await usersRepository.updatePassword(target.id, await passwordHasher.hash(temporaryPassword));
      sessionStore.revokeAllForUser(target.id);
      audit.record(actor, 'USER_PASSWORD_RESET', { entity: 'users', entityId: target.id });
      return { userId: target.id, username: target.username, temporaryPassword };
    },
  };
}
