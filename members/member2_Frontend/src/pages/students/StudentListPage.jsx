/**
 * StudentListPage — Danh sách học sinh toàn trường
 *
 * Features:
 *   - Chế độ xem: Card View và Photo Frame View
 *   - Bộ lọc: tìm kiếm tên/mã HS, lọc theo lớp, lọc theo trạng thái
 *   - Real-time filter qua useMemo
 *   - Modal Thêm/Sửa/Xóa học sinh (gọi API createStudent / updateStudent / deleteStudent)
 *   - Xuất Excel (.xlsx) toàn bộ danh sách (hoặc theo lớp đang lọc)
 *   - Import học sinh từ file Excel kèm tải file mẫu
 *
 * Dữ liệu: GET /api/students + GET /api/classes — không dùng mockData.
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import StatusBadge from '../../components/shared/StatusBadge.jsx';
import Modal from '../../components/shared/Modal.jsx';
import {
  fetchStudentListData,
  createStudent,
  updateStudent,
  deleteStudent,
  importStudents,
} from '../../api/stubs.js';
import {
  exportStudentsToExcel,
  downloadStudentImportTemplate,
  parseStudentImportFile,
} from '../../utils/exportEngine.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Lấy chữ cái đầu của tên để hiển thị avatar thay thế.
 * @param {string} name - Họ tên đầy đủ của học sinh
 * @returns {string} 2 chữ cái đầu (họ + đệm/cuối)
 */
function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Bảng màu avatar xoay vòng theo chỉ số index */
const AVATAR_COLORS = [
  { bg: 'bg-[#eff4ff]', text: 'text-[#2563eb]' },
  { bg: 'bg-[#f0fdf4]', text: 'text-[#15803d]' },
  { bg: 'bg-[#fff7ed]', text: 'text-[#c2410c]' },
  { bg: 'bg-[#fdf4ff]', text: 'text-[#9333ea]' },
  { bg: 'bg-[#f0f9ff]', text: 'text-[#0369a1]' },
];

