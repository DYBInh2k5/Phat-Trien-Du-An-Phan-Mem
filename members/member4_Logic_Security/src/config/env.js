import { z } from 'zod';

const booleanString = (defaultValue) =>
  z
    .enum(['true', 'false'])
    .default(defaultValue)
    .transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  // pretty = in đẹp kiểu NestJS, json = JSON của pino. Bỏ trống: production => json, còn lại => pretty
  LOG_FORMAT: z.enum(['pretty', 'json']).optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL là bắt buộc'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET phải >= 32 ký tự'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET phải >= 32 ký tự'),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(604800),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
  DEMO_MODE: booleanString('false'),
  RATE_LIMIT_ENABLED: booleanString('true'),
  CORS_ORIGINS: z
    .string()
    .default('')
    .transform((value) =>
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  GRADING_POLICY: z.string().default('LEGACY_5_LEVELS'),
  CURRENT_SEMESTER: z.enum(['HK1', 'HK2']).default('HK1'),
  CURRENT_SCHOOL_YEAR: z
    .string()
    .regex(/^\d{4}-\d{4}$/)
    .default('2025-2026'),
});

/**
 * Đọc và kiểm tra biến môi trường. Thiếu/sai là dừng ngay (fail fast).
 * @param {Record<string, string | undefined>} source
 */
export function loadConfig(source = process.env) {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const lines = parsed.error.issues.map(
      (issue) => `  - ${issue.path.join('.')}: ${issue.message}`,
    );
    throw new Error(`Cấu hình môi trường không hợp lệ:\n${lines.join('\n')}`);
  }
  const env = parsed.data;
  if (env.NODE_ENV === 'production' && env.DEMO_MODE) {
    throw new Error('DEMO_MODE không được bật ở production');
  }
  if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_ACCESS_SECRET và JWT_REFRESH_SECRET phải khác nhau');
  }
  return Object.freeze({
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    logLevel: env.LOG_LEVEL,
    logFormat: env.LOG_FORMAT ?? (env.NODE_ENV === 'production' ? 'json' : 'pretty'),
    databaseUrl: env.DATABASE_URL,
    jwt: Object.freeze({
      accessSecret: env.JWT_ACCESS_SECRET,
      refreshSecret: env.JWT_REFRESH_SECRET,
      accessTtlSeconds: env.ACCESS_TOKEN_TTL_SECONDS,
      refreshTtlSeconds: env.REFRESH_TOKEN_TTL_SECONDS,
    }),
    bcryptRounds: env.BCRYPT_ROUNDS,
    gradingPolicy: env.GRADING_POLICY,
    demoMode: env.DEMO_MODE,
    rateLimitEnabled: env.RATE_LIMIT_ENABLED,
    corsOrigins: env.CORS_ORIGINS,
    currentTerm: Object.freeze({
      semester: env.CURRENT_SEMESTER,
      schoolYear: env.CURRENT_SCHOOL_YEAR,
    }),
  });
}
