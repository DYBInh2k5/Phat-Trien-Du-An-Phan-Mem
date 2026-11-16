// Định dạng log kiểu NestJS cho môi trường dev (production vẫn ghi JSON để máy đọc):
//   [HTQLLH] 42892  - 10/14/2026, 9:30:01 AM     LOG [HTTP] GET /api/v1/auth/me 200 - 12ms +3ms

const ANSI = Object.freeze({
  green: 32,
  yellow: 33,
  red: 31,
  magenta: 35,
  cyan: 36,
});

const LEVELS = Object.freeze({
  10: { label: 'VERBOSE', color: 'cyan' },
  20: { label: 'DEBUG', color: 'magenta' },
  30: { label: 'LOG', color: 'green' },
  40: { label: 'WARN', color: 'yellow' },
  50: { label: 'ERROR', color: 'red' },
  60: { label: 'FATAL', color: 'red' },
});

const LABEL_WIDTH = 7; // = độ dài 'VERBOSE', căn phải như Nest

/** Ngữ cảnh + nội dung cho từng loại log (HTTP, audit, thường). */
function describe(log) {
  if (log.audit) {
    const { action, actorId, impersonatedBy, entity, entityId, note } = log.audit;
    const parts = [action, `actor=${actorId}`];
    if (impersonatedBy) {
      parts.push(`imp=${impersonatedBy}`);
    }
    parts.push(entityId === null || entityId === undefined ? entity : `${entity}#${entityId}`);
    if (note) {
      parts.push(`(${note})`);
    }
    return { context: 'Audit', message: parts.join(' ') };
  }
  if (log.req && log.res) {
    const time = log.responseTime === undefined ? '' : ` - ${log.responseTime}ms`;
    return {
      context: 'HTTP',
      message: `${log.req.method} ${log.req.url} ${log.res.statusCode}${time}`,
    };
  }
  return { context: log.context ?? 'App', message: log.msg ?? '' };
}

/**
 * @param {{ appName?: string, colorize?: boolean }} [options]
 * @returns {(log: Record<string, any>) => string} biến 1 bản ghi pino thành 1 dòng log (kèm stack nếu có lỗi)
 */
export function createNestFormatter({ appName = 'HTQLLH', colorize = true } = {}) {
  const paint = (color, text) => (colorize ? `\u001b[${ANSI[color]}m${text}\u001b[0m` : text);
  let previous;

  return (log) => {
    const level = LEVELS[log.level] ?? LEVELS[30];
    const { context, message } = describe(log);
    const time = new Date(log.time).toLocaleString('en-US');
    const delta = previous === undefined ? '' : ` ${paint('yellow', `+${log.time - previous}ms`)}`;
    previous = log.time;

    let line =
      `${paint(level.color, `[${appName}] ${log.pid}  -`)} ${time} ` +
      `${paint(level.color, level.label.padStart(LABEL_WIDTH))} ` +
      `${paint('yellow', `[${context}]`)} ${paint(level.color, message)}${delta}`;

    const err = log.err ?? log.error;
    if (err?.stack) {
      line += `\n${paint('red', err.stack)}`;
    }
    return line;
  };
}
