package com.school.management.service;

import com.school.management.entity.Subject;
import java.util.List;

public interface SubjectService {
    List<Subject> getAllSubjects();
    Subject getSubjectById(Long id);
    Subject getSubjectByCode(String code);
    Subject createSubject(Subject subject);
    void deleteSubject(Long id);
}
