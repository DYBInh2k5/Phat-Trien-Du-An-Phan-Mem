package com.school.management.service;

import com.school.management.entity.LeaveRequest;
import java.util.List;

public interface LeaveRequestService {
    List<LeaveRequest> getAllLeaveRequests();
    LeaveRequest getLeaveRequestById(Long id);
    List<LeaveRequest> getLeaveRequestsByStudentCode(String studentCode);
    List<LeaveRequest> getLeaveRequestsByClass(String className);
    LeaveRequest createLeaveRequest(LeaveRequest leaveRequest);
    LeaveRequest approveLeaveRequest(Long id);
    LeaveRequest rejectLeaveRequest(Long id);
}
