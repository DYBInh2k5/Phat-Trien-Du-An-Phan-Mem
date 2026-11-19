import { Errors } from '../errors/app-error.js';

/**
 * Yêu cầu Bearer access token hợp lệ, chưa bị thu hồi. Gắn req.user (role đọc từ DB).
 * req.user = { id, username, fullName, role, sid, impersonatedBy }
 */
export function createAuthenticate({ tokenService, sessionStore, usersRepository }) {
  return async (req, _res, next) => {
    try {
      const header = req.get('authorization') ?? '';
      const [scheme, token] = header.split(' ');
      if (scheme !== 'Bearer' || !token) {
        throw Errors.unauthenticated();
      }
      const claims = tokenService.verifyAccess(token);
      if (
        sessionStore.isRevoked({ sid: claims.sid, userId: claims.userId, issuedAtMs: claims.ims })
      ) {
        throw Errors.unauthenticated('Phiên đăng nhập đã bị thu hồi');
      }
      const user = await usersRepository.findById(claims.userId);
      if (!user) {
        throw Errors.unauthenticated();
      }
      req.user = {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        sid: claims.sid,
        impersonatedBy: claims.imp ?? null,
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}
