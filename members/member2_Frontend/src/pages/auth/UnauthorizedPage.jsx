import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_DASHBOARD } from '../../constants/routes.js';

export default function UnauthorizedPage() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    const target = ROLE_DASHBOARD[role] ?? '/login';
    navigate(target, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-[#fef2f2] flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px] text-[#dc2626]">lock</span>
        </div>
        <h1 className="text-headline-md font-semibold text-[#0f172a] mb-2">Không có quyền truy cập</h1>
        <p className="text-body-md text-[#64748b] mb-6">
          Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu cần hỗ trợ.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-label-md font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Quay lại trang chính
        </button>
      </div>
    </div>
  );
}
