import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CommunicationService, ForbiddenError } from '../services/CommunicationService.js';
import { ParentStudentRepository } from '../repositories/ParentStudentRepository.js';
import { StudentRepository } from '../repositories/StudentRepository.js';
import { ClassRepository } from '../repositories/ClassRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { CommunicationRepository } from '../repositories/CommunicationRepository.js';

describe('Communication Service RBAC & Chat Authorization Tests', () => {
  // Mock users
  const parentUser = { id: 10, username: 'ph.hs0001', role: 'PH', full_name: 'Nguyễn Thị Hương' };
  const otherParentUser = { id: 20, username: 'ph.hs0005', role: 'PH', full_name: 'Đặng Văn Nam' };
  const gvcnUser = { id: 2, username: 'gvcn.10a1', role: 'GVCN', full_name: 'Lê Minh Châu' };
  const bghUser = { id: 1, username: 'bgh.admin', role: 'BGH', full_name: 'Hiệu trưởng Trần Quốc Bảo' };

  // Mock data
  const mockChildren = [
    {
      studentCode: 'HS001',
      studentName: 'Nguyễn Thị Ánh',
      className: '10A1',
      gvcnName: 'Lê Minh Châu',
      homeroomTeacherId: 2,
      relationship: 'Mẹ',
    },
  ];

  const mockStudents = [
    { student_code: 'HS001', studentCode: 'HS001', full_name: 'Nguyễn Thị Ánh', class_name: '10A1' },
    { student_code: 'HS005', studentCode: 'HS005', full_name: 'Đặng Thị Giang', class_name: '10A2' },
  ];

  // Override repository methods for unit testing
  ParentStudentRepository.findStudentsByParentUserId = async (userId) => {
    if (userId === parentUser.id) return mockChildren;
    return [];
  };

  ParentStudentRepository.isParentOfStudent = async (userId, studentCode) => {
    if (userId === parentUser.id && studentCode === 'HS001') return true;
    if (userId === otherParentUser.id && studentCode === 'HS005') return true;
    return false;
  };

  StudentRepository.findByStudentCode = async (code) => {
    return mockStudents.find((s) => s.student_code === code) || null;
  };

  ClassRepository.findByHomeroomTeacherId = async (userId) => {
    if (userId === gvcnUser.id) return { id: 1, class_name: '10A1', gvcn_name: 'Lê Minh Châu' };
    return null;
  };

  UserRepository.findAll = async () => [bghUser, gvcnUser, parentUser];

  CommunicationRepository.findMessagesByStudent = async (_id, _channel) => [
    { id: 1, student_id: 'HS001', from_role: 'gv', message: 'Chào phụ huynh', sent_at: new Date() },
  ];

  CommunicationRepository.createMessage = async (msg) => ({
    id: 99,
    student_id: msg.studentId,
    class_name: msg.className,
    from_role: msg.fromRole,
    message: msg.message,
    conversation_type: msg.conversationType,
    sent_at: new Date(),
  });

  // 1. Phụ huynh lấy danh bạ người liên hệ
  it('Phụ huynh chỉ nhận được danh bạ gồm Ban Giám Hiệu và GVCN của các lớp con mình học', async () => {
    const contacts = await CommunicationService.getContacts(parentUser);
    assert.equal(contacts.role, 'PH');
    assert.equal(contacts.bgh.length, 1);
    assert.equal(contacts.bgh[0].name, 'Hiệu trưởng Trần Quốc Bảo');
    assert.equal(contacts.bgh[0].conversationType, 'BGH');

    assert.equal(contacts.gvcn.length, 1);
    assert.equal(contacts.gvcn[0].studentId, 'HS001');
    assert.equal(contacts.gvcn[0].className, '10A1');
    assert.equal(contacts.gvcn[0].name, 'Lê Minh Châu');
    assert.equal(contacts.gvcn[0].conversationType, 'GVCN');
  });

  // 2. Phụ huynh cố tình gọi danh sách học sinh của lớp -> 403
  it('Phụ huynh gọi getStudentsByClass phải nhận lỗi 403 Forbidden', async () => {
    await assert.rejects(
      async () => {
        await CommunicationService.getStudentsByClass('10A1', parentUser);
      },
      (err) => {
        assert.equal(err.status, 403);
        assert.match(err.message, /không có quyền truy cập danh sách/);
        return true;
      }
    );
  });

  // 3. Phụ huynh xem cuộc trò chuyện của con mình -> thành công
  it('Phụ huynh xem cuộc trò chuyện của con mình (HS001) thành công', async () => {
    const messages = await CommunicationService.getThread('HS001', 'GVCN', parentUser);
    assert.ok(Array.isArray(messages));
    assert.equal(messages.length, 1);
    assert.equal(messages[0].text, 'Chào phụ huynh');
  });

  // 4. Phụ huynh cố tình xem cuộc trò chuyện của học sinh khác -> 403
  it('Phụ huynh gọi API xem cuộc trò chuyện của học sinh khác (HS005) phải nhận lỗi 403 Forbidden', async () => {
    await assert.rejects(
      async () => {
        await CommunicationService.getThread('HS005', 'GVCN', parentUser);
      },
      (err) => {
        assert.equal(err.status, 403);
        assert.match(err.message, /Bạn không có quyền truy cập cuộc trò chuyện/);
        return true;
      }
    );
  });

  // 5. Phụ huynh cố tình gửi tin nhắn cho học sinh khác -> 403
  it('Phụ huynh gửi tin nhắn cho học sinh khác (HS005) phải nhận lỗi 403 Forbidden', async () => {
    await assert.rejects(
      async () => {
        await CommunicationService.sendMessage({
          studentId: 'HS005',
          className: '10A2',
          message: 'Tin nhắn gửi trộm',
          user: parentUser,
        });
      },
      (err) => {
        assert.equal(err.status, 403);
        assert.match(err.message, /Bạn không có quyền gửi tin nhắn/);
        return true;
      }
    );
  });

  // 6. GVCN xem cuộc trò chuyện của học sinh lớp mình chủ nhiệm -> thành công
  it('GVCN xem cuộc trò chuyện của học sinh lớp mình (HS001 - 10A1) thành công', async () => {
    const messages = await CommunicationService.getThread('HS001', 'GVCN', gvcnUser);
    assert.ok(Array.isArray(messages));
    assert.equal(messages[0].studentId, 'HS001');
  });

  // 7. GVCN cố tình xem cuộc trò chuyện của học sinh lớp khác -> 403
  it('GVCN xem cuộc trò chuyện của học sinh lớp khác (HS005 - 10A2) phải nhận lỗi 403 Forbidden', async () => {
    await assert.rejects(
      async () => {
        await CommunicationService.getThread('HS005', 'GVCN', gvcnUser);
      },
      (err) => {
        assert.equal(err.status, 403);
        assert.match(err.message, /chỉ có quyền xem cuộc trò chuyện của học sinh thuộc lớp bạn chủ nhiệm/);
        return true;
      }
    );
  });

  // 8. GVCN cố tình xem kênh riêng của Ban Giám Hiệu -> 403
  it('GVCN cố tình truy cập kênh trao đổi riêng BGH phải nhận lỗi 403 Forbidden', async () => {
    await assert.rejects(
      async () => {
        await CommunicationService.getThread('HS001', 'BGH', gvcnUser);
      },
      (err) => {
        assert.equal(err.status, 403);
        assert.match(err.message, /không có quyền xem kênh trao đổi riêng của Ban Giám Hiệu/);
        return true;
      }
    );
  });

  // 9. BGH có toàn quyền xem cuộc trò chuyện
  it('Ban Giám Hiệu xem cuộc trò chuyện thành công', async () => {
    const messages = await CommunicationService.getThread('HS001', 'BGH', bghUser);
    assert.ok(Array.isArray(messages));
  });
});