/** Chọn màu avatar dựa trên vị trí trong danh sách */
function avatarColor(idx) {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

/** Các lựa chọn lọc trạng thái học sinh */
const STATUS_OPTIONS = [
  { value: 'all',      label: 'Tất cả' },
  { value: 'active',   label: 'Đang học' },
  { value: 'inactive', label: 'Nghỉ học' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Card hiển thị 1 học sinh ở chế độ danh sách, kèm nút Sửa / Xóa nhanh.
 * @param {Object} student - Dữ liệu học sinh đã chuẩn hóa
 * @param {number} idx - Vị trí (để xoay màu avatar)
 * @param {Function} onEdit - Callback mở modal sửa
 * @param {Function} onDelete - Callback mở modal xác nhận xóa
 */
function StudentCard({ student, idx, onEdit, onDelete }) {
  const { bg, text } = avatarColor(idx);
  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 p-4 flex items-start gap-3 hover:shadow-md transition-shadow group">
      {/* Avatar */}
      <div className={`flex-none w-11 h-11 rounded-full ${bg} flex items-center justify-center overflow-hidden`} aria-hidden="true">
        {student.avatar ? (
          <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
        ) : (
          <span className={`text-label-md font-semibold ${text}`}>{getInitials(student.name)}</span>
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-semibold text-[#0f172a] truncate">{student.name}</p>
        <p className="text-label-sm text-[#64748b] mt-0.5">{student.id}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {student.className && (
            <span className="inline-flex items-center gap-1 text-label-sm text-[#334155] bg-[#f8fafc] border border-[#e2e8f0] px-2 py-0.5 rounded">
              <span className="material-symbols-outlined text-[13px] text-[#64748b]" aria-hidden="true">class</span>
              {student.className}
            </span>
          )}
          <StatusBadge status={student.status} />
        </div>
        {student.gpa != null && (
          <p className="text-label-sm text-[#64748b] mt-1">
            GPA: <span className="font-semibold text-[#0f172a]">{student.gpa.toFixed(1)}</span>
            {student.academicRank && (
              <span className="ml-1.5 text-[#64748b]">· {student.academicRank}</span>
            )}
            {student.conductRank && (
              <span className="ml-1.5 font-medium text-[#15803d]">· HK: {student.conductRank}</span>
            )}
          </p>
        )}
      </div>
      {/* Nút thao tác Sửa / Xóa — hiện khi hover card */}
      <div className="flex-none flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onEdit(student)}
          className="p-1.5 rounded-md text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff4ff] transition-colors"
          aria-label={`Sửa học sinh ${student.name}`}
          title="Sửa"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(student)}
          className="p-1.5 rounded-md text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
          aria-label={`Xóa học sinh ${student.name}`}
          title="Xóa"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Card khung ảnh thẻ ở chế độ Photo Frame View.
 * Click vào khung sẽ mở modal sửa học sinh.
 */
function PhotoFrameCard({ student, idx, onEdit, onDelete }) {
  const { bg, text } = avatarColor(idx);
  const nameParts = student.name.trim().split(/\s+/);
  const shortName = nameParts.length > 1
    ? `${nameParts[nameParts.length - 2]} ${nameParts[nameParts.length - 1]}`
    : student.name;

  return (
    <div className="flex flex-col items-center gap-1 p-2 relative group">
      <div
        className={`w-full aspect-[3/4] rounded border-2 border-[#cbd5e1] ${bg} flex items-center justify-center relative overflow-hidden`}
        style={{ maxWidth: '90px' }}
        aria-hidden="true"
      >
        {student.avatar ? (
          <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
        ) : (
          <span className={`text-headline-md font-bold ${text}`}>{getInitials(student.name)}</span>
        )}
        <span className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
          student.status === 'active' ? 'bg-[#22c55e]' : 'bg-[#ef4444]'
        }`} />
        {/* Overlay nút thao tác khi hover */}
        <div className="absolute inset-0 bg-[#0f172a]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button type="button" onClick={() => onEdit(student)}
            className="p-1.5 bg-white/90 rounded-md text-[#2563eb] hover:bg-white"
            aria-label={`Sửa ${student.name}`} title="Sửa">
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button type="button" onClick={() => onDelete(student)}
            className="p-1.5 bg-white/90 rounded-md text-[#dc2626] hover:bg-white"
            aria-label={`Xóa ${student.name}`} title="Xóa">
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>
      <p className="text-label-sm font-medium text-[#0f172a] text-center leading-tight truncate w-full"
        title={student.name} style={{ maxWidth: '90px' }}>
        {shortName}
      </p>
      {student.className && (
        <p className="text-[10px] text-[#94a3b8] leading-none">{student.className}</p>
      )}
    </div>
  );
}

/** Skeleton cho card view khi đang tải dữ liệu */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 p-4 flex items-start gap-3">
      <div className="animate-pulse flex-none w-11 h-11 rounded-full bg-[#e2e8f0]" />
      <div className="flex-1 space-y-2">
        <div className="animate-pulse h-4 bg-[#e2e8f0] rounded w-3/4" />
        <div className="animate-pulse h-3 bg-[#e2e8f0] rounded w-1/2" />
        <div className="animate-pulse h-3 bg-[#e2e8f0] rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}

/**
 * Modal biểu mẫu Thêm/Sửa học sinh.
 * Dùng chung cho 2 chế độ: mode="create" (thêm mới) hoặc mode="edit" (sửa).
 *
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {'create'|'edit'} mode - Chế độ thêm hay sửa
 * @param {Object|null} student - Dữ liệu học sinh đang sửa (null nếu thêm mới)
 * @param {Array<{id,name}>} classes - Danh sách lớp để chọn trong dropdown
 * @param {Function} onClose - Đóng modal không lưu
 * @param {Function} onSubmit - Gọi lại với payload form khi người dùng bấm lưu
 */
function StudentFormModal({ isOpen, mode, student, classes, onClose, onSubmit }) {
  // Trạng thái form: khởi tạo từ student (edit) hoặc rỗng (create)
  const [form, setForm] = useState({
    studentCode: '',
    fullName: '',
    gender: 'Nam',
    dob: '',
    className: '',
    parentName: '',
    parentPhone: '',
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Khi mở modal hoặc đổi student → reset form theo dữ liệu đang sửa
  useEffect(() => {
    if (!isOpen) return;
    setFormError(null);
    if (mode === 'edit' && student) {
      setForm({
        studentCode: student.id || '',
        fullName: student.name || '',
        gender: student.gender || 'Nam',
        dob: student.dob || '',
        className: student.className || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        status: student.status || 'active',
      });
    } else {
      setForm({
        studentCode: '',
        fullName: '',
        gender: 'Nam',
        dob: '',
        className: classes[0]?.name || '',
        parentName: '',
        parentPhone: '',
        status: 'active',
      });
    }
  }, [isOpen, mode, student, classes]);

  /**
   * Cập nhật 1 trường trong form theo name attribute của input.
   * @param {Event} e - Sự kiện onChange của input/select
   */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  /**
   * Xác thực dữ liệu phía client trước khi gửi lên API.
   * @returns {string|null} Thông báo lỗi (null nếu hợp lệ)
   */
  function validate() {
    if (!form.studentCode.trim()) return 'Vui lòng nhập mã học sinh.';
    if (!form.fullName.trim()) return 'Vui lòng nhập họ tên học sinh.';
    if (!form.className) return 'Vui lòng chọn lớp.';
    if (form.parentPhone && !/^[0-9+\s-]{8,15}$/.test(form.parentPhone.trim()))
      return 'Số điện thoại phụ huynh không hợp lệ (8–15 chữ số).';
    if (form.dob && !/^\d{4}-\d{2}-\d{2}$/.test(form.dob))
      return 'Ngày sinh phải đúng định dạng YYYY-MM-DD.';
    return null;
  }

  /**
   * Xử lý submit form: validate → gọi onSubmit → chờ kết quả → đóng modal.
   * @param {Event} e - Sự kiện submit form
   */
  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); return; }

    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmit({
        studentCode: form.studentCode.trim(),
        fullName: form.fullName.trim(),
        gender: form.gender,
        dob: form.dob,
        className: form.className,
        parentName: form.parentName.trim(),
        parentPhone: form.parentPhone.trim(),
        status: form.status,
      });
      onClose();
    } catch (apiErr) {
      setFormError(apiErr.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  // Các input dùng chung class Tailwind để giữ nhất quán giao diện
  const inputCls = 'w-full px-3 py-2 text-body-sm text-[#0f172a] border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition';

  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title={mode === 'edit' ? 'Sửa thông tin học sinh' : 'Thêm học sinh mới'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Hiển thị lỗi validate / lỗi API */}
        {formError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-body-sm" role="alert">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mã học sinh: khóa khi sửa để tránh đổi khóa chính */}
          <div>
            <label htmlFor="studentCode" className="block text-label-sm font-medium text-[#334155] mb-1">
              Mã học sinh <span className="text-[#dc2626]">*</span>
            </label>
            <input
              id="studentCode" name="studentCode" type="text" required
              value={form.studentCode}
              onChange={handleChange}
              disabled={mode === 'edit'}
              placeholder="VD: HS0101"
              className={`${inputCls} disabled:opacity-60 disabled:cursor-not-allowed`}
            />
          </div>

          {/* Họ và tên */}
          <div>
            <label htmlFor="fullName" className="block text-label-sm font-medium text-[#334155] mb-1">
              Họ và tên <span className="text-[#dc2626]">*</span>
            </label>
            <input
              id="fullName" name="fullName" type="text" required
              value={form.fullName} onChange={handleChange}
              placeholder="VD: Nguyễn Văn An"
              className={inputCls}
            />
          </div>

          {/* Giới tính */}
          <div>
            <label htmlFor="gender" className="block text-label-sm font-medium text-[#334155] mb-1">Giới tính</label>
            <select id="gender" name="gender" value={form.gender} onChange={handleChange} className={inputCls}>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* Ngày sinh */}
          <div>
            <label htmlFor="dob" className="block text-label-sm font-medium text-[#334155] mb-1">Ngày sinh</label>
            <input
              id="dob" name="dob" type="date"
              value={form.dob} onChange={handleChange}
              className={inputCls}
            />
          </div>

          {/* Lớp */}
          <div>
            <label htmlFor="className" className="block text-label-sm font-medium text-[#334155] mb-1">
              Lớp <span className="text-[#dc2626]">*</span>
            </label>
            <select id="className" name="className" value={form.className} onChange={handleChange}
              required className={inputCls}>
              <option value="">-- Chọn lớp --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Trạng thái */}
          <div>
            <label htmlFor="status" className="block text-label-sm font-medium text-[#334155] mb-1">Trạng thái</label>
            <select id="status" name="status" value={form.status} onChange={handleChange} className={inputCls}>
              <option value="active">Đang học</option>
              <option value="inactive">Nghỉ học</option>
            </select>
          </div>

          {/* Họ tên phụ huynh */}
          <div>
            <label htmlFor="parentName" className="block text-label-sm font-medium text-[#334155] mb-1">
              Họ tên phụ huynh
            </label>
            <input
              id="parentName" name="parentName" type="text"
              value={form.parentName} onChange={handleChange}
              placeholder="VD: Nguyễn Văn Bình"
              className={inputCls}
            />
          </div>

          {/* SĐT phụ huynh */}
          <div>
            <label htmlFor="parentPhone" className="block text-label-sm font-medium text-[#334155] mb-1">
              SĐT phụ huynh
            </label>
            <input
              id="parentPhone" name="parentPhone" type="tel"
              value={form.parentPhone} onChange={handleChange}
              placeholder="VD: 0912345678"
              className={inputCls}
            />
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg text-body-sm font-medium text-[#475569] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors">
            Hủy
          </button>
          <button type="submit" disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-body-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting && (
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full" aria-hidden="true" />
            )}
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              {mode === 'edit' ? 'save' : 'person_add'}
            </span>
            {submitting ? 'Đang lưu...' : mode === 'edit' ? 'Lưu thay đổi' : 'Thêm học sinh'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Modal xác nhận xóa học sinh.
 * @param {boolean} isOpen - Trạng thái mở/đóng
 * @param {Object|null} student - Học sinh chuẩn bị xóa
 * @param {Function} onClose - Đóng modal không xóa
 * @param {Function} onConfirm - Gọi khi người dùng xác nhận xóa
 */
function DeleteConfirmModal({ isOpen, student, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Reset trạng thái mỗi lần mở lại modal
  useEffect(() => {
    if (isOpen) { setDeleting(false); setDeleteError(null); }
  }, [isOpen]);

  /**
   * Xử lý bấm nút xác nhận xóa: gọi API xóa, báo lỗi nếu thất bại.
   */
  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setDeleteError(err.message || 'Xóa học sinh thất bại. Vui lòng thử lại.');
      setDeleting(false);
    }
  }

  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={deleting ? () => {} : onClose} title="Xác nhận xóa học sinh" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex-none w-10 h-10 rounded-full bg-[#fef2f2] border border-[#fecaca] flex items-center justify-center" aria-hidden="true">
            <span className="material-symbols-outlined text-[22px] text-[#b91c1c]">warning</span>
          </span>
          <div className="text-body-sm text-[#334155]">
            <p>
              Bạn có chắc chắn muốn xóa học sinh{' '}
              <span className="font-semibold text-[#0f172a]">{student.name}</span>{' '}
              (mã <span className="font-mono font-semibold">{student.id}</span>)?
            </p>
            <p className="text-label-sm text-[#64748b] mt-1">
              Hành động này không thể hoàn tác. Dữ liệu điểm danh, điểm số liên quan có thể chặn xóa.
            </p>
          </div>
        </div>

        {deleteError && (
          <div className="p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-body-sm" role="alert">
            {deleteError}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={deleting}
            className="px-4 py-2 rounded-lg text-body-sm font-medium text-[#475569] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors disabled:opacity-60">
            Hủy
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-body-sm font-semibold text-white bg-[#dc2626] hover:bg-[#b91c1c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {deleting && (
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full" aria-hidden="true" />
            )}
            {deleting ? 'Đang xóa...' : 'Xóa học sinh'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Modal Import học sinh từ file Excel.
 * Luồng: chọn file → parse (frontend) → xem trước các dòng hợp lệ/lỗi → gửi API import.
 * @param {boolean} isOpen - Trạng thái mở/đóng
 * @param {Array<{id,name}>} classes - Danh sách lớp hợp lệ (để kiểm tra tên lớp trong file)
 * @param {Function} onClose - Đóng modal
 * @param {Function} onImported - Gọi lại sau khi import thành công (để reload danh sách)
 */
function ImportModal({ isOpen, classes, onClose, onImported }) {
  const fileInputRef = useRef(null);       // Tham chiếu input file ẩn
  const [rows, setRows] = useState([]);    // Dữ liệu parse được từ file
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null); // { inserted, skipped }
  const [importError, setImportError] = useState(null);

  // Reset toàn bộ trạng thái khi mở modal
  useEffect(() => {
    if (isOpen) {
      setRows([]); setFileName(''); setParsing(false);
      setImporting(false); setImportResult(null); setImportError(null);
    }
  }, [isOpen]);

  /**
   * Xử lý khi người dùng chọn file: đọc, parse và đánh dấu dòng lỗi.
   * @param {Event} e - Sự kiện change của input file
   */
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setImportError(null);
    setImportResult(null);
    setFileName(file.name);
    try {
      const parsed = await parseStudentImportFile(file);

      // Kiểm tra thêm: mã HS trùng trong file, lớp không tồn tại
      const seen = new Set();
      const validClassNames = new Set(classes.map((c) => c.name));
      const checked = parsed.map((r) => {
        const errors = [];
        if (r._error) errors.push(r._error);
        if (seen.has(r.studentCode)) errors.push('Mã học sinh bị trùng trong file');
        seen.add(r.studentCode);
        if (r.className && !validClassNames.has(r.className))
          errors.push(`Lớp "${r.className}" không tồn tại trong hệ thống`);
        return { ...r, _errors: errors };
      });

      setRows(checked);
    } catch (err) {
      setImportError(err.message || 'Không thể đọc file Excel.');
      setRows([]);
    } finally {
      setParsing(false);
      // Reset giá trị input để chọn lại cùng 1 file vẫn kích hoạt change
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // Tách danh sách dòng hợp lệ (không có lỗi) để gửi lên backend
  const validRows = rows.filter((r) => r._errors.length === 0);
  const invalidRows = rows.filter((r) => r._errors.length > 0);

  /**
   * Gửi danh sách dòng hợp lệ lên API importStudents.
   */
  async function handleImport() {
    if (validRows.length === 0) return;
    setImporting(true);
    setImportError(null);
    try {
      // Loại bỏ các trường nội bộ (_row, _errors) trước khi gửi
      const payload = validRows.map(({ _row, _errors, ...rest }) => ({
        ...rest,
        status: rest.status === 'NghiHoc' ? 'inactive' : 'active',
      }));
      const result = await importStudents(payload);
      setImportResult(result);
      setRows([]); setFileName('');
      // Thông báo cho trang cha reload danh sách
      if (onImported) onImported(result);
    } catch (err) {
      setImportError(err.message || 'Import học sinh thất bại. Vui lòng thử lại.');
    } finally {
      setImporting(false);
    }
  }

  const inputCls = 'w-full px-3 py-2 text-body-sm text-[#0f172a] border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition';

  return (
    <Modal isOpen={isOpen} onClose={importing ? () => {} : onClose} title="Import học sinh từ Excel" size="lg">
      <div className="space-y-4">
        {/* Bước 1: Tải file mẫu */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-[#eff4ff] border border-[#bfdbfe]">
          <span className="material-symbols-outlined text-[22px] text-[#2563eb] mt-0.5" aria-hidden="true">info</span>
          <div className="flex-1">
            <p className="text-body-sm text-[#1e40af]">
              Chưa có file mẫu? Tải file Excel mẫu để điền dữ liệu theo đúng định dạng.
            </p>
            <button
              type="button"
              onClick={() => downloadStudentImportTemplate()}
              className="mt-2 inline-flex items-center gap-1.5 text-label-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8] underline underline-offset-2"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">download</span>
              Tải file mẫu (Mau_Import_HocSinh.xlsx)
            </button>
          </div>
        </div>

        {/* Bước 2: Chọn file */}
        <div>
          <label htmlFor="importFile" className="block text-label-sm font-medium text-[#334155] mb-1">
            Chọn file Excel (.xlsx, .xls)
          </label>
          <input
            id="importFile" ref={fileInputRef}
            type="file" accept=".xlsx,.xls"
            onChange={handleFileChange} disabled={parsing || importing}
            className={`${inputCls} file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-label-sm file:font-semibold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8] cursor-pointer`}
          />
          {fileName && (
            <p className="text-label-sm text-[#64748b] mt-1">
              Đang xử lý: <span className="font-medium text-[#0f172a]">{fileName}</span>
            </p>
          )}
        </div>

        {/* Lỗi parse hoặc lỗi API */}
        {importError && (
          <div className="p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-body-sm" role="alert">
            {importError}
          </div>
        )}

        {/* Trạng thái đang parse */}
        {parsing && (
          <div className="flex items-center gap-2 text-body-sm text-[#64748b]">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-[#cbd5e1] border-t-[#2563eb] rounded-full" aria-hidden="true" />
            Đang đọc và phân tích file...
          </div>
        )}

        {/* Bước 3: Xem trước dữ liệu */}
        {rows.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-body-sm font-semibold text-[#0f172a]">
                Xem trước dữ liệu
                <span className="ml-2 text-label-sm font-normal text-[#15803d]">{validRows.length} dòng hợp lệ</span>
                {invalidRows.length > 0 && (
                  <span className="ml-1.5 text-label-sm font-normal text-[#b91c1c]">· {invalidRows.length} dòng lỗi</span>
                )}
              </p>
            </div>
            {/* Bảng preview cuộn ngang, giới hạn chiều cao */}
            <div className="overflow-auto max-h-64 border border-[#e2e8f0] rounded-lg">
              <table className="min-w-full text-label-sm">
                <thead className="bg-[#f8fafc] sticky top-0">
                  <tr className="text-left text-[#475569]">
                    <th className="px-3 py-2 font-semibold">Mã HS</th>
                    <th className="px-3 py-2 font-semibold">Họ tên</th>
                    <th className="px-3 py-2 font-semibold">Lớp</th>
                    <th className="px-3 py-2 font-semibold">Giới tính</th>
                    <th className="px-3 py-2 font-semibold">Trạng thái</th>
                    <th className="px-3 py-2 font-semibold">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {rows.map((r, i) => (
                    <tr key={`${r.studentCode}-${i}`} className={r._errors.length > 0 ? 'bg-[#fef2f2]' : ''}>
                      <td className="px-3 py-1.5 font-mono">{r.studentCode || '—'}</td>
                      <td className="px-3 py-1.5">{r.fullName || '—'}</td>
                      <td className="px-3 py-1.5">{r.className || '—'}</td>
                      <td className="px-3 py-1.5">{r.gender || '—'}</td>
                      <td className="px-3 py-1.5">{r.status}</td>
                      <td className="px-3 py-1.5 text-[#b91c1c]">
                        {r._errors.length > 0 ? r._errors.join('; ') : '✓'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Kết quả import thành công */}
        {importResult && (
          <div className="p-4 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d]" role="status">
            <p className="text-body-sm font-semibold">Import thành công!</p>
            <p className="text-label-sm mt-1">
              Đã thêm {importResult.inserted ?? validRows.length} học sinh vào hệ thống.
              {Array.isArray(importResult.skipped) && importResult.skipped.length > 0 && (
                <> Bỏ qua {importResult.skipped.length} dòng (trùng mã hoặc lỗi dữ liệu).</>
              )}
            </p>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
          <button type="button" onClick={onClose} disabled={importing}
            className="px-4 py-2 rounded-lg text-body-sm font-medium text-[#475569] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors disabled:opacity-60">
            Đóng
          </button>
          <button type="button" onClick={handleImport}
            disabled={importing || validRows.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-body-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {importing ? (
              <>
                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full" aria-hidden="true" />
                Đang import...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">upload</span>
                Import {validRows.length > 0 ? `${validRows.length} học sinh` : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentListPage() {
  const [viewMode,       setViewMode]       = useState('card');
  const [searchTerm,     setSearchTerm]     = useState('');
  const [selectedClass,  setSelectedClass]  = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Data from API
  const [students,  setStudents]  = useState([]);
  const [classes,   setClasses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  // restrictedClassName: không null khi role GVCN → khoá dropdown lớp
  const [restrictedClassName, setRestrictedClassName] = useState(null);

  // ── Trạng thái các modal ──────────────────────────────────────────────────
  const [formModal, setFormModal] = useState({ open: false, mode: 'create', student: null });
  const [deleteTarget, setDeleteTarget] = useState(null); // học sinh chuẩn bị xóa
  const [importOpen,   setImportOpen]   = useState(false);
  // toast: thông báo ngắn hiển thị sau thao tác thành công
  const [toast, setToast] = useState(null);

  /**
   * Hiển thị thông báo toast tự ẩn sau 3 giây.
   * @param {string} message - Nội dung thông báo
   * @param {'success'|'error'} [type='success'] - Loại toast
   */
  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchStudentListData();
        if (!cancelled) {
          setStudents(data.students);
          setClasses(data.classes);
          // Nếu backend trả về học sinh của duy nhất 1 lớp (GVCN role),
          // khóa dropdown và pre-select lớp đó
          if (data.restrictedClassName) {
            setSelectedClass(data.restrictedClassName);
            setRestrictedClassName(data.restrictedClassName);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải danh sách học sinh.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return students.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q)) return false;
      if (selectedClass  !== 'all' && s.className !== selectedClass)  return false;
      if (selectedStatus !== 'all' && s.status    !== selectedStatus) return false;
      return true;
    });
  }, [students, searchTerm, selectedClass, selectedStatus]);

  const totalLabel = loading
    ? 'Đang tải...'
    : filtered.length === students.length
      ? `${students.length} học sinh`
      : `${filtered.length} / ${students.length} học sinh`;

  /**
   * Tải lại toàn bộ dữ liệu (dùng sau khi thêm/sửa/xóa/import).
   * @returns {Promise<void>}
   */
  async function reload() {
    try {
      const d = await fetchStudentListData();
      setStudents(d.students);
      setClasses(d.classes);
    } catch (e) {
      setError(e.message);
    }
  }

  /** Thử tải lại dữ liệu khi có lỗi mạng */
  function retry() {
    setError(null);
    setLoading(true);
    fetchStudentListData()
      .then((d) => { setStudents(d.students); setClasses(d.classes); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  /**
   * Xử lý submit form Thêm/Sửa: gọi API tương ứng mode rồi reload + toast.
   * @param {Object} payload - Dữ liệu form đã validate
   */
  async function handleFormSubmit(payload) {
    if (formModal.mode === 'edit') {
      await updateStudent(formModal.student.id, payload);
      await reload();
      showToast(`Đã cập nhật học sinh ${payload.fullName}`);
    } else {
      await createStudent(payload);
      await reload();
      showToast(`Đã thêm học sinh ${payload.fullName}`);
    }
  }

  /**
   * Xử lý xác nhận xóa: gọi API xóa rồi reload + toast.
   */
  async function handleDeleteConfirm() {
    await deleteStudent(deleteTarget.id);
    const name = deleteTarget.name;
    setDeleteTarget(null);
    await reload();
    showToast(`Đã xóa học sinh ${name}`);
  }

  /**
   * Xuất danh sách học sinh (theo bộ lọc hiện tại) ra file Excel.
   */
  function handleExportExcel() {
    exportStudentsToExcel(filtered, { className: selectedClass });
  }

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-headline-md font-semibold text-[#0f172a]">Danh sách học sinh</h1>
          <p className="text-body-sm text-[#64748b] mt-0.5">
            Quản lý hồ sơ và thông tin học sinh toàn trường
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Action buttons: Thêm / Import / Xuất Excel */}
          <button
            type="button"
            onClick={() => setFormModal({ open: true, mode: 'create', student: null })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-label-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">person_add</span>
            Thêm học sinh
          </button>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-label-sm font-semibold text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] hover:bg-[#dcfce7] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">upload</span>
            Import Excel
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={loading || filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-label-sm font-semibold text-[#0369a1] bg-[#f0f9ff] border border-[#bae6fd] hover:bg-[#e0f2fe] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">download</span>
            Xuất Excel
          </button>

          {/* View mode toggle */}
          <div className="flex items-center bg-[#f1f5f9] rounded-lg p-0.5 gap-0.5" role="group" aria-label="Chế độ xem">
            <button type="button" onClick={() => setViewMode('card')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-label-sm font-medium transition-colors ${
                viewMode === 'card' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-[#64748b] hover:text-[#334155]'
              }`}
              aria-pressed={viewMode === 'card'}>
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">view_list</span>
              Danh sách
            </button>
            <button type="button" onClick={() => setViewMode('photo')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-label-sm font-medium transition-colors ${
                viewMode === 'photo' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-[#64748b] hover:text-[#334155]'
              }`}
              aria-pressed={viewMode === 'photo'}>
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">grid_view</span>
              Ảnh thẻ
            </button>
          </div>
        </div>
      </div>

      {/* ── Toast thông báo ── */}
      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-lg border text-body-sm ${
          toast.type === 'error'
            ? 'bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]'
            : 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]'
        }`} role="status">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.message}
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]" role="alert">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <p className="text-body-sm font-medium flex-1">{error}</p>
          <button className="text-label-sm underline hover:no-underline" onClick={retry}>Thử lại</button>
        </div>
      )}

      {/* ── Filter toolbar ── */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#94a3b8]" aria-hidden="true">
              search
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm tên hoặc mã học sinh..."
              className="w-full pl-9 pr-8 py-2 text-body-sm text-[#0f172a] placeholder-[#94a3b8] border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition"
              aria-label="Tìm kiếm học sinh"
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] transition-colors"
                aria-label="Xóa tìm kiếm">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Class dropdown */}
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={loading || !!restrictedClassName}
              className="appearance-none pl-3 pr-8 py-2 text-body-sm text-[#334155] border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Lọc theo lớp"
            >
              <option value="all">Tất cả lớp</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-[#94a3b8]" aria-hidden="true">
              expand_more
            </span>
          </div>
          {/* Nhãn khóa lớp khi GVCN */}
          {restrictedClassName && (
            <span className="inline-flex items-center gap-1 text-label-sm text-[#7c3aed] bg-[#f5f3ff] border border-[#ddd6fe] px-2.5 py-1 rounded-lg">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Chỉ xem lớp {restrictedClassName}
            </span>
          )}

          {/* Status chips */}
          <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Lọc theo trạng thái">
            {STATUS_OPTIONS.map((opt) => (
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
          <span className="ml-auto text-label-sm text-[#94a3b8] whitespace-nowrap">{totalLabel}</span>
        </div>
      </div>

      {/* ── Content area ── */}
      {loading ? (
        /* Skeleton grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-[#94a3b8]">
          <span className="material-symbols-outlined text-[48px] mb-3" aria-hidden="true">person_search</span>
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
            <StudentCard
              key={student.id}
              student={student}
              idx={idx}
              onEdit={(s) => setFormModal({ open: true, mode: 'edit', student: s })}
              onDelete={(s) => setDeleteTarget(s)}
            />
          ))}
        </div>
      ) : (
        /* Photo Frame View */
        <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-elevation-1 p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 justify-items-center">
            {filtered.map((student, idx) => (
              <PhotoFrameCard
                key={student.id}
                student={student}
                idx={idx}
                onEdit={(s) => setFormModal({ open: true, mode: 'edit', student: s })}
                onDelete={(s) => setDeleteTarget(s)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Modal Thêm/Sửa học sinh ── */}
      <StudentFormModal
        isOpen={formModal.open}
        mode={formModal.mode}
        student={formModal.student}
        classes={classes}
        onClose={() => setFormModal({ open: false, mode: 'create', student: null })}
        onSubmit={handleFormSubmit}
      />

      {/* ── Modal xác nhận xóa ── */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        student={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* ── Modal Import từ Excel ── */}
      <ImportModal
        isOpen={importOpen}
        classes={classes}
        onClose={() => setImportOpen(false)}
        onImported={async () => { await reload(); showToast('Import học sinh thành công'); }}
      />
    </div>
  );
}
