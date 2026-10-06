import { LeaveRequestRepository } from '../repositories/LeaveRequestRepository.js';

export class LeaveRequestService {
  static async getLeaveRequests({ className, studentCode }) {
    if (studentCode) {
      return await LeaveRequestRepository.findByStudentCode(studentCode);
    }
    if (className) {
      return await LeaveRequestRepository.findByClassName(className);
    }
    return await LeaveRequestRepository.findAll();
  }

  static async submitLeaveRequest(data) {
    data.status = data.status || 'PENDING';
    return await LeaveRequestRepository.create(data);
  }

  static async approveLeaveRequest(id, status = 'APPROVED') {
    const existing = await LeaveRequestRepository.findById(id);
    if (!existing) throw new Error(`Leave request not found with id: ${id}`);
    return await LeaveRequestRepository.updateStatus(id, status);
  }
}
