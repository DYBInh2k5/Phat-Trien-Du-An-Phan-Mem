package com.school.management.dto;

public class GradeBookDTO {
    private Long id;
    private Long studentId;
    private String studentCode;
    private String studentName;
    private String className;
    private String subjectName;
    private String semester;
    private String schoolYear;
    private Double scoreOral;
    private Double score15m;
    private Double score1Hour;
    private Double scoreMidTerm;
    private Double scoreFinalTerm;
    private Double averageScore;
    private String gradeLetter;
    private String status;

    public GradeBookDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public String getSchoolYear() { return schoolYear; }
    public void setSchoolYear(String schoolYear) { this.schoolYear = schoolYear; }

    public Double getScoreOral() { return scoreOral; }
    public void setScoreOral(Double scoreOral) { this.scoreOral = scoreOral; }

    public Double getScore15m() { return score15m; }
    public void setScore15m(Double score15m) { this.score15m = score15m; }

    public Double getScore1Hour() { return score1Hour; }
    public void setScore1Hour(Double score1Hour) { this.score1Hour = score1Hour; }

    public Double getScoreMidTerm() { return scoreMidTerm; }
    public void setScoreMidTerm(Double scoreMidTerm) { this.scoreMidTerm = scoreMidTerm; }

    public Double getScoreFinalTerm() { return scoreFinalTerm; }
    public void setScoreFinalTerm(Double scoreFinalTerm) { this.scoreFinalTerm = scoreFinalTerm; }

    public Double getAverageScore() { return averageScore; }
    public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }

    public String getGradeLetter() { return gradeLetter; }
    public void setGradeLetter(String gradeLetter) { this.gradeLetter = gradeLetter; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
