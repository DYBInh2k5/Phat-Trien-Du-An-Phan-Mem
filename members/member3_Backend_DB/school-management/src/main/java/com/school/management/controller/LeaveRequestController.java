package com.school.management.controller;

import com.school.management.entity.LeaveRequest;
import com.school.management.repository.LeaveRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leave-requests")
public class LeaveRequestController {

    private final LeaveRequestRepository leaveRequestRepository;

    public LeaveRequestController(LeaveRequestRepository leaveRequestRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
    }

    @GetMapping
    public ResponseEntity<List<LeaveRequest>> getLeaveRequests(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String studentCode) {

        if (studentCode != null && !studentCode.trim().isEmpty()) {
            return ResponseEntity.ok(leaveRequestRepository.findByStudentCode(studentCode));
        }
        if (className != null && !className.trim().isEmpty()) {
            return ResponseEntity.ok(leaveRequestRepository.findByClassName(className));
        }
        return ResponseEntity.ok(leaveRequestRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> submitLeaveRequest(@RequestBody LeaveRequest leaveRequest) {
        if (leaveRequest.getStatus() == null) {
            leaveRequest.setStatus("PENDING");
        }
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);

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

        Map<String, Object> response = new HashMap<>();
        return leaveRequestRepository.findById(id).map(lr -> {
            lr.setStatus(status);
            leaveRequestRepository.save(lr);
            response.put("success", true);
            response.put("message", "Đã cập nhật trạng thái đơn xin nghỉ học thành công!");
            response.put("data", lr);
            return ResponseEntity.ok(response);
        }).orElseGet(() -> {
            response.put("success", false);
            response.put("message", "Không tìm thấy đơn xin nghỉ học!");
            return ResponseEntity.status(404).body(response);
        });
    }
}
