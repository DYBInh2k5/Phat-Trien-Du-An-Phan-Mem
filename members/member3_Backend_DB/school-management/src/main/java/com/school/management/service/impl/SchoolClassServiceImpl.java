package com.school.management.service.impl;

import com.school.management.entity.SchoolClass;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.repository.SchoolClassRepository;
import com.school.management.service.SchoolClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SchoolClassServiceImpl implements SchoolClassService {

    private final SchoolClassRepository schoolClassRepository;

    @Autowired
    public SchoolClassServiceImpl(SchoolClassRepository schoolClassRepository) {
        this.schoolClassRepository = schoolClassRepository;
    }

    @Override
    public List<SchoolClass> getAllClasses() {
        return schoolClassRepository.findAll();
    }

    @Override
    public SchoolClass getClassById(Long id) {
        return schoolClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + id));
    }

    @Override
    public SchoolClass getClassByName(String className) {
        return schoolClassRepository.findByClassName(className)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with name: " + className));
    }

    @Override
    public SchoolClass createClass(SchoolClass schoolClass) {
        return schoolClassRepository.save(schoolClass);
    }

    @Override
    public void deleteClass(Long id) {
        SchoolClass sc = getClassById(id);
        schoolClassRepository.delete(sc);
    }
}
