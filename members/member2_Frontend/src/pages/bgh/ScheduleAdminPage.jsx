/**
 * ScheduleAdminPage — Xếp thời khóa biểu Admin (BGH)
 *
 * Chức năng:
 *   - Timetable grid có thể click vào từng cell
 *   - Click ô trống → Modal form trống để thêm slot
 *   - Click ô có slot → Modal pre-populated để sửa, có nút xóa
 *   - Conflict detection: cùng teacherName hoặc room + dayOfWeek + period → highlight đỏ
 *   - Submit → POST /api/schedules (upsert), Delete → DELETE /api/schedules
 *
 * Dữ liệu: GET /api/schedules — không dùng mockData.
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '../../components/shared/Modal.jsx';
import {
  fetchSchedulePageData,
  handleSaveScheduleSlot,
  handleDeleteScheduleSlot,
} from '../../api/stubs.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_LABELS = { 1: 'Thứ Hai', 2: 'Thứ Ba', 3: 'Thứ Tư', 4: 'Thứ Năm', 5: 'Thứ Sáu' };
const DAYS    = [1, 2, 3, 4, 5];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** Ngày thứ Hai của tuần hiện tại, format YYYY-MM-DD */
function currentWeekStart() {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // adjust to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** Format YYYY-MM-DD → DD/MM/YYYY */
function fmtDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Tính ngày cuối tuần (Sunday) từ weekStart */
function weekEnd(weekStart) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d.toISOString().slice(0, 10);
}

