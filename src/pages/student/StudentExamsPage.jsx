import { useState } from 'react';

const EXAMS = [
  { id: 1, subject: 'Toán',       type: 'KT 1 tiết',  date: '2024-11-20', time: '07:30', room: 'P.302', duration: 45,  status: 'upcoming', coeff: 2, note: 'Chương 1–3: Hàm số, Đạo hàm' },
  { id: 2, subject: 'Vật lý',     type: 'KT 15 phút', date: '2024-11-18', time: '08:45', room: 'P.302', duration: 15,  status: 'upcoming', coeff: 1, note: 'Chương 2: Dao động cơ' },
  { id: 3, subject: 'Tiếng Anh',  type: 'KT 1 tiết',  date: '2024-11-22', time: '09:35', room: 'P.204', duration: 45,  status: 'upcoming', coeff: 2, note: 'Unit 4–5: Grammar & Reading' },
  { id: 4, subject: 'Hóa học',    type: 'KT miệng',   date: '2024-11-15', time: '07:00', room: 'P.302', duration: 10,  status: 'completed', coeff: 1, score: 8.5, note: 'Bài 5: Phản ứng oxi hóa-khử' },
  { id: 5, subject: 'Ngữ văn',    type: 'KT 1 tiết',  date: '2024-11-12', time: '10:25', room: 'P.302', duration: 45,  status: 'completed', coeff: 2, score: 7.5, note: '' },
  { id: 6, subject: 'Toán',       type: 'Thi Giữa HK', date: '2024-12-02', time: '07:30', room: 'P.205', duration: 90, status: 'scheduled', coeff: 3, note: 'Toàn bộ nội dung HK1' },
];

const STATUS_MAP = {
  upcoming:  { label: 'Sắp thi',    cls: 'bg-[#fef2f2] text-[#dc2626] border-[#fca5a5]',  icon: 'pending_actions' },
  scheduled: { label: 'Đã lên lịch', cls: 'bg-[#eff4ff] text-[#2563eb] border-[#c3d2f6]', icon: 'event' },
  completed: { label: 'Đã có điểm', cls: 'bg-[#f0fdf4] text-[#15803d] border-[#86efac]',  icon: 'check_circle' },
};

const TYPE_COLORS = {
  'KT miệng':    'bg-[#f5f3ff] text-[#7c3aed]',
  'KT 15 phút':  'bg-[#fff7ed] text-[#c2410c]',
  'KT 1 tiết':   'bg-[#eff4ff] text-[#2563eb]',
  'Thi Giữa HK': 'bg-[#fef2f2] text-[#dc2626] font-semibold',
  'Thi Cuối HK': 'bg-[#fef2f2] text-[#b91c1c] font-semibold',
};

