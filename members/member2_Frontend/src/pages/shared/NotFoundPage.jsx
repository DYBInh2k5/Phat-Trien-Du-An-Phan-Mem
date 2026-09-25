import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-10 max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-[#eff4ff] flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-[40px] text-[#2563eb]" aria-hidden="true">
            search_off
          </span>
        </div>

        {/* Title */}
        <h1 className="text-headline-lg font-semibold text-[#0f172a] mb-3">
          404 — Trang không tồn tại
        </h1>

        {/* Description */}
        <p className="text-body-md text-[#64748b] mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển đến địa chỉ khác.
        </p>

        {/* CTA */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-label-md font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">home</span>
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
}
