/**
 * Member 3 / Backend Architecture - Centralized Audit Logger Service (Week 8)
 * Records audit logs for grade modifications, authentication events, and leave approvals
 */

const auditLogs = [];

export class AuditLogger {
  static log({ action, user, role, entity, entityId, previousValue, newValue, ipAddress }) {
    const logEntry = {
      id: auditLogs.length + 1,
      timestamp: new Date().toISOString(),
      action,
      user,
      role,
      entity,
      entityId,
      previousValue: previousValue || null,
      newValue: newValue || null,
      ipAddress: ipAddress || '127.0.0.1'
    };

    auditLogs.push(logEntry);
    console.log(`[AUDIT LOG] [${logEntry.timestamp}] User "${user}" (${role}) performed "${action}" on ${entity} #${entityId}`);
    return logEntry;
  }

  static getAuditLogs(filter = {}) {
    let result = [...auditLogs];
    if (filter.entity) result = result.filter(l => l.entity === filter.entity);
    if (filter.user) result = result.filter(l => l.user === filter.user);
    return result;
  }
}
