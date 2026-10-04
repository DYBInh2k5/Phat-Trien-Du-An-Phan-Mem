package com.school.management.service;

import com.school.management.entity.Tuition;
import java.util.List;

public interface TuitionService {
    List<Tuition> getAllTuitions();
    Tuition getTuitionById(Long id);
    List<Tuition> getTuitionByStudentCode(String studentCode);
    List<Tuition> getTuitionByClass(String className);
    Tuition saveTuition(Tuition tuition);
    Tuition payTuition(Long id, Double amount);
}
