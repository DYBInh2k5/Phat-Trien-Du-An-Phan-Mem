import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../constants/routes.js';

/**
 * Route bảo vệ bằng xác thực JWT + phân quyền theo role.
 * - Nếu đang khôi phục phiên (kiểm tra token với /api/auth/me): hiển thị loading
 * - Nếu chưa xác thực: redirect về /login
 * - Nếu không đủ quyền: redirect về /unauthorized
 */
export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, role, isRestoringSession } = useAuth();

  // Đang kiểm tra xem token còn hiệu lực không → hiển thị loading thay vì redirect sớm
  if (isRestoringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm font-medium">Đang khôi phục phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children ?? <Outlet />;
}
