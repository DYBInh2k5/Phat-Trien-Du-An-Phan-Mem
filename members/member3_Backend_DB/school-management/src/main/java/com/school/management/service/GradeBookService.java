package com.school.management.service;

import com.school.management.entity.GradeBook;
import java.util.List;

public interface GradeBookService {
    List<GradeBook> getAllGrades();
    GradeBook getGradeById(Long id);
    List<GradeBook> getGradesByClass(String className);
    List<GradeBook> getGradesBySubject(String subjectName);
    List<GradeBook> getGradesByClassAndSubject(String className, String subjectName);
    List<GradeBook> getGradesByStudentCode(String studentCode);
    GradeBook saveGrade(GradeBook gradeBook);
    List<GradeBook> saveAllGrades(List<GradeBook> gradeBooks);
    void lockGradeSheet(String className, String subjectName);
    void unlockGradeSheet(String className, String subjectName);
}
