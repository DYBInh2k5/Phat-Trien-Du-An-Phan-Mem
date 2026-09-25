import { useState, useMemo } from 'react';

const MOCK_RECORDS = [
  { date: '2024-11-13', status: 'present', period: 'Buổi sáng', note: '' },
  { date: '2024-11-14', status: 'absent',  period: 'Buổi sáng', note: 'Vắng không phép' },
  { date: '2024-11-12', status: 'present', period: 'Buổi sáng', note: '' },
  { date: '2024-11-11', status: 'late',    period: 'Buổi sáng', note: 'Đến trễ 10 phút' },
  { date: '2024-11-08', status: 'present', period: 'Buổi sáng', note: '' },
  { date: '2024-11-07', status: 'present', period: 'Buổi sáng', note: '' },
];

const STATUS_MAP = {
  present: { label: 'Có mặt',  cls: 'bg-[#f0fdf4] text-[#15803d] border-[#86efac]',  icon: 'check_circle' },
  late:    { label: 'Đi trễ',  cls: 'bg-[#fff7ed] text-[#c2410c] border-[#fdba74]',  icon: 'schedule' },
  absent:  { label: 'Vắng mặt', cls: 'bg-[#fef2f2] text-[#b91c1c] border-[#fca5a5]', icon: 'cancel' },
};

export default function StudentAttendancePage() {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ fromDate: '', toDate: '', reason: 'Lý do sức khỏe / Ốm đau', detail: '' });
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  const stats = useMemo(() => {
    const total   = MOCK_RECORDS.length;
    const present = MOCK_RECORDS.filter(r => r.status === 'present').length;
    const absent  = MOCK_RECORDS.filter(r => r.status === 'absent').length;
    const late    = MOCK_RECORDS.filter(r => r.status === 'late').length;
    return { total, present, absent, late, rate: total > 0 ? ((present + late) / total * 100).toFixed(1) : 100 };
  }, []);

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    setLeaveSubmitted(true);
    setTimeout(() => { setLeaveSubmitted(false); setIsLeaveModalOpen(false); }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0f172a]">Chuyên cần & Nề nếp</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">Nhật ký điểm danh và lịch sử xin phép nghỉ học</p>
        </div>
        <button type="button" onClick={() => setIsLeaveModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004ac6] text-white text-label-md font-semibold hover:bg-[#003ea8] shadow-elevation-1 transition-all">
          <span className="material-symbols-outlined text-[18px]">add_task</span>
          Nộp đơn nghỉ học trực tuyến
        </button>
      </div>

      {/* Stats KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tỷ lệ chuyên cần', value: stats.rate + '%', icon: 'percent', cls: 'text-[#15803d]' },
          { label: 'Buổi có mặt', value: stats.present, icon: 'check_circle', cls: 'text-[#15803d]' },
          { label: 'Buổi vắng', value: stats.absent, icon: 'cancel', cls: stats.absent > 0 ? 'text-[#dc2626]' : 'text-[#15803d]' },
          { label: 'Buổi đi trễ', value: stats.late, icon: 'schedule', cls: stats.late > 0 ? 'text-[#c2410c]' : 'text-[#15803d]' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm text-[#64748b]">{k.label}</span>
              <span className={`material-symbols-outlined text-[20px] ${k.cls}`}>{k.icon}</span>
            </div>
            <div className={`text-data-metric font-bold ${k.cls}`} style={{ fontVariantNumeric: 'tabular-nums' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Attendance log */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#004ac6]">fact_check</span>
          <h2 className="text-headline-sm font-semibold text-[#0f172a]">Nhật ký điểm danh</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-data-table" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]" style={{ height: '40px' }}>
                <th className="px-4 py-2.5 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider">Ngày</th>
                <th className="px-4 py-2.5 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider">Buổi học</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-2.5 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RECORDS.map((r, i) => {
                const st = STATUS_MAP[r.status];
                const d = new Date(r.date);
                return (
                  <tr key={i} className={`border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors ${r.status === 'absent' ? 'bg-[#fef2f2]/30' : ''}`} style={{ height: '48px' }}>
                    <td className="px-4 py-2 text-[#0f172a] font-medium whitespace-nowrap">
                      {d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-2 text-[#475569] whitespace-nowrap">{r.period}</td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-label-sm font-medium ${st.cls}`}>
                        <span className="material-symbols-outlined text-[13px]">{st.icon}</span>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[#64748b] text-body-sm">{r.note || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setIsLeaveModalOpen(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-lg shadow-elevation-3 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#eff4ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-[#004ac6]">note_add</span>
                </div>
                <div>
                  <h3 className="text-headline-sm font-semibold text-[#0f172a]">Đơn xin phép nghỉ học</h3>
                  <p className="text-label-sm text-[#64748b]">Hệ thống xét duyệt tự động</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleLeaveSubmit} className="px-6 py-4 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-sm font-medium text-[#475569]">Từ ngày *</label>
                  <input type="date" required value={leaveForm.fromDate} onChange={e => setLeaveForm(p => ({ ...p, fromDate: e.target.value }))}
                    className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-sm text-[#0f172a] focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-sm font-medium text-[#475569]">Đến ngày *</label>
                  <input type="date" required value={leaveForm.toDate} onChange={e => setLeaveForm(p => ({ ...p, toDate: e.target.value }))}
                    className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-sm text-[#0f172a] focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-medium text-[#475569]">Lý do *</label>
                <select value={leaveForm.reason} onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))}
                  className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-sm text-[#0f172a] focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15">
                  <option>Lý do sức khỏe / Ốm đau</option>
                  <option>Việc gia đình đột xuất</option>
                  <option>Tham gia thi Olympic / Năng khiếu</option>
                  <option>Khác</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-medium text-[#475569]">Giải trình chi tiết</label>
                <textarea rows={3} value={leaveForm.detail} onChange={e => setLeaveForm(p => ({ ...p, detail: e.target.value }))}
                  placeholder="Mô tả chi tiết lý do nghỉ..." className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-sm text-[#0f172a] resize-none focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15" />
              </div>
              {leaveSubmitted && (
                <div className="flex items-center gap-2 p-3 bg-[#f0fdf4] border border-[#86efac] rounded-lg">
                  <span className="material-symbols-outlined text-[18px] text-[#15803d]">check_circle</span>
                  <span className="text-body-sm text-[#15803d] font-medium">Đơn đã gửi thành công đến GVCN!</span>
                </div>
              )}
              <div className="flex gap-3 pt-2 border-t border-[#f1f5f9]">
                <button type="button" onClick={() => setIsLeaveModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-[#e2e8f0] text-[#475569] text-body-sm font-medium hover:bg-[#f8fafc] transition-colors">Hủy</button>
                <button type="submit" disabled={leaveSubmitted}
                  className="flex-1 py-2 rounded-lg bg-[#004ac6] text-white text-body-sm font-semibold hover:bg-[#003ea8] disabled:opacity-60 transition-all flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Gửi đơn cho GVCN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
