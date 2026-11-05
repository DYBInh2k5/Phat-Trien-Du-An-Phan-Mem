import { CommunicationRepository } from '../repositories/CommunicationRepository.js';
import { StudentRepository } from '../repositories/StudentRepository.js';
import { ClassRepository } from '../repositories/ClassRepository.js';
import { ParentStudentRepository } from '../repositories/ParentStudentRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';

export class ForbiddenError extends Error {
  constructor(message = 'Bạn không có quyền thực hiện thao tác này.') {
    super(message);
    this.name = 'ForbiddenError';
    this.status = 403;
  }
}

/**
 * CommunicationService — Business logic cho Sổ liên lạc phụ huynh.
 * Kiểm tra phân quyền RBAC đa vai trò (PH, GVCN, BGH) và ngăn chặn truy cập trái phép.
 */
export class CommunicationService {

  /** Normalize notification DB row → DTO */
  static notifToDto(row) {
    return {
      id:         row.id,
      title:      row.title,
      content:    row.content,
      type:       row.type,
      senderId:   row.sender_id,
      recipients: row.recipients || [],
      sentAt:     row.sent_at,
      status:     row.status,
    };
  }

  /** Normalize message DB row → DTO */
  static msgToDto(row) {
    return {
      id:               row.id,
      studentId:        row.student_id,
      className:        row.class_name,
      from:             row.from_role,      // 'gv' | 'ph' | 'bgh'
      text:             row.message,
      conversationType: row.conversation_type || 'GVCN',
      senderId:         row.sender_id,
      sentAt:           row.sent_at,
    };
  }

  /**
   * Lấy danh sách liên hệ theo vai trò (Role):
   * - PH: Chỉ lấy Ban Giám Hiệu + GVCN các lớp của con mình.
   * - GVCN: Lớp chủ nhiệm của mình kèm danh sách phụ huynh.
   * - BGH: Tất cả các lớp.
   */
  static async getContacts(user) {
    if (!user) throw new ForbiddenError('Yêu cầu đăng nhập.');

    if (user.role === 'PH') {
      const children = await ParentStudentRepository.findStudentsByParentUserId(user.id);

      // Tìm thông tin Ban Giám Hiệu (users role='BGH')
      const allUsers = await UserRepository.findAll();
      const bghUser = allUsers.find((u) => u.role === 'BGH');
      const studentCodes = children.map((c) => c.studentCode).filter(Boolean);
      const unreadData = await CommunicationRepository.getUnreadCountsForParent(studentCodes);

      const bghContact = {
        id:               'bgh',
        name:             bghUser?.full_name || 'Ban Giám Hiệu',
        title:            'Ban Giám Hiệu THPT HSU',
        role:             'BGH',
        conversationType: 'BGH',
        studentId:        children[0]?.studentCode || null,
        studentName:      children[0]?.studentName || null,
        className:        children[0]?.className || null,
        unreadCount:      unreadData.bgh || 0,
        hasUnread:        (unreadData.bgh || 0) > 0,
      };

      const gvcnContacts = children.map((c) => {
        const unreadCount = unreadData.gvcn[c.studentCode] || 0;
        return {
          id:               `gvcn-${c.studentCode}`,
          name:             c.gvcnName ? `${c.gvcnName}` : 'Giáo viên chủ nhiệm',
          title:            `GVCN Lớp ${c.className}`,
          role:             'GVCN',
          conversationType: 'GVCN',
          studentId:        c.studentCode,
          studentName:      c.studentName,
          className:        c.className,
          unreadCount,
          hasUnread:        unreadCount > 0,
        };
      });

      return {
        role: 'PH',
        bgh: [bghContact],
        gvcn: gvcnContacts,
        children,
      };
    }

    if (user.role === 'GVCN') {
      const homeroomClass = await ClassRepository.findByHomeroomTeacherId(user.id);
      if (!homeroomClass) {
        return { role: 'GVCN', className: null, students: [] };
      }
      const students = await this.getStudentsByClass(homeroomClass.class_name, user);
      return {
        role: 'GVCN',
        className: homeroomClass.class_name,
        students,
      };
    }

    // Mặc định cho BGH
    const classes = await ClassRepository.findAll();
    return {
      role: 'BGH',
      classes: classes.map((c) => ({ id: c.class_name, name: c.class_name })),
    };
  }

