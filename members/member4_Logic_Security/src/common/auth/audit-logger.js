/**
 * Nhật ký kiểm toán. Schema giữ nguyên nên chưa có bảng audit_logs => ghi ra log có cấu trúc
 * (JSON, field `audit`). Giao diện giữ nguyên để sau này đổi sang ghi DB mà không sửa nơi gọi.
 */
export function createAuditLogger(logger) {
  return {
    /**
     * @param {{ id: number, impersonatedBy?: number | null }} actor
     * @param {string} action vd GRADE_UPDATE
     * @param {{ entity: string, entityId?: number | string | null, before?: unknown, after?: unknown, note?: string }} detail
     */
    record(actor, action, detail) {
      logger.info(
        {
          audit: {
            actorId: actor.id,
            impersonatedBy: actor.impersonatedBy ?? null,
            action,
            ...detail,
          },
        },
        `audit ${action}`,
      );
    },
  };
}
