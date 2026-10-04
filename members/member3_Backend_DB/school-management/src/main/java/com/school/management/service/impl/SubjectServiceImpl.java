package com.school.management.service.impl;

import com.school.management.entity.Subject;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.repository.SubjectRepository;
import com.school.management.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;

    @Autowired
    public SubjectServiceImpl(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    @Override
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @Override
    public Subject getSubjectById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
    }

    @Override
    public Subject getSubjectByCode(String code) {
        return subjectRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with code: " + code));
    }

    @Override
    public Subject createSubject(Subject subject) {
        return subjectRepository.save(subject);
    }

    @Override
    public void deleteSubject(Long id) {
        Subject s = getSubjectById(id);
        subjectRepository.delete(s);
    }
}
