/**
 * GVCNDashboardPage — Dashboard Giáo Viên Chủ Nhiệm
 *
 * Hiển thị:
 *   - Thông tin lớp chủ nhiệm + KPI: sĩ số, chuyên cần hôm nay, đơn nghỉ chờ duyệt, hạnh kiểm
 *   - Danh sách đơn xin nghỉ chờ duyệt (Duyệt / Từ chối)
 *   - Bảng hạnh kiểm học sinh (dùng academic_rank)
 *
 * Dữ liệu: GET /api/dashboard/gvcn — không dùng mockData.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGVCNDashboard, processLeaveRequest, updateStudentConduct } from '../../api/stubs.js';
import { ROUTES } from '../../constants/routes.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(str) {
  if (!str) return '—';
  // Hỗ trợ cả YYYY-MM-DD và ISO timestamp
  const d = new Date(str);
  if (isNaN(d)) return str;
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function SkeletonKpi() {
  return (
    <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-2">
      <div className="animate-pulse h-3 bg-[#e2e8f0] rounded w-2/3" />
      <div className="animate-pulse h-8 bg-[#e2e8f0] rounded w-1/2" />
      <div className="animate-pulse h-3 bg-[#e2e8f0] rounded w-3/4" />
    </div>
  );
}

function SkeletonRow({ cols = 3 }) {
  return (
    <tr>
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="p-2.5">
          <div className="animate-pulse h-5 bg-[#e2e8f0] rounded" />
        </td>
      ))}
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GVCNDashboardPage() {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────────
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Local leave-request state (optimistic UI)
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [processingId,  setProcessingId]  = useState(null);

  // Conduct edit state
  const [conductSelects, setConductSelects] = useState({}); // { [studentId]: conductRank }
  const [savingConduct,  setSavingConduct]  = useState(null); // studentId đang lưu
  const [conductToast,   setConductToast]   = useState(null); // { type: 'success'|'error', msg }

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchGVCNDashboard();
        if (!cancelled) {
          setData(result);
          setLeaveRequests(result.pendingLeaves ?? []);
          // Khởi tạo conductSelects từ dữ liệu học sinh
          const initSelects = {};
          for (const st of (result.students ?? [])) {
            initSelects[st.id] = st.conductRank || '';
          }
          setConductSelects(initSelects);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải dữ liệu Dashboard GVCN.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Leave request handlers ────────────────────────────────────────────────
  const handleLeaveAction = useCallback(async (id, action) => {
    setProcessingId(id);
    // Optimistic update
    setLeaveRequests((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r)
    );
    try {
      await processLeaveRequest(id, action);
    } catch (err) {
      // Rollback on failure
      setLeaveRequests((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: 'pending' } : r)
      );
      setError(err.message || 'Xử lý đơn nghỉ thất bại.');
    } finally {
      setProcessingId(null);
    }
  }, []);

  // ── Conduct handlers ──────────────────────────────────────────────────────
  const handleConductChange = useCallback((studentId, value) => {
    setConductSelects((prev) => ({ ...prev, [studentId]: value }));
  }, []);

  const handleUpdateConduct = useCallback(async (studentId) => {
    const conductRank = conductSelects[studentId];
    if (!conductRank) return;
    setSavingConduct(studentId);
    setConductToast(null);
    try {
      await updateStudentConduct(studentId, { conductRank, schoolYear: '2024-2025', semester: 'HK1' });
      setConductToast({ type: 'success', msg: 'Cập nhật hạnh kiểm thành công!' });
    } catch (err) {
      setConductToast({ type: 'error', msg: err.message || 'Cập nhật hạnh kiểm thất bại.' });
    } finally {
      setSavingConduct(null);
    }
  }, [conductSelects]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const classInfo      = data?.classInfo ?? null;
  const students       = data?.students  ?? [];
  const attendance     = data?.todayAttendance ?? null;
  const pendingCount   = leaveRequests.filter((r) => r.status === 'pending').length;
  const conductSummary = data?.conductSummary ?? [];

  // Tính % hạnh kiểm tốt (Giỏi + Khá)
  const totalStudents  = students.length;
  const goodConduct    = conductSummary
    .filter((c) => ['Giỏi', 'Xuất sắc'].includes(c.rank))
    .reduce((s, c) => s + c.count, 0);
  const conductPct     = totalStudents > 0 ? Math.round((goodConduct / totalStudents) * 100) : 0;

  // Tỉ lệ chuyên cần hôm nay
  const attPct = attendance && attendance.total > 0
    ? Math.round((attendance.present / attendance.total) * 100)
    : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 font-sans">

      {/* ── Page Header ── */}
      <div className="bg-white rounded-xl border border-[#cbd5e1] p-6 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-label-sm font-semibold bg-[#f5f3ff] text-[#7c3aed] border border-[#ddd6fe] mb-1">
            Mã vai trò: ROLE_HOMEROOM_TEACHER (GV Chủ Nhiệm)
          </span>
          <h1 className="text-headline-md font-bold text-[#0f172a]">
            {loading
              ? 'Đang tải...'
              : classInfo
                ? `Cổng Quản Lý Lớp Chủ Nhiệm ${classInfo.name}`
                : 'Cổng Quản Lý Lớp Chủ Nhiệm'}
          </h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            {classInfo
              ? `Giáo viên chủ nhiệm: ${classInfo.gvcnName} · Niên khóa 2024–2025`
              : 'Niên khóa 2024–2025'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" onClick={() => navigate(ROUTES.ATTENDANCE)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white text-body-sm font-semibold shadow-xs transition-all">
            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            Điểm Danh Hàng Ngày
          </button>
          <button type="button" onClick={() => navigate(ROUTES.PARENT_COMMUNICATION)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#15803d] border border-[#86efac] text-body-sm font-semibold transition-all">
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Sổ Liên Lạc &amp; Thông Báo
          </button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]" role="alert">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <p className="text-body-sm font-medium flex-1">{error}</p>
          <button className="text-label-sm underline hover:no-underline" onClick={() => setError(null)}>Đóng</button>
        </div>
      )}

      {/* ── KPI Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonKpi /><SkeletonKpi /><SkeletonKpi /><SkeletonKpi />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sĩ số */}
          <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-1">
            <span className="text-label-sm font-semibold text-[#64748b]">Sĩ số Lớp Chủ Nhiệm</span>
            <p className="text-headline-lg font-bold text-[#0f172a]">{totalStudents} Học sinh</p>
            <p className="text-label-sm text-[#16a34a]">
              Nam: {students.filter(s => s.gender === 'Nam').length} ·
              Nữ: {students.filter(s => s.gender === 'Nữ').length}
            </p>
          </div>

          {/* Chuyên cần hôm nay */}
          <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-1">
            <span className="text-label-sm font-semibold text-[#64748b]">Tỷ lệ Chuyên cần Hôm nay</span>
            <p className={`text-headline-lg font-bold ${attPct != null && attPct < 80 ? 'text-[#c2410c]' : 'text-[#16a34a]'}`}>
              {attPct != null ? `${attPct}%` : '—'}
            </p>
            <p className="text-label-sm text-[#475569]">
              {attendance && attendance.total > 0
                ? `Có mặt ${attendance.present}/${attendance.total} học sinh`
                : 'Chưa điểm danh hôm nay'}
            </p>
          </div>

          {/* Đơn nghỉ chờ duyệt */}
          <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-1">
            <span className="text-label-sm font-semibold text-[#64748b]">Đơn Xin Nghỉ Học Chờ Duyệt</span>
            <p className={`text-headline-lg font-bold ${pendingCount > 0 ? 'text-[#c2410c]' : 'text-[#16a34a]'}`}>
              {pendingCount} Đơn
            </p>
            <p className={`text-label-sm ${pendingCount > 0 ? 'text-[#c2410c]' : 'text-[#16a34a]'}`}>
              {pendingCount > 0 ? 'Cần xử lý trong ngày' : 'Không có đơn chờ'}
            </p>
          </div>

          {/* Hạnh kiểm */}
          <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-1">
            <span className="text-label-sm font-semibold text-[#64748b]">Đánh Giá Hạnh Kiểm Lớp</span>
            <p className="text-headline-lg font-bold text-[#2563eb]">{conductPct}% Giỏi</p>
            <p className="text-label-sm text-[#2563eb]">
              {conductSummary.map((c) => `${c.count} ${c.rank}`).join(' · ') || '—'}
            </p>
          </div>
        </div>
      )}

      {/* ── Content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Đơn xin nghỉ chờ duyệt */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-[#cbd5e1] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
            <h2 className="text-body-md font-bold text-[#0f172a] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#c2410c]">assignment_late</span>
              Duyệt Đơn Xin Nghỉ Học Từ Phụ Huynh
            </h2>
            <span className="text-label-sm bg-[#fff7ed] text-[#c2410c] px-2.5 py-0.5 rounded-full font-medium border border-[#fdba74]">
              {pendingCount} chờ duyệt
            </span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1,2].map((i) => (
                  <div key={i} className="p-4 rounded-lg border border-[#e2e8f0] space-y-2">
                    <div className="animate-pulse h-4 bg-[#e2e8f0] rounded w-1/2" />
                    <div className="animate-pulse h-3 bg-[#e2e8f0] rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-[#94a3b8]">
                <span className="material-symbols-outlined text-[36px] mb-2">check_circle</span>
                <p className="text-body-sm">Không có đơn xin nghỉ nào</p>
              </div>
            ) : (
              leaveRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-body-sm text-[#0f172a]">{req.studentName}</span>
                    <span className="text-label-sm text-[#64748b] bg-white px-2 py-0.5 rounded border border-[#e2e8f0] whitespace-nowrap">
                      {fmtDate(req.fromDate)}{req.toDate && req.toDate !== req.fromDate ? ` → ${fmtDate(req.toDate)}` : ''}
                    </span>
                  </div>
                  <p className="text-body-sm text-[#475569]">Lý do: {req.reason}</p>

                  {req.status === 'pending' ? (
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button"
                        disabled={processingId === req.id}
                        onClick={() => handleLeaveAction(req.id, 'reject')}
                        className="px-3 py-1.5 rounded text-label-sm font-medium border border-[#e2e8f0] bg-white text-[#b91c1c] hover:bg-[#fef2f2] disabled:opacity-50">
                        Từ Chối
                      </button>
                      <button type="button"
                        disabled={processingId === req.id}
                        onClick={() => handleLeaveAction(req.id, 'approve')}
                        className="px-3 py-1.5 rounded text-label-sm font-semibold bg-[#15803d] hover:bg-[#166534] text-white disabled:opacity-50">
                        {processingId === req.id
                          ? <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>Đang xử lý</span>
                          : 'Duyệt Nghỉ Có Phép'}
                      </button>
                    </div>
                  ) : (
                    <span className={`inline-block px-2.5 py-0.5 rounded text-label-sm font-semibold ${req.status === 'approved' ? 'bg-[#f0fdf4] text-[#15803d]' : 'bg-[#fef2f2] text-[#b91c1c]'}`}>
                      {req.status === 'approved' ? 'Đã duyệt có phép' : 'Đã từ chối'}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Hạnh kiểm học sinh */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-[#cbd5e1] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
            <h2 className="text-body-md font-bold text-[#0f172a] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#7c3aed]">grade</span>
              Xếp Loại & Cập Nhật Hạnh Kiểm (GVCN)
            </h2>
            <span className="text-label-sm text-[#64748b]">HK1 2024-2025</span>
          </div>

          {/* Conduct toast */}
          {conductToast && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-label-sm font-medium border ${conductToast.type === 'success' ? 'bg-[#f0fdf4] border-[#86efac] text-[#15803d]' : 'bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]'}`} role="status">
              <span className="material-symbols-outlined text-[16px]">{conductToast.type === 'success' ? 'check_circle' : 'error'}</span>
              {conductToast.msg}
              <button className="ml-auto text-current opacity-60 hover:opacity-100" onClick={() => setConductToast(null)} aria-label="Đóng">✕</button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th className="p-2.5 font-semibold text-[#475569]">Mã HS</th>
                  <th className="p-2.5 font-semibold text-[#475569]">Họ và Tên</th>
                  <th className="p-2.5 font-semibold text-[#475569] text-center">GPA</th>
                  <th className="p-2.5 font-semibold text-[#475569] text-center">Xếp Loại</th>
                  <th className="p-2.5 font-semibold text-[#475569] text-center">Hạnh Kiểm</th>
                  <th className="p-2.5 font-semibold text-[#475569] text-center">Cập Nhật</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>{[1,2,3,4,5].map((i) => <SkeletonRow key={i} cols={6} />)}</>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-[#94a3b8] text-body-sm">
                      Không có học sinh trong lớp
                    </td>
                  </tr>
                ) : (
                  students.map((st) => {
                    const rankColor =
                      st.academicRank === 'Giỏi' || st.academicRank === 'Xuất sắc' ? 'text-[#15803d] bg-[#f0fdf4]' :
                      st.academicRank === 'Khá'  ? 'text-[#2563eb] bg-[#eff4ff]' :
                      st.academicRank === 'Trung bình' ? 'text-[#c2410c] bg-[#fff7ed]' :
                      'text-[#b91c1c] bg-[#fef2f2]';
                    const isSaving = savingConduct === st.id;
                    return (
                      <tr key={st.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                        <td className="p-2.5 font-mono text-[#004ac6] font-semibold">{st.code}</td>
                        <td className="p-2.5 font-medium text-[#0f172a]">{st.name}</td>
                        <td className="p-2.5 text-center tabular-nums text-[#334155]">
                          {st.gpa != null ? st.gpa.toFixed(1) : '—'}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-label-sm font-semibold ${rankColor}`}>
                            {st.academicRank || '—'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <select
                            value={conductSelects[st.id] ?? ''}
                            onChange={(e) => handleConductChange(st.id, e.target.value)}
                            disabled={isSaving}
                            aria-label={`Hạnh kiểm ${st.name}`}
                            className="border border-[#e2e8f0] rounded px-2 py-1 text-label-sm text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">-- Chọn --</option>
                            <option value="Tốt">Tốt</option>
                            <option value="Khá">Khá</option>
                            <option value="Trung bình">Trung bình</option>
                            <option value="Yếu">Yếu</option>
                          </select>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            disabled={isSaving || !conductSelects[st.id]}
                            onClick={() => handleUpdateConduct(st.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-label-sm font-semibold bg-[#004ac6] hover:bg-[#003ea8] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label={`Lưu hạnh kiểm ${st.name}`}
                          >
                            {isSaving
                              ? <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                              : <span className="material-symbols-outlined text-[14px]">save</span>}
                            Lưu
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
