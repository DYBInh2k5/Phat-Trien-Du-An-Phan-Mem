/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ LỚP HỌC (HTQLLH) - THPT HSU
 * ==============================================================================
 * Tệp: members/member2_Frontend/src/components/VietQrPaymentModal.jsx
 * Vai trò: Hộp thoại Thanh toán Học phí VietQR Động & Đối soát Trực tuyến (SD-04)
 * Kiến trúc: Clean Architecture - UI Component Layer
 * Tác giả: Nhóm Đồ Án PTDA Phần Mềm
 * Ngày tạo: 14/11/2026
 * Mô tả:
 *   - Hiển thị mã QR VietQR động chuẩn EMVCo có sẵn số tiền nợ học phí và nội dung giao dịch duy nhất.
 *   - Đồng hồ đếm ngược 15 phút (TTL hết hạn) theo thời gian thực trả về từ máy chủ.
 *   - Cơ chế tự động Polling trạng thái giao dịch mỗi 3 giây.
 *   - Nút "Tôi đã nộp tiền" chuyển trạng thái sang PENDING chờ đối soát.
 *   - Nút "Mô phỏng tiền về (Dev Test)" phục vụ kiểm thử end-to-end trên môi trường thử nghiệm.
 *   - Tải trực tiếp ảnh QR chuẩn hoặc sao chép nhanh số tài khoản ngân hàng.
 * ==============================================================================
 */

import { useState, useEffect, useRef } from 'react';
import { claimTuitionPayment, fetchPaymentStatus, simulatePaymentSuccess } from '../api/stubs.js';

