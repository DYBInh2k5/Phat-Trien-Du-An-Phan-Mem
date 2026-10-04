package com.school.management.service.impl;

import com.school.management.entity.LeaveRequest;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.repository.LeaveRequestRepository;
import com.school.management.service.LeaveRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;

    @Autowired
    public LeaveRequestServiceImpl(LeaveRequestRepository leaveRequestRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
    }

    @Override
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAll();
    }

    @Override
    public LeaveRequest getLeaveRequestById(Long id) {
        return leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id));
    }

    @Override
    public List<LeaveRequest> getLeaveRequestsByStudentCode(String studentCode) {
        return leaveRequestRepository.findByStudentCode(studentCode);
    }

    @Override
    public List<LeaveRequest> getLeaveRequestsByClass(String className) {
        return leaveRequestRepository.findByClassName(className);
    }

    @Override
    public LeaveRequest createLeaveRequest(LeaveRequest leaveRequest) {
        leaveRequest.setStatus("PENDING");
        return leaveRequestRepository.save(leaveRequest);
    }

    @Override
    public LeaveRequest approveLeaveRequest(Long id) {
        LeaveRequest leaveRequest = getLeaveRequestById(id);
        leaveRequest.setStatus("APPROVED");
        return leaveRequestRepository.save(leaveRequest);
    }

    @Override
    public LeaveRequest rejectLeaveRequest(Long id) {
        LeaveRequest leaveRequest = getLeaveRequestById(id);
        leaveRequest.setStatus("REJECTED");
        return leaveRequestRepository.save(leaveRequest);
    }
}
