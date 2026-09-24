import { ROLES } from './roles.js';

export const ROUTES = {
  LOGIN:                '/login',
  UNAUTHORIZED:         '/unauthorized',
  GV_DASHBOARD:         '/gv/dashboard',
  BGH_DASHBOARD:        '/bgh/dashboard',
  STUDENTS:             '/students',
  GRADEBOOK:            '/gradebook',
  ATTENDANCE:           '/attendance',
  BGH_ATTENDANCE:       '/bgh/attendance',
  SCHEDULE:             '/schedule',
  BGH_SCHEDULE_ADMIN:   '/bgh/schedule-admin',
  PARENT_COMMUNICATION: '/parent-communication',
  BGH_REPORTS:          '/bgh/reports',
  BGH_SETTINGS:         '/bgh/settings',
  STUDENT_GRADEBOOK:    '/student/gradebook',
  STUDENT_ATTENDANCE:   '/student/attendance',
  STUDENT_SCHEDULE:     '/student/schedule',
  STUDENT_EXAMS:        '/student/exams',
};

export const ROLE_DASHBOARD = {
  [ROLES.GV]:   ROUTES.GV_DASHBOARD,
  [ROLES.GVCN]: ROUTES.GV_DASHBOARD,
  [ROLES.BGH]:  ROUTES.BGH_DASHBOARD,
  [ROLES.PH]:   ROUTES.STUDENT_GRADEBOOK,
  [ROLES.HS]:   ROUTES.STUDENT_GRADEBOOK,
};