export default function VietQrPaymentModal({ isOpen, onClose, checkoutData, onSuccess }) {
  if (!isOpen || !checkoutData) return null;

  const {
    orderCode,
    amount,
    expiresAt,
    qrImageUrl,
    qrDataUrl,
    bankInfo = {}
  } = checkoutData;

  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isClaimed, setIsClaimed] = useState(checkoutData.status === 'PENDING');
  const [isPaid, setIsPaid] = useState(checkoutData.status === 'PAID');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [receiptNo, setReceiptNo] = useState(null);
  const pollTimerRef = useRef(null);

  // 1. Đồng hồ đếm ngược thời gian thực (Countdown Timer)
  useEffect(() => {
    if (!expiresAt) return;
    const calculateSeconds = () => {
      const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
      return diff > 0 ? diff : 0;
    };

    setTimeLeft(calculateSeconds());
    const interval = setInterval(() => {
      const remaining = calculateSeconds();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // 2. Cơ chế Polling tự động kiểm tra giao dịch đã thanh toán hay chưa (mỗi 3 giây)
  useEffect(() => {
    if (isPaid || timeLeft <= 0) return;

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetchPaymentStatus(orderCode);
        if (res.status === 'PAID') {
          setIsPaid(true);
          setReceiptNo(res.receiptNo);
          clearInterval(pollTimerRef.current);
          if (onSuccess) onSuccess(res);
        } else if (res.status === 'PENDING') {
          setIsClaimed(true);
        }
      } catch (err) {
        console.warn('[POLLING ERROR]', err.message);
      }
    }, 3000);

    return () => clearInterval(pollTimerRef.current);
  }, [orderCode, isPaid, timeLeft, onSuccess]);

  // 3. Phụ huynh bấm "Tôi đã nộp tiền"
  const handleClaim = async () => {
    setLoading(true);
    try {
      const res = await claimTuitionPayment(orderCode, 'Phụ huynh đã xác nhận qua ứng dụng ngân hàng');
      setIsClaimed(true);
      alert(res.message || 'Đã gửi thông tin đối soát tới Nhà trường.');
    } catch (err) {
      alert(err.message || 'Gửi xác nhận thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Giả lập thanh toán Webhook thành công (Dev Test)
  const handleSimulatePayment = async () => {
    setSimulating(true);
    try {
      const res = await simulatePaymentSuccess(orderCode);
      setIsPaid(true);
      setReceiptNo(res.data?.receiptNo);
      alert('Mô phỏng thành công! Ngân hàng đã ghi nhận tiền về tài khoản trường.');
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      alert(err.message || 'Mô phỏng thất bại.');
    } finally {
      setSimulating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatMinutes = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Nút đóng nổi bật ở góc trên bên phải (Nút X đỏ tròn) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng cửa sổ"
          title="Đóng (Esc)"
          className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 pr-14 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">Chuẩn VietQR NAPAS</span>
            <h3 className="text-lg font-bold">Thanh Toán Học Phí Trực Tuyến</h3>
          </div>
        </div>

        {/* Nội dung thanh toán */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Trạng thái thành công */}
          {isPaid ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <h4 className="text-xl font-bold text-slate-800">Thanh Toán Hoàn Tất!</h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Giao dịch của bạn đã được đối soát thành công. Hệ thống đã phát hành biên lai điện tử.
              </p>
              {receiptNo && (
                <div className="inline-block bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 text-sm font-mono font-bold text-blue-800">
                  Số biên lai: {receiptNo}
                </div>
              )}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all"
                >
                  Đóng và Cập Nhật Danh Sách
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Cảnh báo thời gian hiệu lực */}
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-amber-600">timer</span>
                  <span className="font-medium">Mã QR hết hạn sau:</span>
                </div>
                <span className={`font-mono font-bold text-base ${timeLeft < 180 ? 'text-red-600 animate-pulse' : 'text-amber-900'}`}>
                  {formatMinutes(timeLeft)}
                </span>
              </div>

              {/* Khung hiển thị QR */}
              <div className="flex flex-col items-center bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="relative bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <img
                    src={qrDataUrl || qrImageUrl}
                    alt="VietQR Học Phí"
                    className="w-56 h-56 object-contain"
                  />
                  {timeLeft <= 0 && (
                    <div className="absolute inset-0 bg-slate-900/80 rounded-xl flex flex-col items-center justify-center text-white p-4 text-center">
                      <span className="material-symbols-outlined text-3xl mb-1 text-red-400">error</span>
                      <p className="text-sm font-bold">Mã QR đã hết hạn</p>
                      <p className="text-xs text-slate-300 mt-1">Vui lòng đóng modal và bấm thanh toán lại.</p>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xs text-slate-500">Mở app Smart Banking hoặc MoMo / VNPay để quét mã</p>
                  <a
                    href={qrDataUrl || qrImageUrl}
                    download={`VietQR_HocPhi_${orderCode}.png`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 mt-1"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    Tải ảnh mã QR về máy
                  </a>
                </div>
              </div>

              {/* Chi tiết tài khoản ngân hàng đối soát */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                  <span className="font-semibold text-slate-800">{bankInfo.bankName || 'MBBank'} (BIN: {bankInfo.bin || '970422'})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{bankInfo.accountNo || '0388888888'}</span>
                    <button
                      onClick={() => copyToClipboard(bankInfo.accountNo || '0388888888')}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      {copied ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <span className="font-semibold text-slate-800">{bankInfo.accountName || 'TRUONG THPT CHUYEN HTQLLH'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số tiền nợ cần đóng:</span>
                  <span className="font-mono font-bold text-blue-700 text-base">{Number(amount).toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                  <span className="text-slate-500">Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{orderCode}</span>
                    <button
                      onClick={() => copyToClipboard(orderCode)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Sao chép
                    </button>
                  </div>
                </div>
              </div>

              {/* Trạng thái xác nhận */}
              {isClaimed && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3 text-blue-900 text-xs">
                  <span className="material-symbols-outlined text-xl text-blue-600 mt-0.5">hourglass_top</span>
                  <div>
                    <span className="font-bold">Đã tiếp nhận yêu cầu xác nhận nộp tiền.</span>
                    <p className="text-blue-700 mt-0.5">
                      Hệ thống đang kiểm tra tiền về qua đối soát tự động hoặc chờ Kế toán đối chiếu sao kê.
                    </p>
                  </div>
                </div>
              )}

              {/* Nút hành động */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={loading || isClaimed || timeLeft <= 0}
                  onClick={handleClaim}
                  className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">check</span>
                  {isClaimed ? 'Đã gửi yêu cầu đối soát' : 'Tôi đã chuyển khoản thành công'}
                </button>

                {/* Nút đóng / quay lại
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                  Đóng cửa sổ thanh toán
                </button> */}

                {/* Nút giả lập Dev Test */}
                <button
                  type="button"
                  disabled={simulating || isPaid}
                  onClick={handleSimulatePayment}
                  className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-medium text-xs border border-dashed border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-indigo-600">developer_mode</span>
                  {simulating ? 'Đang mô phỏng giao dịch...' : 'Mô phỏng tiền về tài khoản ngân hàng (Dev Test)'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

