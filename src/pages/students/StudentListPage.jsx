/**
 * StudentListPage — Danh sách học sinh toàn trường
 *
 * Features:
 *   - Chế độ xem: Card View và Photo Frame View
 *   - Bộ lọc: tìm kiếm tên/mã HS, lọc theo lớp, lọc theo trạng thái
 *   - Real-time filter qua useMemo
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import { useState, useMemo } from 'react';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import { students, classes } from '../../data/mockData.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Lấy 1–2 chữ cái viết tắt từ tên để làm avatar */
function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Map màu avatar dựa theo index */
const AVATAR_COLORS = [
  { bg: 'bg-[#eff4ff]', text: 'text-[#2563eb]' },
  { bg: 'bg-[#f0fdf4]', text: 'text-[#15803d]' },
  { bg: 'bg-[#fff7ed]', text: 'text-[#c2410c]' },
  { bg: 'bg-[#fdf4ff]', text: 'text-[#9333ea]' },
  { bg: 'bg-[#f0f9ff]', text: 'text-[#0369a1]' },
];

function avatarColor(idx) {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

const STATUS_OPTIONS = [
  { value: 'all',      label: 'Tất cả' },
  { value: 'active',   label: 'Đang học' },
  { value: 'inactive', label: 'Nghỉ học' },
  { value: 'reserved', label: 'Bảo lưu' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StudentCard({ student, idx }) {
  const { bg, text } = avatarColor(idx);
  const classInfo = classes.find(c => c.id === student.classId);
  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
      {/* Avatar */}
      <div
        className={`flex-none w-11 h-11 rounded-full ${bg} flex items-center justify-center`}
        aria-hidden="true"
      >
        <span className={`text-label-md font-semibold ${text}`}>
          {getInitials(student.name)}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-semibold text-[#0f172a] truncate">{student.name}</p>
        <p className="text-label-sm text-[#64748b] mt-0.5">{student.id}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {classInfo && (
            <span className="inline-flex items-center gap-1 text-label-sm text-[#334155] bg-[#f8fafc] border border-[#e2e8f0] px-2 py-0.5 rounded">
              <span className="material-symbols-outlined text-[13px] text-[#64748b]" aria-hidden="true">
                class
              </span>
              {classInfo.name}
            </span>
          )}
          <StatusBadge status={student.status} />
        </div>
      </div>
    </div>
  );
}

function PhotoFrameCard({ student, idx }) {
  const { bg, text } = avatarColor(idx);
  const classInfo = classes.find(c => c.id === student.classId);
  // Lấy họ và tên cuối để hiển thị gọn
  const nameParts = student.name.trim().split(/\s+/);
  const shortName = nameParts.length > 1
    ? `${nameParts[nameParts.length - 2]} ${nameParts[nameParts.length - 1]}`
    : student.name;

  return (
    <div className="flex flex-col items-center gap-1 p-2">
      {/* Photo frame */}
      <div
        className={`w-full aspect-[3/4] rounded border-2 border-[#cbd5e1] ${bg} flex items-center justify-center relative overflow-hidden`}
        style={{ maxWidth: '90px' }}
        aria-hidden="true"
      >
        <span className={`text-headline-md font-bold ${text}`}>
          {getInitials(student.name)}
        </span>
        {/* Status dot */}
        <span
          className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
            student.status === 'active'   ? 'bg-[#22c55e]' :
            student.status === 'inactive' ? 'bg-[#ef4444]' :
            'bg-[#f59e0b]'
          }`}
        />
      </div>
      {/* Name */}
      <p
        className="text-label-sm font-medium text-[#0f172a] text-center leading-tight truncate w-full"
        title={student.name}
        style={{ maxWidth: '90px' }}
      >
        {shortName}
      </p>
      {/* Class */}
      {classInfo && (
        <p className="text-[10px] text-[#94a3b8] leading-none">{classInfo.name}</p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentListPage() {
  const [viewMode, setViewMode]           = useState('card');       // 'card' | 'photo'
  const [searchTerm, setSearchTerm]       = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // ── Derived: filtered students ────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return students.filter(s => {
      // Text search: name hoặc id
      if (q && !s.name.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q)) return false;
      // Class filter
      if (selectedClass !== 'all' && s.classId !== selectedClass) return false;
      // Status filter
      if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
      return true;
    });
  }, [searchTerm, selectedClass, selectedStatus]);

  const totalLabel = filtered.length === students.length
    ? `${students.length} học sinh`
    : `${filtered.length} / ${students.length} học sinh`;

  return (
    <div className="space-y-5">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0f172a]">Danh sách học sinh</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            Quản lý hồ sơ và thông tin học sinh toàn trường
          </p>
        </div>

        {/* View mode toggle */}
        <div
          className="flex items-center bg-[#f1f5f9] rounded-lg p-0.5 gap-0.5"
          role="group"
          aria-label="Chế độ xem"
        >
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-label-sm font-medium transition-colors ${
              viewMode === 'card'
                ? 'bg-white text-[#0f172a] shadow-sm'
                : 'text-[#64748b] hover:text-[#334155]'
            }`}
            aria-pressed={viewMode === 'card'}
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">view_list</span>
            Danh sách
          </button>
          <button
            type="button"
            onClick={() => setViewMode('photo')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-label-sm font-medium transition-colors ${
              viewMode === 'photo'
                ? 'bg-white text-[#0f172a] shadow-sm'
                : 'text-[#64748b] hover:text-[#334155]'
            }`}
            aria-pressed={viewMode === 'photo'}
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">grid_view</span>
            Ảnh thẻ
          </button>
        </div>
      </div>

      {/* ── Filter toolbar ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">

          {/* Search input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#94a3b8]"
              aria-hidden="true"
            >
              search
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm tên hoặc mã học sinh..."
              className="w-full pl-9 pr-8 py-2 text-body-sm text-[#0f172a] placeholder-[#94a3b8] border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition"
              aria-label="Tìm kiếm học sinh"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] transition-colors"
                aria-label="Xóa tìm kiếm"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Class dropdown */}
          <div className="relative">
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-body-sm text-[#334155] border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition cursor-pointer"
              aria-label="Lọc theo lớp"
            >
              <option value="all">Tất cả lớp</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-[#94a3b8]"
              aria-hidden="true"
            >
              expand_more
            </span>
          </div>

          {/* Status chip group */}
          <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Lọc theo trạng thái">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedStatus(opt.value)}
                className={`px-3 py-1 rounded-full text-label-sm font-medium border transition-colors ${
                  selectedStatus === opt.value
                    ? 'bg-[#2563eb] text-white border-[#2563eb]'
                    : 'bg-white text-[#475569] border-[#e2e8f0] hover:border-[#cbd5e1] hover:text-[#0f172a]'
                }`}
                aria-pressed={selectedStatus === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Result count */}
          <span className="ml-auto text-label-sm text-[#94a3b8] whitespace-nowrap">
            {totalLabel}
          </span>
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-[#94a3b8]">
          <span className="material-symbols-outlined text-[48px] mb-3" aria-hidden="true">
            person_search
          </span>
          <p className="text-body-md font-medium text-[#475569]">Không tìm thấy học sinh nào</p>
          <p className="text-body-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          <button
            type="button"
            onClick={() => { setSearchTerm(''); setSelectedClass('all'); setSelectedStatus('all'); }}
            className="mt-4 inline-flex items-center gap-1.5 text-label-sm font-medium text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">refresh</span>
            Xóa bộ lọc
          </button>
        </div>
      ) : viewMode === 'card' ? (
        /* Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((student, idx) => (
            <StudentCard key={student.id} student={student} idx={idx} />
          ))}
        </div>
      ) : (
        /* Photo Frame View */
        <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 justify-items-center">
            {filtered.map((student, idx) => (
              <PhotoFrameCard key={student.id} student={student} idx={idx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