  /**
   * Lấy dữ liệu khởi tạo trang: classes + notifications.
   * - GVCN: chỉ trả về lớp chủ nhiệm của mình.
   * - PH: chỉ trả về thông báo các lớp con mình đang học.
   */
  static async getPageData(className = null, user = null) {
    if (user?.role === 'GVCN') {
      const homeroomClass = await ClassRepository.findByHomeroomTeacherId(user.id);
      const targetClass = homeroomClass?.class_name ?? null;

      const rawNotifs = await CommunicationRepository.findAllNotifications(targetClass);
      return {
        classes: targetClass ? [{ id: targetClass, name: targetClass }] : [],
        notifications: rawNotifs.map(this.notifToDto),
      };
    }

    if (user?.role === 'PH') {
      const children = await ParentStudentRepository.findStudentsByParentUserId(user.id);
      const childClasses = [...new Set(children.map((c) => c.className).filter(Boolean))];

      const rawNotifs = await CommunicationRepository.findAllNotifications(null);
      // Lọc thông báo gửi chung hoặc gửi tới lớp của các con
      const filtered = rawNotifs.filter((n) => {
        if (!n.recipients || n.recipients.length === 0) return true;
        return n.recipients.some((r) => childClasses.includes(r) || r === 'all');
      });

      return {
        classes: childClasses.map((c) => ({ id: c, name: c })),
        notifications: filtered.map(this.notifToDto),
      };
    }

    // Role BGH hoặc fallback
    const [rawClasses, rawNotifs] = await Promise.all([
      ClassRepository.findAll(),
      CommunicationRepository.findAllNotifications(className),
    ]);

    const classes = rawClasses.map((c) => ({
      id:   c.class_name,
      name: c.class_name,
    }));

    const notifications = rawNotifs.map(this.notifToDto);
    return { classes, notifications };
  }

  /**
   * Lấy danh sách học sinh theo lớp kèm kiểm tra quyền:
   * - Phụ huynh: Cấm truy cập (403).
   * - GVCN: Chỉ được xem lớp mình chủ nhiệm (403 nếu lớp khác).
   */
  static async getStudentsByClass(className, user = null) {
    if (user?.role === 'PH') {
      throw new ForbiddenError('Phụ huynh không có quyền truy cập danh sách phụ huynh của lớp.');
    }

    if (user?.role === 'GVCN') {
      const homeroomClass = await ClassRepository.findByHomeroomTeacherId(user.id);
      if (!homeroomClass || homeroomClass.class_name !== className) {
        throw new ForbiddenError('Bạn chỉ có quyền xem danh sách phụ huynh của lớp bạn chủ nhiệm.');
      }
    }

    const channel = user?.role === 'BGH' ? 'BGH' : 'GVCN';
    const [rows, unreadMap] = await Promise.all([
      StudentRepository.findByClassName(className),
      CommunicationRepository.getUnreadCountsByClass(className, channel),
    ]);

    return rows.map((s) => {
      const code = s.student_code || s.studentCode;
      const unreadCount = unreadMap[code] || 0;
      return {
        id:          code,
        name:        s.full_name    || s.fullName,
        className:   s.class_name   || s.className,
        parentName:  s.parent_name  || s.parentName  || '',
        parentPhone: s.parent_phone || s.parentPhone || '',
        unreadCount,
        hasUnread:   unreadCount > 0,
      };
    });
  }

  /**
   * Gửi thông báo mới (Chỉ BGH và GVCN có quyền).
   */
  static async sendNotification({ title, content, type, senderId, recipients, user = null }) {
    if (user?.role === 'PH') {
      throw new ForbiddenError('Phụ huynh không có quyền tạo hoặc gửi thông báo.');
    }

    if (!title?.trim())           throw new Error('Thiếu tiêu đề thông báo');
    if (!content?.trim())         throw new Error('Thiếu nội dung thông báo');
    if (!recipients?.length)      throw new Error('Chưa chọn lớp nhận thông báo');

    const created = await CommunicationRepository.createNotification({
      title:      title.trim(),
      content:    content.trim(),
      type:       type || 'general',
      senderId:   senderId || user?.username || null,
      recipients,
      status:     'sent',
    });
    if (!created) throw new Error('Không thể lưu thông báo');
    return this.notifToDto(created);
  }

