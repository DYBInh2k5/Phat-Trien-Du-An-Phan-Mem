package com.school.management.service.impl;

import com.school.management.entity.GradeBook;
import com.school.management.exception.GradeSheetLockedException;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.repository.GradeBookRepository;
import com.school.management.service.GradeBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GradeBookServiceImpl implements GradeBookService {

    private final GradeBookRepository gradeBookRepository;

    @Autowired
    public GradeBookServiceImpl(GradeBookRepository gradeBookRepository) {
        this.gradeBookRepository = gradeBookRepository;
    }

    @Override
    public List<GradeBook> getAllGrades() {
        return gradeBookRepository.findAll();
    }

    @Override
    public GradeBook getGradeById(Long id) {
        return gradeBookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GradeBook entry not found with id: " + id));
    }

    @Override
    public List<GradeBook> getGradesByClass(String className) {
        return gradeBookRepository.findByClassName(className);
    }

    @Override
    public List<GradeBook> getGradesBySubject(String subjectName) {
        return gradeBookRepository.findBySubjectName(subjectName);
    }

    @Override
    public List<GradeBook> getGradesByClassAndSubject(String className, String subjectName) {
        return gradeBookRepository.findByClassNameAndSubjectName(className, subjectName);
    }

    @Override
    public List<GradeBook> getGradesByStudentCode(String studentCode) {
        return gradeBookRepository.findByStudentCode(studentCode);
    }

    @Override
    public GradeBook saveGrade(GradeBook gradeBook) {
        if (gradeBook.getId() != null) {
            GradeBook existing = getGradeById(gradeBook.getId());
            if ("LOCKED".equalsIgnoreCase(existing.getStatus())) {
                throw new GradeSheetLockedException("Grade sheet is locked by BGH and cannot be edited.");
            }
        }
        gradeBook.calculateAverage();
        return gradeBookRepository.save(gradeBook);
    }

    @Override
    public List<GradeBook> saveAllGrades(List<GradeBook> gradeBooks) {
        for (GradeBook gb : gradeBooks) {
            if (gb.getId() != null) {
                GradeBook existing = gradeBookRepository.findById(gb.getId()).orElse(null);
                if (existing != null && "LOCKED".equalsIgnoreCase(existing.getStatus())) {
                    throw new GradeSheetLockedException("Grade entry for student " + gb.getStudentCode() + " is locked.");
                }
            }
            gb.calculateAverage();
        }
        return gradeBookRepository.saveAll(gradeBooks);
    }

    @Override
    public void lockGradeSheet(String className, String subjectName) {
        List<GradeBook> grades = getGradesByClassAndSubject(className, subjectName);
        for (GradeBook gb : grades) {
            gb.setStatus("LOCKED");
        }
        gradeBookRepository.saveAll(grades);
    }

    @Override
    public void unlockGradeSheet(String className, String subjectName) {
        List<GradeBook> grades = getGradesByClassAndSubject(className, subjectName);
        for (GradeBook gb : grades) {
            gb.setStatus("APPROVED");
        }
        gradeBookRepository.saveAll(grades);
    }
}
