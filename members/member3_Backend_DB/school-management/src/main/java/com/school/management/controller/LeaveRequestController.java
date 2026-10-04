package com.school.management.controller;

import com.school.management.entity.LeaveRequest;
import com.school.management.service.LeaveRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leave-requests")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @Autowired
    public LeaveRequestController(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    @GetMapping
    public ResponseEntity<List<LeaveRequest>> getLeaveRequests(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String studentCode) {

        if (studentCode != null && !studentCode.trim().isEmpty()) {
            return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByStudentCode(studentCode));
        }
        if (className != null && !className.trim().isEmpty()) {
            return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByClass(className));
        }
        return ResponseEntity.ok(leaveRequestService.getAllLeaveRequests());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> submitLeaveRequest(@RequestBody LeaveRequest leaveRequest) {
        LeaveRequest saved = leaveRequestService.createLeaveRequest(leaveRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã nộp đơn xin nghỉ học thành công!");
        response.put("data", saved);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveLeaveRequest(
            @PathVariable Long id,
            @RequestParam(defaultValue = "APPROVED") String status) {

        LeaveRequest lr;
        if ("REJECTED".equalsIgnoreCase(status)) {
            lr = leaveRequestService.rejectLeaveRequest(id);
        } else {
            lr = leaveRequestService.approveLeaveRequest(id);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã cập nhật trạng thái đơn xin nghỉ học thành công!");
        response.put("data", lr);
        return ResponseEntity.ok(response);
    }
}