const EMPTY_FORM = { subjectName: '', teacherName: '', room: '' };

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCell() {
  return (
    <div className="animate-pulse h-[76px] rounded-lg bg-[#e2e8f0]" />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScheduleAdminPage() {
  const [weekStart, setWeekStart] = useState(currentWeekStart);

  // Master state từ API
  const [slots,        setSlots]        = useState([]);   // slots của class đang chọn
  const [allWeekSlots, setAllWeekSlots] = useState([]);   // tất cả slots trong tuần (conflict detection)
  const [classes,      setClasses]      = useState([]);
  const [subjects,     setSubjects]     = useState([]);
  const [teacherNames, setTeacherNames] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  // Chờ classes load xong mới set selectedClass
  const [selectedClass, setSelectedClass] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [clickedCell, setClickedCell] = useState(null);
  const [modalForm,   setModalForm]   = useState(EMPTY_FORM);
  const [isSaving,    setIsSaving]    = useState(false);
  const [isDeleting,  setIsDeleting]  = useState(false);
  const [modalError,  setModalError]  = useState(null);

  // ── Fetch khi class hoặc tuần thay đổi ────────────────────────────────────
  useEffect(() => {
    if (!selectedClass) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSchedulePageData(selectedClass, weekStart);
        if (!cancelled) {
          setSlots(data.slots ?? []);
          setAllWeekSlots(data.allWeekSlots ?? []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải thời khóa biểu.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [selectedClass, weekStart]);

  // ── Fetch danh mục (1 lần) ────────────────────────────────────────────────
  useEffect(() => {
    async function loadMeta() {
      try {
        // Dùng class đầu tiên nếu chưa có; chỉ cần lấy meta, slot sẽ load sau
        const tmpClass = selectedClass || '__meta__';
        const data = await fetchSchedulePageData(tmpClass, weekStart);
        setClasses(data.classes ?? []);
        setSubjects(data.subjects ?? []);
        setTeacherNames(data.teacherNames ?? []);
        // Set class mặc định là class đầu tiên
        if (!selectedClass && data.classes?.length > 0) {
          setSelectedClass(data.classes[0].id);
        }
      } catch {
        // ignore — main fetch sẽ báo lỗi
      }
    }
    loadMeta();
    // chỉ chạy 1 lần khi mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Lookup map: `${dayOfWeek}-${period}` → slot ───────────────────────────
  const slotMap = useMemo(() => {
    const map = {};
    for (const s of slots) {
      map[`${s.dayOfWeek}-${s.period}`] = s;
    }
    return map;
  }, [slots]);

  // ── Conflict detection (cross-class) ──────────────────────────────────────
  const conflictKeys = useMemo(() => {
    const keys = new Set();
    const mySlots = allWeekSlots.filter((s) => s.classId === selectedClass);
    for (const slot of mySlots) {
      const sameCell = allWeekSlots.filter(
        (s) =>
          s.dayOfWeek === slot.dayOfWeek &&
          s.period    === slot.period &&
          s.classId   !== slot.classId,
      );
      const hasConflict = sameCell.some(
        (s) =>
          (s.teacherName && s.teacherName === slot.teacherName) ||
          (s.room && s.room === slot.room),
      );
      if (hasConflict) keys.add(`${slot.dayOfWeek}-${slot.period}`);
    }
    return keys;
  }, [allWeekSlots, selectedClass]);

  // ── Modal handlers ────────────────────────────────────────────────────────

  const openModal = useCallback((day, period) => {
    const existing = slotMap[`${day}-${period}`];
    setClickedCell({ classId: selectedClass, dayOfWeek: day, period });
    setModalError(null);
    if (existing) {
      setEditingSlot(existing);
      setModalForm({
        subjectName: existing.subjectName,
        teacherName: existing.teacherName,
        room:        existing.room,
      });
    } else {
      setEditingSlot(null);
      setModalForm(EMPTY_FORM);
    }
    setIsModalOpen(true);
  }, [slotMap, selectedClass]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingSlot(null);
    setClickedCell(null);
    setModalForm(EMPTY_FORM);
    setModalError(null);
  }, []);

  const handleFormChange = (field, value) =>
    setModalForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clickedCell) return;
    setIsSaving(true);
    setModalError(null);

    const slotPayload = {
      classId:     clickedCell.classId,
      weekStart,
      dayOfWeek:   clickedCell.dayOfWeek,
      period:      clickedCell.period,
      subjectName: modalForm.subjectName,
      teacherName: modalForm.teacherName,
      room:        modalForm.room,
      timeRange:   '',
    };

    try {
      const saved = await handleSaveScheduleSlot(slotPayload);

      // Cập nhật slots và allWeekSlots
      const upsertInList = (list, newSlot) => [
        ...list.filter(
          (s) => !(s.classId === newSlot.classId && s.weekStart === newSlot.weekStart &&
                   s.dayOfWeek === newSlot.dayOfWeek && s.period === newSlot.period)
        ),
        newSlot,
      ];
      setSlots((prev) => upsertInList(prev, saved));
      setAllWeekSlots((prev) => upsertInList(prev, saved));
      closeModal();
    } catch (err) {
      setModalError(err.message || 'Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!clickedCell || !editingSlot) return;
    setIsDeleting(true);
    setModalError(null);
    try {
      await handleDeleteScheduleSlot({
        classId:   clickedCell.classId,
        weekStart,
        dayOfWeek: clickedCell.dayOfWeek,
        period:    clickedCell.period,
      });
      const removeFromList = (list) =>
        list.filter(
          (s) => !(s.classId === clickedCell.classId && s.weekStart === weekStart &&
                   s.dayOfWeek === clickedCell.dayOfWeek && s.period === clickedCell.period)
        );
      setSlots(removeFromList);
      setAllWeekSlots(removeFromList);
      closeModal();
    } catch (err) {
      setModalError(err.message || 'Xóa thất bại. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Navigation tuần ───────────────────────────────────────────────────────
  const shiftWeek = (delta) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d.toISOString().slice(0, 10));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0f172a]">Xếp Thời Khóa Biểu</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            Quản lý và chỉnh sửa thời khóa biểu — click vào ô để thêm hoặc sửa tiết học
          </p>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftWeek(-1)}
            className="p-1.5 rounded-lg border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors"
            aria-label="Tuần trước"
          >
            <span className="material-symbols-outlined text-[18px] text-[#64748b]">chevron_left</span>
          </button>
          <span className="flex items-center gap-1.5 text-label-sm text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1.5 rounded-lg">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">calendar_today</span>
            Tuần {fmtDate(weekStart)} – {fmtDate(weekEnd(weekStart))}
          </span>
          <button
            type="button"
            onClick={() => shiftWeek(1)}
            className="p-1.5 rounded-lg border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors"
            aria-label="Tuần sau"
          >
            <span className="material-symbols-outlined text-[18px] text-[#64748b]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]" role="alert">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <p className="text-body-sm font-medium flex-1">{error}</p>
          <button
            className="text-label-sm underline hover:no-underline"
            onClick={() => { setError(null); setLoading(true); fetchSchedulePageData(selectedClass, weekStart).then((d) => { setSlots(d.slots); setAllWeekSlots(d.allWeekSlots); }).catch((e) => setError(e.message)).finally(() => setLoading(false)); }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 p-4 flex flex-wrap gap-4 items-end">
        {/* Class selector */}
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label className="text-label-sm font-medium text-[#434655]">
            <span className="material-symbols-outlined text-[14px] align-middle mr-1">groups</span>
            Lớp học
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
          >
            {classes.length === 0 && <option value="">Đang tải...</option>}
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap text-label-sm text-[#64748b] pb-0.5">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-[#eff4ff] border border-[#c3c6d7]" />
            Có tiết
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-[#fef2f2] border border-[#fca5a5]" />
            Xung đột
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-[#f8fafc] border border-[#e2e8f0] border-dashed" />
            Trống (click để thêm)
          </span>
        </div>
      </div>

      {/* ── Timetable grid ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-elevation-1 overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]">
              <th className="sticky left-0 z-10 bg-[#f8fafc] px-4 py-3 text-left text-label-sm text-[#475569] font-medium uppercase tracking-wider w-24 border-r border-[#e2e8f0]">
                Tiết
              </th>
              {DAYS.map((day) => (
                <th key={day} className="px-3 py-3 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider min-w-[140px]">
                  {DAY_LABELS[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period) => (
              <tr key={period} className="border-b border-[#f1f5f9]">
                {/* Period label */}
                <td className="sticky left-0 z-10 bg-white px-4 py-2.5 border-r border-[#e2e8f0]">
                  <span className="text-label-sm font-semibold text-[#475569]">Tiết {period}</span>
                </td>

                {DAYS.map((day) => {
                  const key  = `${day}-${period}`;
                  const slot = slotMap[key];
                  const hasConflict = conflictKeys.has(key);

                  if (loading) {
                    return (
                      <td key={day} className="px-2 py-2">
                        <SkeletonCell />
                      </td>
                    );
                  }

                  if (slot) {
                    return (
                      <td key={day} className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => openModal(day, period)}
                          className={`w-full text-left rounded-lg p-2.5 border transition-all ${
                            hasConflict
                              ? 'bg-[#fef2f2] border-[#fca5a5] hover:border-[#ef4444]'
                              : 'bg-[#eff4ff] border-[#c3c6d7] hover:border-[#004ac6]'
                          }`}
                          title="Click để chỉnh sửa"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-label-sm font-semibold text-[#0f172a] leading-tight truncate">
                              {slot.subjectName}
                            </span>
                            {hasConflict && (
                              <span className="material-symbols-outlined text-[14px] text-[#ef4444] flex-none" aria-label="Xung đột">
                                warning
                              </span>
                            )}
                          </div>
                          <p className="text-label-sm text-[#64748b] mt-0.5 truncate">{slot.teacherName}</p>
                          <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 bg-white/70 rounded text-label-sm text-[#334155] border border-[#e2e8f0]">
                            <span className="material-symbols-outlined text-[12px]">door_open</span>
                            {slot.room}
                          </span>
                        </button>
                      </td>
                    );
                  }

                  return (
                    <td key={day} className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => openModal(day, period)}
                        className="w-full h-[76px] rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] hover:border-[#004ac6] hover:bg-[#eff4ff] transition-all flex items-center justify-center group"
                        title="Click để thêm tiết học"
                        aria-label={`Thêm tiết ${period} ngày ${DAY_LABELS[day]}`}
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#cbd5e1] group-hover:text-[#004ac6] transition-colors">
                          add
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          editingSlot
            ? `Chỉnh sửa tiết học — ${DAY_LABELS[clickedCell?.dayOfWeek]} Tiết ${clickedCell?.period}`
            : `Thêm tiết học — ${clickedCell ? `${DAY_LABELS[clickedCell.dayOfWeek]} Tiết ${clickedCell.period}` : ''}`
        }
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Context info */}
          {clickedCell && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#eff4ff] rounded-lg border border-[#c3c6d7] text-body-sm text-[#004ac6]">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Lớp {selectedClass} · {DAY_LABELS[clickedCell.dayOfWeek]} · Tiết {clickedCell.period}
            </div>
          )}

          {/* Modal error */}
          {modalError && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#fef2f2] rounded-lg border border-[#fecaca] text-body-sm text-[#b91c1c]">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {modalError}
            </div>
          )}

          {/* Subject */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-medium text-[#434655]">
              Môn học <span className="text-[#ef4444]">*</span>
            </label>
            <select
              value={modalForm.subjectName}
              onChange={(e) => handleFormChange('subjectName', e.target.value)}
              required
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            >
              <option value="">Chọn môn học...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Teacher */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-medium text-[#434655]">
              Giáo viên <span className="text-[#ef4444]">*</span>
            </label>
            <select
              value={modalForm.teacherName}
              onChange={(e) => handleFormChange('teacherName', e.target.value)}
              required
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            >
              <option value="">Chọn giáo viên...</option>
              {teacherNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-medium text-[#434655]">
              Phòng học <span className="text-[#ef4444]">*</span>
            </label>
            <input
              type="text"
              value={modalForm.room}
              onChange={(e) => handleFormChange('room', e.target.value)}
              placeholder="Ví dụ: P201, PTN1, SG..."
              required
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-body-md text-[#0b1c30] bg-white focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#f1f5f9]">
            {/* Delete button — chỉ hiện khi đang sửa */}
            <div>
              {editingSlot && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#fca5a5] text-[#b91c1c] text-body-sm font-medium hover:bg-[#fef2f2] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeleting ? (
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  )}
                  Xóa tiết
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-[#475569] text-body-sm font-medium hover:bg-[#f8fafc] transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSaving || isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-body-sm shadow-elevation-1 transition-all"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    {editingSlot ? 'Cập nhật' : 'Thêm tiết học'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
