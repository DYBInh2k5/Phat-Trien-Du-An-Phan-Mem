package com.school.management.service;

import com.school.management.entity.SchoolClass;
import java.util.List;

public interface SchoolClassService {
    List<SchoolClass> getAllClasses();
    SchoolClass getClassById(Long id);
    SchoolClass getClassByName(String className);
    SchoolClass createClass(SchoolClass schoolClass);
    void deleteClass(Long id);
}
