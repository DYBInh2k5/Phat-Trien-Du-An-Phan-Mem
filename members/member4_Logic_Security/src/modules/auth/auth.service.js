import { Errors } from '../../common/errors/app-error.js';
import { ROLES } from '../../common/auth/permissions.js';
import { linkedStudentCode } from '../../common/auth/account-links.js';
import { toPublicUser } from '../users/users.repository.js';

export function createAuthService({
  config,
  usersRepository,
  studentsRepository,
  passwordHasher,
  tokenService,
  sessionStore,
  audit,
}) {
  /** Phát hành cặp token cho một phiên mới. */
  function issueSession(user, { withRefresh = true, impersonatedBy } = {}) {
    const sid = tokenService.newSessionId();
    const result = {
      accessToken: tokenService.signAccess({ userId: user.id, sid, impersonatedBy }),
      tokenType: 'Bearer',
      expiresIn: tokenService.accessTtlSeconds,
      user: toPublicUser(user),
    };
    if (withRefresh) {
      result.refreshToken = tokenService.signRefresh({ userId: user.id, sid });
    }
    if (impersonatedBy) {
      result.impersonatedBy = impersonatedBy;
    }
    return result;
  }

  return {
    async login({ username, password }, context) {
      const user = await usersRepository.findByUsername(username);
      const valid = user
        ? await passwordHasher.verify(password, user.passwordHash)
        : await passwordHasher.verifyDummy(password);
      if (!user || !valid) {
        audit.record({ id: user?.id ?? 0 }, 'LOGIN_FAILED', {
          entity: 'users',
          entityId: user?.id ?? null,
          note: context.ip,
        });
        throw Errors.invalidCredentials(); // cùng một thông báo cho cả "sai user" và "sai mật khẩu"
      }
      audit.record(user, 'LOGIN', { entity: 'users', entityId: user.id, note: context.ip });
      return issueSession(user);
    },

    /** Xoay vòng refresh token: mỗi token dùng đúng 1 lần; dùng lại => thu hồi cả phiên. */
    async refresh({ refreshToken }) {
      const claims = tokenService.verifyRefresh(refreshToken);
      if (
        sessionStore.isRevoked({ sid: claims.sid, userId: claims.userId, issuedAtMs: claims.ims })
      ) {
        throw Errors.refreshTokenInvalid();
      }
      if (!sessionStore.markRefreshUsed(claims.jti, tokenService.refreshTtlSeconds)) {
        sessionStore.revokeSession(claims.sid, tokenService.refreshTtlSeconds);
        audit.record({ id: claims.userId }, 'REFRESH_REUSE_DETECTED', {
          entity: 'sessions',
          entityId: claims.sid,
        });
        throw Errors.refreshTokenInvalid();
      }
      const user = await usersRepository.findById(claims.userId);
      if (!user) {
        throw Errors.refreshTokenInvalid();
      }
      return {
        accessToken: tokenService.signAccess({ userId: user.id, sid: claims.sid }),
        refreshToken: tokenService.signRefresh({ userId: user.id, sid: claims.sid }),
        tokenType: 'Bearer',
        expiresIn: tokenService.accessTtlSeconds,
        user: toPublicUser(user),
      };
    },

    logout(actor) {
      sessionStore.revokeSession(actor.sid, tokenService.refreshTtlSeconds);
      audit.record(actor, 'LOGOUT', { entity: 'sessions', entityId: actor.sid });
      return null;
    },

    logoutAll(actor) {
      sessionStore.revokeAllForUser(actor.id);
      audit.record(actor, 'LOGOUT_ALL', { entity: 'users', entityId: actor.id });
      return null;
    },

    /**
     * Người dùng tự đổi mật khẩu của CHÍNH MÌNH (Admin không đổi hộ được).
     * Đổi xong thu hồi mọi phiên, kể cả phiên hiện tại => đăng nhập lại bằng mật khẩu mới.
     */
    async changePassword(actor, { currentPassword, newPassword }) {
      if (actor.impersonatedBy) {
        throw Errors.forbidden('Không được đổi mật khẩu khi đang đăng nhập thay người khác');
      }
      const user = await usersRepository.findById(actor.id);
      if (!user) {
        throw Errors.unauthenticated();
      }
      if (!(await passwordHasher.verify(currentPassword, user.passwordHash))) {
        audit.record(actor, 'PASSWORD_CHANGE_FAILED', { entity: 'users', entityId: actor.id });
        throw Errors.badRequest('Mật khẩu hiện tại không đúng');
      }
      await usersRepository.updatePassword(user.id, await passwordHasher.hash(newPassword));
      sessionStore.revokeAllForUser(user.id);
      audit.record(actor, 'PASSWORD_CHANGE', { entity: 'users', entityId: user.id });
      return null;
    },

    async me(actor) {
      let linkedStudentIds = [];
      let managedClasses = [];
      const code = linkedStudentCode(actor);
      if (code) {
        const student = await studentsRepository.findByCode(code);
        linkedStudentIds = student ? [student.id] : [];
      } else if (actor.role === ROLES.TEACHER) {
        const classes = await studentsRepository.listClassesByGvcn(actor.fullName);
        managedClasses = classes.map((klass) => ({ id: klass.id, className: klass.className }));
      }
      return {
        user: {
          id: actor.id,
          username: actor.username,
          fullName: actor.fullName,
          role: actor.role,
        },
        sessionId: actor.sid,
        impersonatedBy: actor.impersonatedBy,
        linkedStudentIds,
        managedClasses,
      };
    },

    /**
     * Quick Role Switcher.
     *  - targetUserId : chỉ ADMIN thật (impersonate), mọi môi trường.
     *  - targetRole   : chỉ khi DEMO_MODE=true, đổi sang tài khoản đầu tiên của role đó.
     * Token chỉ có access (15 phút), không refresh; luôn kèm claim imp để truy vết và switch-back.
     */
    async switchRole(actor, input) {
      if (actor.impersonatedBy) {
        throw Errors.forbidden(
          'Đang ở chế độ chuyển vai trò. Hãy quay lại tài khoản gốc (switch-back) trước.',
        );
      }
      let target;
      if ('targetUserId' in input) {
        if (actor.role !== ROLES.ADMIN) {
          throw Errors.forbidden('Chỉ Admin mới được đăng nhập thay người khác');
        }
        target = await usersRepository.findById(input.targetUserId);
        if (!target) {
          throw Errors.notFound('Người dùng');
        }
      } else {
        if (!config.demoMode) {
          throw Errors.forbidden('Chế độ demo đang tắt');
        }
        target = await usersRepository.findFirstByRole(input.targetRole);
        if (!target) {
          throw Errors.notFound(`Tài khoản demo vai trò ${input.targetRole}`);
        }
      }
      audit.record(actor, 'SWITCH_ROLE', {
        entity: 'users',
        entityId: target.id,
        note: `${actor.role}->${target.role}`,
      });
      return issueSession(target, { withRefresh: false, impersonatedBy: actor.id });
    },

    /** Quay về tài khoản gốc, cấp phiên mới đầy đủ. */
    async switchBack(actor) {
      if (!actor.impersonatedBy) {
        throw Errors.badRequest('Bạn không ở chế độ chuyển vai trò');
      }
      const original = await usersRepository.findById(actor.impersonatedBy);
      if (!original) {
        throw Errors.unauthenticated();
      }
      sessionStore.revokeSession(actor.sid, tokenService.accessTtlSeconds);
      audit.record(original, 'SWITCH_BACK', { entity: 'users', entityId: actor.id });
      return issueSession(original);
    },
  };
}
