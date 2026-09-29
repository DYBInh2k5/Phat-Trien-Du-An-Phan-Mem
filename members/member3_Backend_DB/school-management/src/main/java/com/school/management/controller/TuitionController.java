package com.school.management.controller;

import com.school.management.entity.Tuition;
import com.school.management.repository.TuitionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tuition")
public class TuitionController {

    private final TuitionRepository tuitionRepository;

    public TuitionController(TuitionRepository tuitionRepository) {
        this.tuitionRepository = tuitionRepository;
    }

    @GetMapping
    public ResponseEntity<List<Tuition>> getTuitions(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String studentCode) {

        if (className != null && !className.trim().isEmpty()) {
            return ResponseEntity.ok(tuitionRepository.findByClassName(className));
        }
        return ResponseEntity.ok(tuitionRepository.findAll());
    }

    @PostMapping("/pay")
    public ResponseEntity<Map<String, Object>> payTuition(@RequestBody Map<String, Object> payRequest) {
        String studentCode = (String) payRequest.get("studentCode");
        String semester = (String) payRequest.get("semester");
        Double amount = payRequest.get("amount") != null ? Double.valueOf(payRequest.get("amount").toString()) : 0.0;

        Map<String, Object> response = new HashMap<>();

        if (studentCode != null && semester != null) {
            tuitionRepository.findByStudentCodeAndSemester(studentCode, semester).ifPresent(t -> {
                t.setAmountPaid(t.getAmountPaid() + amount);
                if (t.getAmountPaid() >= t.getAmountDue()) {
                    t.setStatus("PAID");
                } else {
                    t.setStatus("PARTIAL");
                }
                tuitionRepository.save(t);
            });
        }

        response.put("success", true);
        response.put("message", "Thanh toán học phí thành công! Đã ghi nhận biên lai điện tử.");
        response.put("receiptNo", "BL-2024-" + System.currentTimeMillis() % 10000);
        return ResponseEntity.ok(response);
    }
}
