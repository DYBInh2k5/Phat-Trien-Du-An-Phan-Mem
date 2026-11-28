import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../constants/roles.js';
import { ROUTES, ROLE_DASHBOARD } from '../constants/routes.js';

import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import MainLayout from '../components/layout/MainLayout.jsx';

// Auth pages (Lazy loaded for optimized initial bundle)
const LoginPage = lazy(() => import('../pages/auth/LoginPage.jsx'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage.jsx'));
const UnauthorizedPage = lazy(() => import('../pages/auth/UnauthorizedPage.jsx'));
const NotFoundPage = lazy(() => import('../pages/shared/NotFoundPage.jsx'));

// GV & GVCN pages
const GVDashboardPage = lazy(() => import('../pages/gv/GVDashboardPage.jsx'));
const GVCNDashboardPage = lazy(() => import('../pages/gv/GVCNDashboardPage.jsx'));
const GradebookPage = lazy(() => import('../pages/gv/GradebookPage.jsx'));
const AttendancePage = lazy(() => import('../pages/gv/AttendancePage.jsx'));

// Student pages
const StudentListPage = lazy(() => import('../pages/students/StudentListPage.jsx'));

// Schedule pages
const TimetablePage = lazy(() => import('../pages/schedule/TimetablePage.jsx'));

// Communication & Parent Portal pages
const ParentCommunicationPage = lazy(() => import('../pages/communication/ParentCommunicationPage.jsx'));
const ParentPortalPage = lazy(() => import('../pages/communication/ParentPortalPage.jsx'));

// BGH pages
const BGHDashboardPage = lazy(() => import('../pages/bgh/BGHDashboardPage.jsx'));
const BGHAttendanceMonitorPage = lazy(() => import('../pages/bgh/BGHAttendanceMonitorPage.jsx'));
const ScheduleAdminPage = lazy(() => import('../pages/bgh/ScheduleAdminPage.jsx'));
const BGHReportCenterPage = lazy(() => import('../pages/bgh/BGHReportCenterPage.jsx'));
const BGHTuitionPage = lazy(() => import('../pages/bgh/BGHTuitionPage.jsx'));
const SystemSettingsPage = lazy(() => import('../pages/bgh/SystemSettingsPage.jsx'));
const AuditLogsPage = lazy(() => import('../pages/bgh/AuditLogsPage.jsx'));

// Student portal pages
const StudentGradebookPage = lazy(() => import('../pages/student/StudentGradebookPage.jsx'));
const StudentAttendancePage = lazy(() => import('../pages/student/StudentAttendancePage.jsx'));
const StudentSchedulePage = lazy(() => import('../pages/student/StudentSchedulePage.jsx'));
const StudentExamsPage = lazy(() => import('../pages/student/StudentExamsPage.jsx'));

// Notifications
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage.jsx'));

/**
 * Hiệu ứng chuyển trang mượt mà (Suspense Fallback) khi nạp phân hệ học vụ theo yêu cầu.
 */
function PageLoadingFallback() {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-9 h-9 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
        Đang nạp phân hệ học vụ...
      </span>
    </div>
  );
}

export default function AppRouter() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Suspense fallback={<PageLoadingFallback />}>
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
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

        {/* Protected routes inside MainLayout */}
        <Route element={<MainLayout />}>
          {/* GV & GVCN Dashboard */}
          <Route element={<ProtectedRoute roles={[ROLES.GV]} />}>
            <Route path={ROUTES.GV_DASHBOARD} element={<GVDashboardPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={[ROLES.GVCN]} />}>
            <Route path={ROUTES.GVCN_DASHBOARD} element={<GVCNDashboardPage />} />
          </Route>

          {/* GV / GVCN Shared */}
          <Route element={<ProtectedRoute roles={[ROLES.GV, ROLES.GVCN]} />}>
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

          {/* PH Portal Dedicated */}
          <Route element={<ProtectedRoute roles={[ROLES.PH]} />}>
            <Route path={ROUTES.PARENT_DASHBOARD} element={<ParentPortalPage />} />
          </Route>

          {/* BGH only */}
          <Route element={<ProtectedRoute roles={[ROLES.BGH]} />}>
            <Route path={ROUTES.BGH_DASHBOARD} element={<BGHDashboardPage />} />
            <Route path={ROUTES.BGH_ATTENDANCE} element={<BGHAttendanceMonitorPage />} />
            <Route path={ROUTES.BGH_SCHEDULE_ADMIN} element={<ScheduleAdminPage />} />
            <Route path={ROUTES.BGH_REPORTS} element={<BGHReportCenterPage />} />
            <Route path={ROUTES.BGH_TUITION} element={<BGHTuitionPage />} />
            <Route path={ROUTES.BGH_SETTINGS} element={<SystemSettingsPage />} />
            <Route path={ROUTES.BGH_AUDIT_LOGS} element={<AuditLogsPage />} />
          </Route>

          {/* HS / PH routes */}
          <Route element={<ProtectedRoute roles={[ROLES.HS, ROLES.PH]} />}>
            <Route path={ROUTES.STUDENT_GRADEBOOK} element={<StudentGradebookPage />} />
            <Route path={ROUTES.STUDENT_ATTENDANCE} element={<StudentAttendancePage />} />
            <Route path={ROUTES.STUDENT_SCHEDULE} element={<StudentSchedulePage />} />
            <Route path={ROUTES.STUDENT_EXAMS} element={<StudentExamsPage />} />
          </Route>

          {/* Notifications — BGH, GVCN & HS */}
          <Route element={<ProtectedRoute roles={[ROLES.BGH, ROLES.GVCN, ROLES.GV, ROLES.HS, ROLES.PH]} />}>
            <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
