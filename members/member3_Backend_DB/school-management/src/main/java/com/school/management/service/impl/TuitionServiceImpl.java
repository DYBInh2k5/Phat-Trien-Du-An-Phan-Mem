package com.school.management.service.impl;

import com.school.management.entity.Tuition;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.repository.TuitionRepository;
import com.school.management.service.TuitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TuitionServiceImpl implements TuitionService {

    private final TuitionRepository tuitionRepository;

    @Autowired
    public TuitionServiceImpl(TuitionRepository tuitionRepository) {
        this.tuitionRepository = tuitionRepository;
    }

    @Override
    public List<Tuition> getAllTuitions() {
        return tuitionRepository.findAll();
    }

    @Override
    public Tuition getTuitionById(Long id) {
        return tuitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tuition entry not found with id: " + id));
    }

    @Override
    public List<Tuition> getTuitionByStudentCode(String studentCode) {
        return tuitionRepository.findByStudentCode(studentCode);
    }

    @Override
    public List<Tuition> getTuitionByClass(String className) {
        return tuitionRepository.findByClassName(className);
    }

    @Override
    public Tuition saveTuition(Tuition tuition) {
        return tuitionRepository.save(tuition);
    }

    @Override
    public Tuition payTuition(Long id, Double amount) {
        Tuition tuition = getTuitionById(id);
        double currentPaid = tuition.getPaidAmount() != null ? tuition.getPaidAmount() : 0.0;
        double newPaid = currentPaid + amount;
        tuition.setPaidAmount(newPaid);

        if (newPaid >= tuition.getAmount()) {
            tuition.setStatus("PAID");
        } else if (newPaid > 0) {
            tuition.setStatus("PARTIAL");
        }
        return tuitionRepository.save(tuition);
    }
}
