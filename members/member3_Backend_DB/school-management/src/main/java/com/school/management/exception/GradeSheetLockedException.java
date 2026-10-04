package com.school.management.exception;

public class GradeSheetLockedException extends RuntimeException {
    public GradeSheetLockedException(String message) {
        super(message);
    }
}
