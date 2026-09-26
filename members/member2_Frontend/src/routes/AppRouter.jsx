import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../constants/roles.js';
import { ROUTES, ROLE_DASHBOARD } from '../constants/routes.js';

import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import MainLayout from '../components/layout/MainLayout.jsx';

// Auth pages
import LoginPage from '../pages/auth/LoginPage.jsx';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage.jsx';
import NotFoundPage from '../pages/shared/NotFoundPage.jsx';

// GV pages
import GVDashboardPage from '../pages/gv/GVDashboardPage.jsx';
import GradebookPage from '../pages/gv/GradebookPage.jsx';
import AttendancePage from '../pages/gv/AttendancePage.jsx';

// Student pages
import StudentListPage from '../pages/students/StudentListPage.jsx';

// Schedule pages
import TimetablePage from '../pages/schedule/TimetablePage.jsx';

// Communication pages
import ParentCommunicationPage from '../pages/communication/ParentCommunicationPage.jsx';

// BGH pages
import BGHDashboardPage from '../pages/bgh/BGHDashboardPage.jsx';
import BGHAttendanceMonitorPage from '../pages/bgh/BGHAttendanceMonitorPage.jsx';
import ScheduleAdminPage from '../pages/bgh/ScheduleAdminPage.jsx';
import BGHReportCenterPage from '../pages/bgh/BGHReportCenterPage.jsx';
import SystemSettingsPage from '../pages/bgh/SystemSettingsPage.jsx';

// Student portal pages
import StudentGradebookPage from '../pages/student/StudentGradebookPage.jsx';
import StudentAttendancePage from '../pages/student/StudentAttendancePage.jsx';
import StudentSchedulePage from '../pages/student/StudentSchedulePage.jsx';
import StudentExamsPage from '../pages/student/StudentExamsPage.jsx';

export default function AppRouter() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        index
        element={
          isAuthenticated
            ? <Navigate to={ROLE_DASHBOARD[role]} replace />
            : <Navigate to={ROUTES.LOGIN} replace />
        }
      />

      {/* Public routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

      {/* Protected routes inside MainLayout */}
      <Route element={<MainLayout />}>
        {/* GV / GVCN only */}
        <Route element={<ProtectedRoute roles={[ROLES.GV, ROLES.GVCN]} />}>
          <Route path={ROUTES.GV_DASHBOARD} element={<GVDashboardPage />} />
          <Route path={ROUTES.ATTENDANCE} element={<AttendancePage />} />
        </Route>

        {/* GV / GVCN / BGH */}
        <Route element={<ProtectedRoute roles={[ROLES.GV, ROLES.GVCN, ROLES.BGH]} />}>
          <Route path={ROUTES.STUDENTS} element={<StudentListPage />} />
          <Route path={ROUTES.GRADEBOOK} element={<GradebookPage />} />
        </Route>

        {/* GV / GVCN / PH / HS */}
        <Route element={<ProtectedRoute roles={[ROLES.GV, ROLES.GVCN, ROLES.PH, ROLES.HS]} />}>
          <Route path={ROUTES.SCHEDULE} element={<TimetablePage />} />
        </Route>

        {/* GVCN / BGH / PH */}
        <Route element={<ProtectedRoute roles={[ROLES.GVCN, ROLES.BGH, ROLES.PH]} />}>
          <Route path={ROUTES.PARENT_COMMUNICATION} element={<ParentCommunicationPage />} />
        </Route>

        {/* BGH only */}
        <Route element={<ProtectedRoute roles={[ROLES.BGH]} />}>
          <Route path={ROUTES.BGH_DASHBOARD} element={<BGHDashboardPage />} />
          <Route path={ROUTES.BGH_ATTENDANCE} element={<BGHAttendanceMonitorPage />} />
          <Route path={ROUTES.BGH_SCHEDULE_ADMIN} element={<ScheduleAdminPage />} />
          <Route path={ROUTES.BGH_REPORTS} element={<BGHReportCenterPage />} />
          <Route path={ROUTES.BGH_SETTINGS} element={<SystemSettingsPage />} />
        </Route>

        {/* HS / PH routes */}
        <Route element={<ProtectedRoute roles={[ROLES.HS, ROLES.PH]} />}>
          <Route path={ROUTES.STUDENT_GRADEBOOK}  element={<StudentGradebookPage />} />
          <Route path={ROUTES.STUDENT_ATTENDANCE} element={<StudentAttendancePage />} />
          <Route path={ROUTES.STUDENT_SCHEDULE}   element={<StudentSchedulePage />} />
          <Route path={ROUTES.STUDENT_EXAMS}      element={<StudentExamsPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
