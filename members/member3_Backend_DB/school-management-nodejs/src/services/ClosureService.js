import { ClosureRepository } from '../repositories/ClosureRepository.js';
import { NotificationService } from './NotificationService.js';

/**
 * ClosureService — Business logic cho chốt sổ điểm.
 * Không chứa SQL.
 */
export class ClosureService {
  /**
   * GVCN nộp/chốt sổ điểm:
   * 1. Upsert bản ghi submitted trong grade_book_closures.
   * 2. Gửi notification cho BGH.
   */
  static async submitClosure({ classId, className, gvcnName, gvcnUsername, semester, schoolYear }) {
    const closure = await ClosureRepository.upsert({ classId, className, gvcnName, semester, schoolYear });

    await NotificationService.notify({
      title:           `GVCN ${gvcnName} đã nộp sổ điểm lớp ${className}`,
      type:            'closure_submitted',
      senderId:        gvcnUsername,
      senderRole:      'GVCN',
      recipients:      ['BGH'],
      relatedClass:    classId,
      relatedSemester: semester,
    });

    return {
      id:          closure.id,
      classId:     closure.class_id,
      className:   closure.class_name,
      gvcnName:    closure.gvcn_name,
      semester:    closure.semester,
      schoolYear:  closure.school_year,
      status:      closure.status,
      submittedAt: closure.submitted_at,
    };
  }

  /**
   * GVCN gửi đơn xin mở khóa sổ điểm kèm lý do.
   * Gửi notification type 'unlock_request' cho BGH.
   */
  static async requestUnlock({ classId, className, gvcnName, gvcnUsername, semester, schoolYear, reason }) {
    await NotificationService.notify({
      title:           `Xin mở khóa sổ điểm lớp ${className}`,
      content:         reason,
      type:            'unlock_request',
      senderId:        gvcnUsername,
      senderRole:      'GVCN',
      recipients:      ['BGH'],
      relatedClass:    classId,
      relatedSemester: semester,
    });

    return { success: true };
  }

  /**
   * Lấy trạng thái chốt sổ hiện tại của một lớp.
   */
  static async getStatus({ classId, semester, schoolYear }) {
    const closure = await ClosureRepository.findByKey(classId, semester, schoolYear);
    if (!closure) return null;
    return {
      id:          closure.id,
      classId:     closure.class_id,
      className:   closure.class_name,
      gvcnName:    closure.gvcn_name,
      semester:    closure.semester,
      schoolYear:  closure.school_year,
      status:      closure.status,
      submittedAt: closure.submitted_at,
      approvedAt:  closure.approved_at,
    };
  }
}
