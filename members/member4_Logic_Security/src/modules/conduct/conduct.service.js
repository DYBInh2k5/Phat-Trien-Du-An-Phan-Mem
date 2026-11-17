import { Errors } from '../../common/errors/app-error.js';
import { canAccessStudent } from '../../common/auth/access-policy.js';
import { suggestConduct, summarizeAttendance } from '../academic/domain/index.js';

export function createConductService({ studentsRepository }) {
  return {
    /** Chưa có bảng lưu hạnh kiểm (schema giữ nguyên) => chỉ GỢI Ý từ điểm danh, GVCN quyết định chính thức. */
    async getSuggestion(actor, studentId, { from, to }) {
      if (from && to && from > to) {
        throw Errors.validation([
          { in: 'query', field: 'from', message: 'from không được lớn hơn to' },
        ]);
      }
      const student = await studentsRepository.findById(studentId);
      if (!student) {
        throw Errors.notFound('Học sinh');
      }
      if (!canAccessStudent(actor, student)) {
        throw Errors.forbidden('Bạn không có quyền xem dữ liệu của học sinh này');
      }
      const absenceStats = summarizeAttendance(
        await studentsRepository.countAttendanceByStatus(studentId, { from, to }),
      );
      return {
        studentId,
        from: from ?? null,
        to: to ?? null,
        absenceStats,
        suggestedConduct: suggestConduct(absenceStats),
        note: 'Chỉ là gợi ý từ dữ liệu chuyên cần. Hạnh kiểm chính thức do giáo viên chủ nhiệm quyết định.',
      };
    },
  };
}
