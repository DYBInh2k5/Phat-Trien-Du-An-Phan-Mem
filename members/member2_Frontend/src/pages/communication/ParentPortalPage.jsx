import { useState, useEffect } from 'react';
import { fetchGradeBook, fetchTuitions } from '../../api/stubs.js';
import { apiClient } from '../../api/client.js';
import { exportTuitionReceiptPDF } from '../../utils/exportEngine.js';

const DEFAULT_TUITION = [
  { id: 'T1', name: 'Học phí chính khóa (HK1)', amount: 1500000, status: 'paid' },
  { id: 'T2', name: 'Tiền quản lý bán trú & Ăn trưa', amount: 800000, status: 'unpaid' },
  { id: 'T3', name: 'Bảo hiểm Y tế bắt buộc', amount: 560000, status: 'paid' },
  { id: 'T4', name: 'Quỹ khuyến học & Cơ sở vật chất', amount: 300000, status: 'unpaid' },
];

function getStudentCode() {
  try {
    const raw = localStorage.getItem('user') || localStorage.getItem('htqllh_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      const u = parsed?.user ?? parsed;
      return u?.studentCode ?? u?.username ?? 'HS001';
    }
  } catch { /* ignore */ }
  return 'HS001';
}

export default function ParentPortalPage() {
  // Student info
  const studentCode = getStudentCode();
  const userRaw = (() => {
    try {
      const raw = localStorage.getItem('user') || localStorage.getItem('htqllh_auth');
      const p = JSON.parse(raw);
      return p?.user ?? p;
    } catch { return null; }
  })();
  const studentName  = userRaw?.fullName ?? userRaw?.name ?? 'Nguyễn Thị Ánh';
  const studentClass = userRaw?.className ?? '10A1';

  // States
  const [activeTab, setActiveTab] = useState('contact');
  const [studentGrades, setStudentGrades] = useState([]);
  const [gradesLoading, setGradesLoading] = useState(true);

  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  const [tuitionItems, setTuitionItems] = useState([]);
  const [tuitionLoading, setTuitionLoading] = useState(true);

  // UC-PAR-04: Fetch grades
  useEffect(() => {
    setGradesLoading(true);
    fetchGradeBook()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Normalize snake_case (DB) → camelCase (UI)
          const normalize = (row) => ({
            subjectName:    row.subjectName    ?? row.subject_name    ?? '',
            scoreOral:      row.scoreOral      ?? row.score_oral      ?? null,
            score15m:       row.score15m       ?? row.score_15m       ?? null,
            scoreMidTerm:   row.scoreMidTerm   ?? row.score_mid_term  ?? null,
            scoreFinalTerm: row.scoreFinalTerm ?? row.score_final_term?? null,
            averageScore:   row.averageScore   ?? row.average_score   ?? null,
            gradeLetter:    row.gradeLetter    ?? row.grade_letter    ?? '',
            semester:       row.semester       ?? 'HK1',
          });
          const normalized = data.map(normalize);

          // Lọc chỉ HK1 và de-duplicate theo subjectName
          // (giữ bản ghi mới nhất nếu có trùng)
          const hk1 = normalized.filter(row => {
            const sem = row.semester ?? '';
            return sem === 'HK1' || sem === 1 || sem === '1';
          });
          const target = hk1.length > 0 ? hk1 : normalized;

          // De-duplicate: mỗi môn chỉ giữ 1 dòng
          const seen = new Set();
          const unique = target.filter(row => {
            if (seen.has(row.subjectName)) return false;
            seen.add(row.subjectName);
            return true;
          });

          setStudentGrades(unique);
        } else {
          setStudentGrades([]);
        }
      })
      .catch(() => setStudentGrades([]))
      .finally(() => setGradesLoading(false));
  }, []);

  // UC-PAR-07: Fetch tuitions
  useEffect(() => {
    setTuitionLoading(true);
    fetchTuitions()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item, idx) => ({
            id: item.id ?? item.tuition_id ?? String(idx + 1),
            name: item.item_name ?? item.description ?? item.name ?? `Khoản thu ${idx + 1}`,
            amount: parseFloat(item.amount_due ?? item.amount ?? 0),
            status: (item.payment_status ?? item.status ?? 'unpaid').toLowerCase(),
          }));
          setTuitionItems(mapped);
        } else {
          // API trả rỗng = chưa có học phí trong DB, hiện trống (không dùng mockdata)
          setTuitionItems([]);
        }
      })
      .catch(() => setTuitionItems([]))
      .finally(() => setTuitionLoading(false));
  }, []);

  const totalAmount = tuitionItems.reduce((sum, item) => sum + item.amount, 0);
  const paidAmount  = tuitionItems.filter(i => i.status === 'paid').reduce((sum, item) => sum + item.amount, 0);

  // UC-PAR-08: Pay tuition
  const handlePayTuition = async (id) => {
    try {
      await apiClient('/tuition/pay', { method: 'POST', body: { tuitionId: id, studentCode } });
      setTuitionItems(prev => prev.map(item => item.id === id ? { ...item, status: 'paid' } : item));
      alert('Thanh toán thành công!');
    } catch {
      alert('Thanh toán thất bại. Vui lòng thử lại.');
    }
  };

  // UC-PAR-06: Leave request
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;
    try {
      await apiClient('/leave-requests', {
        method: 'POST',
        body: { fromDate: leaveDate, toDate: leaveDate, reason: leaveReason, studentCode },
      });
      setLeaveSubmitted(true);
      setTimeout(() => {
        setLeaveSubmitted(false);
        setLeaveReason('');
        alert('Đã nộp đơn xin nghỉ học tới Giáo viên Chủ nhiệm thành công!');
      }, 500);
    } catch {
      alert('Nộp đơn thất bại. Vui lòng thử lại.');
    }
  };

  const handleExportTuitionReceipt = () => {
    const studentInfo = {
      studentCode,
      studentName,
      className: studentClass,
    };
    const paidItems = tuitionItems.filter(i => i.status === 'paid');
    exportTuitionReceiptPDF(studentInfo, paidItems);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#cbd5e1] p-6 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-label-sm font-semibold bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] mb-1">
            Mã vai trò: ROLE_PARENT (Phụ Huynh Học Sinh)
          </span>
          <h1 className="text-headline-md font-bold text-[#0f172a]">
            Cổng Sổ Liên Lạc Điện Tử &amp; Quản Lý Học Phí
          </h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            Học sinh: <strong className="text-[#0f172a]">{studentName}</strong> ({studentCode}) · Lớp {studentClass} · GVCN: Lê Minh Châu
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportTuitionReceipt}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white text-body-sm font-semibold shadow-xs transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          In Biên Lai Học Phí (PDF)
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#cbd5e1] bg-white rounded-t-xl px-4 pt-2 gap-2">
        <button type="button" onClick={() => setActiveTab('contact')}
          className={`px-4 py-3 text-body-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'contact' ? 'border-[#004ac6] text-[#004ac6]' : 'border-transparent text-[#64748b] hover:text-[#0f172a]'}`}>
          <span className="material-symbols-outlined text-[18px]">contact_mail</span>
          Sổ Liên Lạc &amp; Điểm Số
        </button>
        <button type="button" onClick={() => setActiveTab('leave')}
          className={`px-4 py-3 text-body-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'leave' ? 'border-[#004ac6] text-[#004ac6]' : 'border-transparent text-[#64748b] hover:text-[#0f172a]'}`}>
          <span className="material-symbols-outlined text-[18px]">edit_document</span>
          Nộp Đơn Xin Nghỉ Học
        </button>
        <button type="button" onClick={() => setActiveTab('tuition')}
          className={`px-4 py-3 text-body-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'tuition' ? 'border-[#004ac6] text-[#004ac6]' : 'border-transparent text-[#64748b] hover:text-[#0f172a]'}`}>
          <span className="material-symbols-outlined text-[18px]">payments</span>
          Tra Cứu &amp; Đóng Học Phí
        </button>
      </div>

      {/* Tab 1: Sổ Liên Lạc & Điểm số */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#cbd5e1] shadow-xs p-5 space-y-4">
            <h2 className="text-body-md font-bold text-[#0f172a] pb-2 border-b border-[#f1f5f9] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#004ac6]">grade</span>
              Bảng Điểm Môn Học Học Kỳ I
            </h2>
            {gradesLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-[#f1f5f9] rounded animate-pulse" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-body-sm border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                      <th className="p-2.5 font-semibold text-[#475569]">Môn Học</th>
                      <th className="p-2.5 font-semibold text-[#475569] text-center">Miệng</th>
                      <th className="p-2.5 font-semibold text-[#475569] text-center">15p</th>
                      <th className="p-2.5 font-semibold text-[#475569] text-center">GK</th>
                      <th className="p-2.5 font-semibold text-[#475569] text-center">CK</th>
                      <th className="p-2.5 font-semibold text-[#004ac6] text-center">TBM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentGrades.length === 0 ? (
                      <tr><td colSpan={6} className="p-4 text-center text-[#94a3b8]">Chưa có dữ liệu điểm.</td></tr>
                    ) : studentGrades.map((g, idx) => (
                      <tr key={g.subjectName ?? idx} className="border-b border-[#f1f5f9]">
                        <td className="p-2.5 font-medium text-[#0f172a]">{g.subjectName}</td>
                        <td className="p-2.5 text-center">{g.scoreOral ?? '—'}</td>
                        <td className="p-2.5 text-center">{g.score15m ?? '—'}</td>
                        <td className="p-2.5 text-center">{g.scoreMidTerm ?? '—'}</td>
                        <td className="p-2.5 text-center">{g.scoreFinalTerm ?? '—'}</td>
                        <td className="p-2.5 text-center font-bold text-[#004ac6]">
                          {g.averageScore != null ? parseFloat(g.averageScore).toFixed(1) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 bg-white rounded-xl border border-[#cbd5e1] shadow-xs p-5 space-y-4">
            <h2 className="text-body-md font-bold text-[#0f172a] pb-2 border-b border-[#f1f5f9] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#15803d]">campaign</span>
              Thông Báo Từ GVCN &amp; Nhà Trường
            </h2>
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg border border-[#bfdbfe] bg-[#eff4ff]">
                <span className="text-label-sm font-bold text-[#004ac6]">HỌC VỤ — 26/09/2026</span>
                <p className="text-body-sm font-semibold text-[#0f172a] mt-1">Đã có lịch thi giữa kỳ I chính thức</p>
                <p className="text-label-sm text-[#475569] mt-0.5">Phụ huynh nhắc nhở con em ôn tập theo lịch thi công bố.</p>
              </div>
              <div className="p-3.5 rounded-lg border border-[#fca5a5] bg-[#fef2f2]">
                <span className="text-label-sm font-bold text-[#b91c1c]">ĐIỂM DANH — 25/09/2026</span>
                <p className="text-body-sm font-semibold text-[#0f172a] mt-1">Cảnh báo vắng học tiết 3 môn Hóa</p>
                <p className="text-label-sm text-[#475569] mt-0.5">Học sinh có mặt trễ 10 phút đầu giờ.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Nộp Đơn Xin Nghỉ Học */}
      {activeTab === 'leave' && (
        <div className="max-w-2xl bg-white rounded-xl border border-[#cbd5e1] shadow-xs p-6 space-y-4">
          <h2 className="text-body-md font-bold text-[#0f172a] pb-2 border-b border-[#f1f5f9] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#004ac6]">edit_note</span>
            Nộp Đơn Xin Nghỉ Học Trực Tuyến Gửi GVCN
          </h2>
          <form onSubmit={handleLeaveSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-label-sm font-semibold text-[#334155]">Ngày xin nghỉ học (*)</label>
              <input
                type="date"
                required
                value={leaveDate}
                onChange={(e) => setLeaveDate(e.target.value)}
                className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-body-sm text-[#0f172a] focus:border-[#004ac6] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-label-sm font-semibold text-[#334155]">Lý do xin nghỉ học (*)</label>
              <textarea
                required
                rows={4}
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="Nhập lý do nghỉ học chi tiết (Ví dụ: Cháu bị sốt và khám tại y tế gia đình)..."
                className="w-full border border-[#cbd5e1] rounded-lg p-3 text-body-sm text-[#0f172a] focus:border-[#004ac6] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={leaveSubmitted}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white font-semibold text-body-sm shadow-xs transition-all disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Gửi Đơn Cho Giáo Viên Chủ Nhiệm
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Học Phí */}
      {activeTab === 'tuition' && (
        <div className="bg-white rounded-xl border border-[#cbd5e1] shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#f1f5f9]">
            <div>
              <h2 className="text-body-md font-bold text-[#0f172a]">Thông Báo &amp; Tra Cứu Học Phí Học Kỳ I</h2>
              <p className="text-label-sm text-[#64748b] mt-0.5">
                Tổng thu: {totalAmount.toLocaleString('vi-VN')} đ · Đã thanh toán: {paidAmount.toLocaleString('vi-VN')} đ
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-label-sm font-bold border ${paidAmount === totalAmount ? 'bg-[#f0fdf4] text-[#15803d] border-[#86efac]' : 'bg-[#fff7ed] text-[#c2410c] border-[#fdba74]'}`}>
              {paidAmount === totalAmount ? 'Đã hoàn thành học phí' : 'Còn khoản chưa đóng'}
            </span>
          </div>

          {tuitionLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-[#f1f5f9] rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <th className="p-3 font-semibold text-[#475569]">STT</th>
                    <th className="p-3 font-semibold text-[#475569]">Khoản Thu</th>
                    <th className="p-3 font-semibold text-[#475569]">Số Tiền (VNĐ)</th>
                    <th className="p-3 font-semibold text-[#475569] text-center">Trạng Thái</th>
                    <th className="p-3 font-semibold text-[#475569] text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tuitionItems.map((item, idx) => (
                    <tr key={item.id} className="border-b border-[#f1f5f9]">
                      <td className="p-3 text-[#64748b]">{idx + 1}</td>
                      <td className="p-3 font-semibold text-[#0f172a]">{item.name}</td>
                      <td className="p-3 font-mono font-bold text-[#004ac6]">{item.amount.toLocaleString('vi-VN')} đ</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-label-sm font-medium border ${item.status === 'paid' ? 'bg-[#f0fdf4] text-[#15803d] border-[#86efac]' : 'bg-[#fef2f2] text-[#b91c1c] border-[#fca5a5]'}`}>
                          {item.status === 'paid' ? 'Đã đóng' : 'Chưa đóng'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {item.status === 'unpaid' ? (
                          <button
                            type="button"
                            onClick={() => handlePayTuition(item.id)}
                            className="px-3 py-1.5 rounded bg-[#15803d] hover:bg-[#166534] text-white text-label-sm font-semibold shadow-xs"
                          >
                            Thanh Toán QR
                          </button>
                        ) : (
                          <span className="text-label-sm text-[#94a3b8]">Đã xác nhận</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
