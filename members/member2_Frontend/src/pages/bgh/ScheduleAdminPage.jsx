/**
 * ScheduleAdminPage — Xếp thời khóa biểu Admin (BGH)
 *
 * Chức năng:
 *   - Timetable grid có thể click vào từng cell
 *   - Click ô trống → Modal form trống để thêm slot
 *   - Click ô có slot → Modal pre-populated để sửa
 *   - Conflict detection: cùng teacherName hoặc room + dayOfWeek + period → highlight đỏ
 *   - Submit → handleSaveScheduleSlot stub → optimistic update state
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { useState, useMemo, useCallback } from 'react';
import Modal from '../../components/shared/Modal.jsx';
import {
  timetableSlots,
  subjects,
  teachers,
  classes,
} from '../../data/mockData.js';
import { handleSaveScheduleSlot } from '../../api/stubs.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_LABELS = {
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
};

const DAYS = [1, 2, 3, 4, 5];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const PERIOD_LABELS = {
  1:  'Tiết 1',
  2:  'Tiết 2',
  3:  'Tiết 3',
  4:  'Tiết 4',
  5:  'Tiết 5',
  6:  'Tiết 6',
  7:  'Tiết 7',
  8:  'Tiết 8',
  9:  'Tiết 9',
  10: 'Tiết 10',
};
const WEEK_START = '2024-11-11';
const EMPTY_FORM = { subjectName: '', teacherName: '', room: '' };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScheduleAdminPage() {
  const [timetableData, setTimetableData] = useState(() => [...timetableSlots]);
  const [selectedClass, setSelectedClass] = useState('10A1');
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [editingSlot,   setEditingSlot]   = useState(null); // null | slot object
  const [clickedCell,   setClickedCell]   = useState(null); // null | {classId, dayOfWeek, period}
  const [modalForm,     setModalForm]     = useState(EMPTY_FORM);
  const [isSaving,      setIsSaving]      = useState(false);

  // Slots for selected class
  const classSlots = useMemo(
    () => timetableData.filter(
      (s) => s.classId === selectedClass && s.weekStart === WEEK_START,
    ),
    [timetableData, selectedClass],
  );

  // Build a lookup map: `${dayOfWeek}-${period}` → slot
  const slotMap = useMemo(() => {
    const map = {};
    for (const s of classSlots) {
      map[`${s.dayOfWeek}-${s.period}`] = s;
    }
    return map;
  }, [classSlots]);

  // Conflict detection: same teacher or same room, same day+period (across ALL classes)
  const conflictKeys = useMemo(() => {
    const keys = new Set();
    for (const slot of timetableData.filter((s) => s.weekStart === WEEK_START && s.classId === selectedClass)) {
      const sameDay = timetableData.filter(
        (s) =>
          s.weekStart === WEEK_START &&
          s.dayOfWeek === slot.dayOfWeek &&
          s.period    === slot.period &&
          s.classId   !== slot.classId,
      );
      const hasConflict = sameDay.some(
        (s) =>
          (s.teacherName && s.teacherName === slot.teacherName) ||
          (s.room && s.room === slot.room),
      );
      if (hasConflict) {
        keys.add(`${slot.dayOfWeek}-${slot.period}`);
      }
    }
    return keys;
  }, [timetableData, selectedClass]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openModal = useCallback((day, period) => {
    const key = `${day}-${period}`;
    const existing = slotMap[key];
    setClickedCell({ classId: selectedClass, dayOfWeek: day, period });
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
  }, []);

  const handleFormChange = (field, value) => {
    setModalForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clickedCell || !modalForm.subjectName || !modalForm.teacherName || !modalForm.room) return;

    setIsSaving(true);
    const newSlot = {
      classId:     clickedCell.classId,
      weekStart:   WEEK_START,
      dayOfWeek:   clickedCell.dayOfWeek,
      period:      clickedCell.period,
      subjectName: modalForm.subjectName,
      teacherName: modalForm.teacherName,
      room:        modalForm.room,
      timeRange:   '',
    };

    try {
      await handleSaveScheduleSlot(newSlot);
      // Optimistic update
      setTimetableData((prev) => {
        const filtered = prev.filter(
          (s) =>
            !(
              s.classId   === clickedCell.classId &&
              s.weekStart === WEEK_START &&
              s.dayOfWeek === clickedCell.dayOfWeek &&
              s.period    === clickedCell.period
            ),
        );
        return [...filtered, newSlot];
      });
      closeModal();
    } catch {
      // keep modal open on error
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  // Only show periods that have at least one slot in the selected class (+ adjacent)
  // Show all 10 for admin view so empty cells are visible for adding
  const visiblePeriods = PERIODS;

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
        <span className="flex items-center gap-1.5 text-label-sm text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1.5 rounded-lg">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">calendar_today</span>
          Tuần 11–15/11/2024
        </span>
      </div>

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
                <th
                  key={day}
                  className="px-3 py-3 text-center text-label-sm text-[#475569] font-medium uppercase tracking-wider min-w-[140px]"
                >
                  {DAY_LABELS[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiblePeriods.map((period) => (
              <tr key={period} className="border-b border-[#f1f5f9]">
                {/* Period label */}
                <td className="sticky left-0 z-10 bg-white px-4 py-2.5 border-r border-[#e2e8f0]">
                  <div className="flex flex-col">
                    <span className="text-label-sm font-semibold text-[#475569]">{PERIOD_LABELS[period]}</span>
                  </div>
                </td>
                {/* Day cells */}
                {DAYS.map((day) => {
                  const key = `${day}-${period}`;
                  const slot = slotMap[key];
                  const hasConflict = conflictKeys.has(key);

                  if (slot) {
                    // Occupied cell
                    return (
                      <td key={day} className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => openModal(day, period)}
                          className={`w-full text-left rounded-lg p-2.5 border transition-all group ${
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
                              <span
                                className="material-symbols-outlined text-[14px] text-[#ef4444] flex-none"
                                aria-label="Xung đột"
                              >
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

                  // Empty cell
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
              {teachers.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
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
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#f1f5f9]">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-[#475569] text-body-sm font-medium hover:bg-[#f8fafc] transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
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
        </form>
      </Modal>
    </div>
  );
}
