/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/components/shared/ErrorBoundary.jsx
 * Vai trò: Rào Chắn Lỗi Toàn Ứng Dụng (Global Error Boundary)
 * Kiến trúc: React Class Component — Error Boundaries yêu cầu class component
 * Mô tả:
 *   - Bắt toàn bộ lỗi runtime JavaScript từ component con trong cây render.
 *   - Hiển thị UI thân thiện thay vì màn hình trắng khi có lỗi.
 *   - Nút "Tải lại trang" gọi window.location.reload() để khởi động lại hoàn toàn.
 *   - Nút "Về trang chủ" điều hướng về '/'.
 *   - In chi tiết lỗi ra console để hỗ trợ debug.
 *   - Hiển thị chi tiết lỗi trong môi trường development (import.meta.env.DEV).
 * ==============================================================================
 */

import { Component } from 'react';

/**
 * ErrorBoundary — Rào chắn lỗi React chuẩn.
 * Bọc ngoài `<AppRouter />` trong App.jsx để bắt mọi lỗi runtime.
 *
 * @example
 * <ErrorBoundary>
 *   <AppRouter />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError:  false,
      error:     null,
      errorInfo: null,
    };
  }

  /**
   * Cập nhật state khi có lỗi xảy ra trong component con.
   * Được gọi trước render() — dùng để hiển thị UI fallback.
   * @param {Error} error
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Ghi thông tin lỗi ra console để hỗ trợ debug.
   * Được gọi sau render() — dùng để log hoặc gửi report lên service.
   * @param {Error} error
   * @param {{ componentStack: string }} errorInfo
   */
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Lỗi runtime bị bắt:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  /** Reset state để thử render lại component con */
  handleReset() {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (!this.state.hasError) {
      // Không có lỗi → render component con bình thường
      return this.props.children;
    }

    const isDev = import.meta.env.DEV;
    const errorMessage = this.state.error?.message || 'Lỗi không xác định';
    const componentStack = this.state.errorInfo?.componentStack;

    return (
      <div
        className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6"
        role="alert"
        aria-live="assertive"
      >
        <div className="max-w-lg w-full bg-white rounded-2xl border border-[#e2e8f0] shadow-xl overflow-hidden">

          {/* Header đỏ */}
          <div className="bg-gradient-to-r from-[#dc2626] to-[#b91c1c] px-6 py-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-white" aria-hidden="true">
                error
              </span>
            </div>
            <div>
              <h1 className="text-white font-bold text-[16px]">Đã xảy ra lỗi hệ thống</h1>
              <p className="text-white/80 text-[12px] mt-0.5">
                HTQLLH — THPT Hoa Sen University
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-[14px] text-[#334155] leading-relaxed">
              Một thành phần giao diện đã gặp lỗi không mong muốn và không thể hiển thị.
              Vui lòng thử tải lại trang hoặc quay về trang chủ.
            </p>

            {/* Chi tiết lỗi — chỉ hiện trong môi trường development */}
            {isDev && (
              <div className="rounded-lg bg-[#fef2f2] border border-[#fecaca] overflow-hidden">
                <div className="px-4 py-2 bg-[#fecaca]/50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-[#b91c1c]" aria-hidden="true">bug_report</span>
                  <span className="text-[11px] font-bold text-[#b91c1c] uppercase tracking-wide">
                    Chi tiết lỗi (Dev Mode)
                  </span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[12px] font-semibold text-[#b91c1c] break-words">{errorMessage}</p>
                  {componentStack && (
                    <details className="mt-2">
                      <summary className="text-[11px] text-[#94a3b8] cursor-pointer hover:text-[#64748b]">
                        Component stack
                      </summary>
                      <pre className="mt-1 text-[10px] text-[#64748b] overflow-auto max-h-40 whitespace-pre-wrap break-all font-mono bg-[#f8fafc] rounded p-2 border border-[#e2e8f0]">
                        {componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer: nút hành động */}
          <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#f1f5f9] flex items-center gap-3 flex-wrap">
            {/* Tải lại trang — reset hoàn toàn */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]" aria-hidden="true">refresh</span>
              Tải lại trang
            </button>

            {/* Về trang chủ */}
            <button
              type="button"
              onClick={() => { this.handleReset(); window.location.href = '/'; }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium text-[#475569] bg-white border border-[#e2e8f0] hover:bg-[#f1f5f9] transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]" aria-hidden="true">home</span>
              Về trang chủ
            </button>

            {/* Thử lại render (không reload) */}
            <button
              type="button"
              onClick={() => this.handleReset()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium text-[#64748b] hover:text-[#0f172a] transition-colors ml-auto"
            >
              <span className="material-symbols-outlined text-[17px]" aria-hidden="true">undo</span>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }
}