export default function StudentExamsPage() {
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = EXAMS.filter(e => filterStatus === 'all' || e.status === filterStatus)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const upcoming = EXAMS.filter(e => e.status === 'upcoming' || e.status === 'scheduled');
  const daysToNext = upcoming.length > 0
    ? Math.max(0, Math.floor((new Date(upcoming[0].date) - new Date()) / 86400000))
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0f172a]">Lịch Kiểm Tra & Thi</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">Kế hoạch đánh giá định kỳ theo quy định Sở Giáo Dục</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e2e8f0] bg-white text-body-sm font-medium text-[#0f172a] hover:bg-[#f8fafc] transition-colors">
            <span className="material-symbols-outlined text-[18px] text-[#004ac6]">calendar_add_on</span>
            Đồng bộ Google Calendar
          </button>
          <button type="button" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#004ac6] text-white text-body-sm font-medium hover:bg-[#003ea8] transition-colors">
            <span className="material-symbols-outlined text-[18px]">post_add</span>
            Đăng ký thi bù
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-sm text-[#64748b]">Sắp diễn ra (7 ngày)</span>
            <span className="material-symbols-outlined text-[20px] text-[#dc2626]">pending_actions</span>
          </div>
          <div className="text-data-metric font-bold text-[#dc2626]" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {EXAMS.filter(e => e.status === 'upcoming').length}
          </div>
          <div className="text-label-sm text-[#94a3b8] mt-0.5">bài kiểm tra</div>
        </div>
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-sm text-[#64748b]">Kỳ thi tiếp theo</span>
            <span className="material-symbols-outlined text-[20px] text-[#004ac6]">assignment_turned_in</span>
          </div>
          <div className="text-data-metric font-bold text-[#004ac6]" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {daysToNext !== null ? daysToNext + 'N' : '—'}
          </div>
          <div className="text-label-sm text-[#94a3b8] mt-0.5">ngày nữa · {upcoming[0]?.subject ?? '—'}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-sm text-[#64748b]">Phòng thi & SBD</span>
            <span className="material-symbols-outlined text-[20px] text-[#004ac6]">meeting_room</span>
          </div>
          <div className="text-data-metric font-bold text-[#0f172a]">P.302</div>
          <div className="text-label-sm text-[#94a3b8] mt-0.5">SBD: <strong className="text-[#004ac6]">10A1-24</strong></div>
        </div>
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-sm text-[#64748b]">Điều kiện dự thi</span>
            <span className="material-symbols-outlined text-[20px] text-[#15803d]">check_circle</span>
          </div>
          <div className="text-data-metric font-bold text-[#15803d]">HỢP LỆ</div>
          <div className="text-label-sm text-[#94a3b8] mt-0.5">Chuyên cần ≥ 80%</div>
        </div>
      </div>

      {/* Filter + Table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#004ac6]">event_note</span>
            <h2 className="text-headline-sm font-semibold text-[#0f172a]">Danh sách bài kiểm tra & Kỳ thi</h2>
          </div>
          <div className="flex items-center gap-1.5">
            {[{ v: 'all', l: 'Tất cả' }, { v: 'upcoming', l: 'Sắp thi' }, { v: 'scheduled', l: 'Đã lên lịch' }, { v: 'completed', l: 'Đã thi' }].map(f => (
              <button key={f.v} type="button" onClick={() => setFilterStatus(f.v)}
                className={`px-3 py-1 rounded-full text-label-sm font-medium border transition-colors ${filterStatus === f.v ? 'bg-[#004ac6] text-white border-[#004ac6]' : 'bg-white text-[#475569] border-[#e2e8f0] hover:border-[#cbd5e1]'}`}>
                {f.l}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-data-table" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]" style={{ height: '40px' }}>
                <th className="px-4 py-2.5 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider">Môn học</th>
                <th className="px-4 py-2.5 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider">Loại</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">Ngày thi</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">Giờ & Phòng</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-2.5 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider">Điểm</th>
                <th className="px-4 py-2.5 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider">Phạm vi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(exam => {
                const st = STATUS_MAP[exam.status];
                const d = new Date(exam.date);
                const typeCls = TYPE_COLORS[exam.type] ?? 'bg-[#f1f5f9] text-[#334155]';
                return (
                  <tr key={exam.id} className={`border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors ${exam.status === 'upcoming' ? 'bg-[#fef2f2]/20' : ''}`} style={{ height: '52px' }}>
                    <td className="px-4 py-2 font-semibold text-[#0f172a] whitespace-nowrap">{exam.subject}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium ${typeCls}`}>{exam.type}</span>
                    </td>
                    <td className="px-4 py-2 text-center text-[#0f172a] font-medium whitespace-nowrap">
                      {d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-2 text-center text-[#475569] whitespace-nowrap">{exam.time} · {exam.room}</td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-label-sm font-medium ${st.cls}`}>
                        <span className="material-symbols-outlined text-[13px]">{st.icon}</span>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      {exam.score !== undefined ? (
                        <span className={`font-semibold text-body-md ${exam.score >= 8 ? 'text-[#15803d]' : exam.score < 5 ? 'text-[#dc2626]' : 'text-[#0f172a]'}`}>
                          {exam.score.toFixed(1)}
                        </span>
                      ) : <span className="text-[#94a3b8]">—</span>}
                    </td>
                    <td className="px-4 py-2 text-[#64748b] text-body-sm max-w-[200px] truncate">{exam.note || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
