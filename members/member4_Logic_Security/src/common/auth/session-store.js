/**
 * Lưu trạng thái thu hồi phiên TRONG BỘ NHỚ (schema giữ nguyên nên không có bảng refresh_tokens).
 * Giới hạn đã biết: mất khi restart server và không dùng chung giữa nhiều instance.
 * Giao diện giữ nhỏ để sau này thay bằng Redis/DB mà không đổi service.
 */
export function createSessionStore({ now = () => Date.now() } = {}) {
  const revokedSessions = new Map(); // sid -> thời điểm hết hạn (ms)
  const revokedBefore = new Map(); // userId -> mốc (ms): token phát hành trước mốc này bị thu hồi
  const usedRefresh = new Map(); // jti -> thời điểm hết hạn (ms)

  function sweep() {
    const current = now();
    for (const map of [revokedSessions, usedRefresh]) {
      for (const [key, expiresAt] of map) {
        if (expiresAt <= current) {
          map.delete(key);
        }
      }
    }
  }

  return {
    revokeSession(sid, ttlSeconds) {
      sweep();
      revokedSessions.set(sid, now() + ttlSeconds * 1000);
    },
    revokeAllForUser(userId) {
      revokedBefore.set(userId, now());
    },
    isRevoked({ sid, userId, issuedAtMs }) {
      const cutoff = revokedBefore.get(userId);
      return revokedSessions.has(sid) || (cutoff !== undefined && issuedAtMs <= cutoff);
    },
    /** @returns {boolean} true nếu lần đầu dùng; false nếu refresh token này đã dùng rồi (reuse). */
    markRefreshUsed(jti, ttlSeconds) {
      sweep();
      if (usedRefresh.has(jti)) {
        return false;
      }
      usedRefresh.set(jti, now() + ttlSeconds * 1000);
      return true;
    },
  };
}
