import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { students, classes, notifications } from '../../data/mockData.js';
import { ROUTES } from '../../constants/routes.js';

export default function GVCNDashboardPage() {
  const navigate = useNavigate();
  const homeroomClass = classes.find(c => c.id === '10A1') || classes[0];
  const homeroomStudents = students.filter(s => s.classId === '10A1');

  // State for pending leave requests from parents
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 1, studentName: 'Nguyễn Văn An', date: '27/09/2026', reason: 'Học sinh bị sốt cao có xác nhận của phụ huynh', status: 'pending' },
    { id: 2, studentName: 'Trần Thị Bình', date: '28/09/2026', reason: 'Gia đình có việc bận về quê', status: 'pending' },
  ]);

  const [conductMap, setConductMap] = useState({
    HS001: 'Tốt',
    HS002: 'Tốt',
    HS003: 'Khá',
    HS004: 'Tốt',
    HS005: 'Trung bình',
  });

  const handleApproveLeave = (id) => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };

  const handleRejectLeave = (id) => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-[#cbd5e1] p-6 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-label-sm font-semibold bg-[#f5f3ff] text-[#7c3aed] border border-[#ddd6fe] mb-1">
            Mã vai trò: ROLE_HOMEROOM_TEACHER (GV Chủ Nhiệm)
          </span>
          <h1 className="text-headline-md font-bold text-[#0f172a]">
            Cổng Quản Lý Lớp Chủ Nhiệm {homeroomClass.name}
          </h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            Giáo viên chủ nhiệm: Lê Minh Châu · Niên khóa 2024–2025 · Phòng học: P.202
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate(ROUTES.ATTENDANCE)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white text-body-sm font-semibold shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            Điểm Danh Hàng Ngày
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.PARENT_COMMUNICATION)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#15803d] border border-[#86efac] text-body-sm font-semibold transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Sổ Liên Lạc &amp; Thông Báo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-1">
          <span className="text-label-sm font-semibold text-[#64748b]">Sĩ số Lớp Chủ Nhiệm</span>
          <p className="text-headline-lg font-bold text-[#0f172a]">{homeroomStudents.length} Học sinh</p>
          <p className="text-label-sm text-[#16a34a]">Nam: 22 · Nữ: 23</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-1">
          <span className="text-label-sm font-semibold text-[#64748b]">Tỷ lệ Chuyên cần Hôm nay</span>
          <p className="text-headline-lg font-bold text-[#16a34a]">97.8%</p>
          <p className="text-label-sm text-[#475569]">Có mặt 44/45 học sinh</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-1">
          <span className="text-label-sm font-semibold text-[#64748b]">Đơn Xin Nghỉ Học Chờ Duyệt</span>
          <p className="text-headline-lg font-bold text-[#c2410c]">{leaveRequests.filter(r => r.status === 'pending').length} Đơn</p>
          <p className="text-label-sm text-[#c2410c]">Cần xử lý trong ngày</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-1">
          <span className="text-label-sm font-semibold text-[#64748b]">Đánh Giá Hạnh Kiểm Lớp</span>
          <p className="text-headline-lg font-bold text-[#2563eb]">88.9% Tốt</p>
          <p className="text-label-sm text-[#2563eb]">40 Tốt · 4 Khá · 1 TB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Leave Applications to Approve */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-[#cbd5e1] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
            <h2 className="text-body-md font-bold text-[#0f172a] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#c2410c]">assignment_late</span>
              Duyệt Đơn Xin Nghỉ Học Từ Phụ Huynh
            </h2>
            <span className="text-label-sm bg-[#fff7ed] text-[#c2410c] px-2.5 py-0.5 rounded-full font-medium border border-[#fdba74]">
              {leaveRequests.filter(r => r.status === 'pending').length} chờ duyệt
            </span>
          </div>

          <div className="space-y-3">
            {leaveRequests.map(req => (
              <div key={req.id} className="p-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-body-sm text-[#0f172a]">{req.studentName}</span>
                  <span className="text-label-sm text-[#64748b] bg-white px-2 py-0.5 rounded border border-[#e2e8f0]">{req.date}</span>
                </div>
                <p className="text-body-sm text-[#475569]">Lý do: {req.reason}</p>

                {req.status === 'pending' ? (
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleRejectLeave(req.id)}
                      className="px-3 py-1.5 rounded text-label-sm font-medium border border-[#e2e8f0] bg-white text-[#b91c1c] hover:bg-[#fef2f2]"
                    >
                      Từ Chối
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveLeave(req.id)}
                      className="px-3 py-1.5 rounded text-label-sm font-semibold bg-[#15803d] hover:bg-[#166534] text-white"
                    >
                      Duyệt Nghỉ Có Phép
                    </button>
                  </div>
                ) : (
                  <span className={`inline-block px-2.5 py-0.5 rounded text-label-sm font-semibold ${req.status === 'approved' ? 'bg-[#f0fdf4] text-[#15803d]' : 'bg-[#fef2f2] text-[#b91c1c]'}`}>
                    {req.status === 'approved' ? 'Đã duyệt có phép' : 'Đã từ chối'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Homeroom Conduct Assessment (Hạnh kiểm per BR-05) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-[#cbd5e1] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
            <h2 className="text-body-md font-bold text-[#0f172a] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#7c3aed]">grade</span>
              Đánh Giá Hạnh Kiểm Học Kỳ (GVCN)
            </h2>
            <span className="text-label-sm text-[#64748b]">Theo Thông tư 22/2021/TT-BGDĐT</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th className="p-2.5 font-semibold text-[#475569]">Mã HS</th>
                  <th className="p-2.5 font-semibold text-[#475569]">Họ và Tên</th>
                  <th className="p-2.5 font-semibold text-[#475569] text-center">Xếp Loại Hạnh Kiểm</th>
                </tr>
              </thead>
              <tbody>
                {homeroomStudents.slice(0, 5).map(st => (
                  <tr key={st.id} className="border-b border-[#f1f5f9]">
                    <td className="p-2.5 font-mono text-[#004ac6] font-semibold">{st.code}</td>
                    <td className="p-2.5 font-medium text-[#0f172a]">{st.name}</td>
                    <td className="p-2.5 text-center">
                      <select
                        value={conductMap[st.id] || 'Tốt'}
                        onChange={(e) => setConductMap(prev => ({ ...prev, [st.id]: e.target.value }))}
                        className="border border-[#cbd5e1] rounded px-2 py-1 text-label-sm bg-white font-medium focus:border-[#004ac6] focus:outline-none"
                      >
                        <option value="Tốt">Tốt</option>
                        <option value="Khá">Khá</option>
                        <option value="Trung bình">Trung bình</option>
                        <option value="Yếu">Yếu</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
