package com.school.management.controller;

import com.school.management.entity.Tuition;
import com.school.management.service.TuitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tuition")
public class TuitionController {

    private final TuitionService tuitionService;

    @Autowired
    public TuitionController(TuitionService tuitionService) {
        this.tuitionService = tuitionService;
    }

    @GetMapping
    public ResponseEntity<List<Tuition>> getTuitions(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String studentCode) {

        if (studentCode != null && !studentCode.trim().isEmpty()) {
            return ResponseEntity.ok(tuitionService.getTuitionByStudentCode(studentCode));
        }
        if (className != null && !className.trim().isEmpty()) {
            return ResponseEntity.ok(tuitionService.getTuitionByClass(className));
        }
        return ResponseEntity.ok(tuitionService.getAllTuitions());
    }

    @PostMapping("/pay")
    public ResponseEntity<Map<String, Object>> payTuition(@RequestBody Map<String, Object> payRequest) {
        String studentCode = (String) payRequest.get("studentCode");
        Double amount = payRequest.get("amount") != null ? Double.valueOf(payRequest.get("amount").toString()) : 0.0;

        List<Tuition> tuitions = tuitionService.getTuitionByStudentCode(studentCode);
        if (!tuitions.isEmpty()) {
            Tuition t = tuitions.get(0);
            tuitionService.payTuition(t.getId(), amount);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Thanh toán học phí thành công! Đã ghi nhận biên lai điện tử.");
        response.put("receiptNo", "BL-2024-" + System.currentTimeMillis() % 10000);
        return ResponseEntity.ok(response);
    }
}
