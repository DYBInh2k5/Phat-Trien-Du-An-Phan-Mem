import { createAuditLogger } from './common/auth/audit-logger.js';
import { createPasswordHasher } from './common/auth/password-hasher.js';
import { createSessionStore } from './common/auth/session-store.js';
import { createTokenService } from './common/auth/token-service.js';
import { createAuthenticate } from './common/middleware/authenticate.js';
import { createIpLimiter, createLoginLimiter } from './common/middleware/rate-limit.js';
import { POLICIES } from './modules/academic/domain/index.js';
import { createAuthController } from './modules/auth/auth.controller.js';
import { createAuthRoutes } from './modules/auth/auth.routes.js';
import { createAuthService } from './modules/auth/auth.service.js';
import { createConductRoutes } from './modules/conduct/conduct.routes.js';
import { createClassesRepository } from './modules/classes/classes.repository.js';
import { createClassesRoutes } from './modules/classes/classes.routes.js';
import { createClassesService } from './modules/classes/classes.service.js';
import { createConductService } from './modules/conduct/conduct.service.js';
import { createGradesController } from './modules/grades/grades.controller.js';
import { createGradesRepository } from './modules/grades/grades.repository.js';
import { createGradesRoutes } from './modules/grades/grades.routes.js';
import { createGradesService } from './modules/grades/grades.service.js';
import { createStudentsRepository } from './modules/students/students.repository.js';
import { createUsersController } from './modules/users/users.controller.js';
import { createUsersRepository } from './modules/users/users.repository.js';
import { createUsersRoutes } from './modules/users/users.routes.js';
import { createUsersService } from './modules/users/users.service.js';

/**
 * Composition root: nơi DUY NHẤT nối các tầng với nhau (dependency injection thủ công).
 * Controller -> Service -> Repository; domain học thuật là hàm thuần nên không cần inject.
 * @returns {{ routers: { path: string, router: import('express').Router }[], usersRepository: object }}
 */
export function buildContainer({ config, pool, logger }) {
  const audit = createAuditLogger(logger);
  const passwordHasher = createPasswordHasher(config.bcryptRounds);
  const sessionStore = createSessionStore();
  const tokenService = createTokenService({
    accessSecret: config.jwt.accessSecret,
    refreshSecret: config.jwt.refreshSecret,
    accessTtlSeconds: config.jwt.accessTtlSeconds,
    refreshTtlSeconds: config.jwt.refreshTtlSeconds,
  });

  // Repositories (chỉ SQL)
  const usersRepository = createUsersRepository(pool);
  const studentsRepository = createStudentsRepository(pool);
  const gradesRepository = createGradesRepository(pool);

  // Middleware dùng chung
  const authenticate = createAuthenticate({ tokenService, sessionStore, usersRepository });
  const loginLimiter = createLoginLimiter(config.rateLimitEnabled);
  const ipLimiter = createIpLimiter(config.rateLimitEnabled);

  // Services (nghiệp vụ)
  const usersService = createUsersService({
    usersRepository,
    studentsRepository,
    passwordHasher,
    sessionStore,
    audit,
  });
  const authService = createAuthService({
    config,
    usersRepository,
    studentsRepository,
    passwordHasher,
    tokenService,
    sessionStore,
    audit,
  });
  const policy = POLICIES[config.gradingPolicy];
  if (!policy) {
    throw new Error(
      `GRADING_POLICY không hợp lệ: ${config.gradingPolicy}. Hợp lệ: ${Object.keys(POLICIES).join(', ')}`,
    );
  }
  const gradesService = createGradesService({
    pool,
    config,
    gradesRepository,
    studentsRepository,
    audit,
    policy,
  });
  const conductService = createConductService({ studentsRepository });
  const classesService = createClassesService({
    classesRepository: createClassesRepository(pool),
    studentsRepository,
    usersRepository,
    audit,
  });

  return {
    usersRepository,
    routers: [
      {
        path: '/auth',
        router: createAuthRoutes({
          controller: createAuthController({ authService }),
          authenticate,
          loginLimiter,
          ipLimiter,
        }),
      },
      {
        path: '/users',
        router: createUsersRoutes({
          controller: createUsersController({ usersService }),
          authenticate,
        }),
      },
      {
        path: '/',
        router: createGradesRoutes({
          controller: createGradesController({ gradesService }),
          authenticate,
        }),
      },
      { path: '/', router: createConductRoutes({ conductService, authenticate }) },
      { path: '/', router: createClassesRoutes({ classesService, authenticate }) },
    ],
  };
}
