package com.school.management.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "grade_books")
public class GradeBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "student_code")
    private String studentCode;

    @Column(name = "student_name")
    private String studentName;

    @Column(name = "class_name")
    private String className;

    @Column(name = "subject_name")
    private String subjectName;

    private String semester;
    
    @Column(name = "school_year")
    private String schoolYear;

    @Column(name = "score_oral")
    private Double scoreOral;

    @Column(name = "score_15m")
    private Double score15m;

    @Column(name = "score_1hour")
    private Double score1Hour;

    @Column(name = "score_mid_term")
    private Double scoreMidTerm;

    @Column(name = "score_final_term")
    private Double scoreFinalTerm;

    @Column(name = "average_score")
    private Double averageScore;

    @Column(name = "grade_letter")
    private String gradeLetter;

    private String status; // DRAFT, SUBMITTED, APPROVED, LOCKED

    public GradeBook() {}

    public GradeBook(String studentCode, String studentName, String className, String subjectName, String semester, String schoolYear, Double scoreOral, Double score15m, Double score1Hour, Double scoreMidTerm, Double scoreFinalTerm) {
        this.studentCode = studentCode;
        this.studentName = studentName;
        this.className = className;
        this.subjectName = subjectName;
        this.semester = semester;
        this.schoolYear = schoolYear;
        this.scoreOral = scoreOral;
        this.score15m = score15m;
        this.score1Hour = score1Hour;
        this.scoreMidTerm = scoreMidTerm;
        this.scoreFinalTerm = scoreFinalTerm;
        this.status = "APPROVED";
        calculateAverage();
    }

    public void calculateAverage() {
        if (scoreOral != null && score15m != null && score1Hour != null && scoreMidTerm != null && scoreFinalTerm != null) {
            double total = scoreOral + score15m + (score1Hour * 2) + (scoreMidTerm * 2) + (scoreFinalTerm * 3);
            this.averageScore = Math.round((total / 9.0) * 10.0) / 10.0;

            if (this.averageScore >= 9.0) this.gradeLetter = "Xuất sắc";
            else if (this.averageScore >= 8.0) this.gradeLetter = "Giỏi";
            else if (this.averageScore >= 6.5) this.gradeLetter = "Khá";
            else if (this.averageScore >= 5.0) this.gradeLetter = "Trung bình";
            else this.gradeLetter = "Yếu";
        }
    }

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