  /**
   * Lấy thread tin nhắn của một học sinh theo kênh (GVCN hoặc BGH).
   * Kiểm tra quyền:
   * - Phụ huynh: Chỉ xem được hội thoại của chính con mình (403 nếu cố tình xem học sinh khác).
   * - GVCN: Chỉ xem được hội thoại của học sinh lớp mình chủ nhiệm (403 nếu xem lớp khác hoặc xem kênh BGH).
   */
  static async getThread(studentId, conversationType = 'GVCN', user = null) {
    if (!studentId) throw new Error('Thiếu tham số studentId');

    if (user?.role === 'PH') {
      const isParent = await ParentStudentRepository.isParentOfStudent(user.id, studentId);
      if (!isParent) {
        throw new ForbiddenError('Bạn không có quyền truy cập cuộc trò chuyện của học sinh này.');
      }
    } else if (user?.role === 'GVCN') {
      if (conversationType === 'BGH') {
        throw new ForbiddenError('Giáo viên chủ nhiệm không có quyền xem kênh trao đổi riêng của Ban Giám Hiệu.');
      }

      const student = await StudentRepository.findByStudentCode(studentId);
      const homeroomClass = await ClassRepository.findByHomeroomTeacherId(user.id);
      if (!student || !homeroomClass || student.class_name !== homeroomClass.class_name) {
        throw new ForbiddenError('Bạn chỉ có quyền xem cuộc trò chuyện của học sinh thuộc lớp bạn chủ nhiệm.');
      }
    }

    // Tự động đánh dấu đã đọc các tin nhắn gửi tới cho user khi mở thread
    await CommunicationRepository.markAsRead(studentId, conversationType, user?.role);

    const rows = await CommunicationRepository.findMessagesByStudent(studentId, conversationType);
    return rows.map(this.msgToDto);
  }

  /**
   * Gửi tin nhắn mới vào thread:
   * - Phụ huynh: Chỉ gửi tin cho con mình (from_role = 'ph').
   * - GVCN: Chỉ gửi tin cho học sinh lớp chủ nhiệm (from_role = 'gv').
   * - BGH: Gửi tin nhắn với tư cách Ban Giám Hiệu (from_role = 'bgh').
   */
  static async sendMessage({ studentId, className, fromRole, message, conversationType = 'GVCN', user = null }) {
    if (!studentId) throw new Error('Thiếu studentId');
    if (!message?.trim()) throw new Error('Tin nhắn không được để trống');

    let actualFromRole = fromRole || 'gv';

    if (user?.role === 'PH') {
      const isParent = await ParentStudentRepository.isParentOfStudent(user.id, studentId);
      if (!isParent) {
        throw new ForbiddenError('Bạn không có quyền gửi tin nhắn cho học sinh này.');
      }
      actualFromRole = 'ph';
    } else if (user?.role === 'GVCN') {
      const student = await StudentRepository.findByStudentCode(studentId);
      const homeroomClass = await ClassRepository.findByHomeroomTeacherId(user.id);
      if (!student || !homeroomClass || student.class_name !== homeroomClass.class_name) {
        throw new ForbiddenError('Bạn chỉ có quyền gửi tin nhắn cho học sinh thuộc lớp bạn chủ nhiệm.');
      }
      actualFromRole = 'gv';
      conversationType = 'GVCN';
    } else if (user?.role === 'BGH') {
      actualFromRole = 'bgh';
      if (!conversationType) {
        conversationType = 'BGH';
      }
    }

    const created = await CommunicationRepository.createMessage({
      studentId,
      className: className || null,
      fromRole:  actualFromRole,
      message:   message.trim(),
      conversationType: conversationType || 'GVCN',
      senderId:  user?.id || null,
    });

    if (!created) throw new Error('Không thể lưu tin nhắn');
    return this.msgToDto(created);
  }
}
