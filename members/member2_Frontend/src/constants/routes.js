import { ROLES } from './roles.js';

export const ROUTES = {
  LOGIN:                '/login',
  UNAUTHORIZED:         '/unauthorized',
  BGH_DASHBOARD:        '/bgh/dashboard',
  GVCN_DASHBOARD:       '/gvcn/dashboard',
  GV_DASHBOARD:         '/gv/dashboard',
  PARENT_DASHBOARD:     '/parent/dashboard',
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
  [ROLES.BGH]:  ROUTES.BGH_DASHBOARD,
  [ROLES.GVCN]: ROUTES.GVCN_DASHBOARD,
  [ROLES.GV]:   ROUTES.GV_DASHBOARD,
  [ROLES.HS]:   ROUTES.STUDENT_GRADEBOOK,
  [ROLES.PH]:   ROUTES.PARENT_DASHBOARD,
};
