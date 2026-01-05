package com.eadms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "enrollments", indexes = {
    @Index(name = "idx_student_course", columnList = "student_id, course_id"),
    @Index(name = "idx_enrollment_status", columnList = "status")
}, uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "course_id", "semester", "academic_year"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @Column(nullable = false)
    private Integer semester;
    
    @Column(nullable = false)
    private Integer academicYear;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus status;
    
    @Column(nullable = false)
    private LocalDate enrollmentDate;
    
    private LocalDate completionDate;
    
    // Final grade as percentage (0-100)
    private Double finalGrade;
    
    // Letter grade (A+, A, B+, etc.)
    private String letterGrade;
    
    // Grade points (4.0 scale)
    private Double gradePoints;
    
    private String remarks;
    
    public enum EnrollmentStatus {
        ACTIVE,      // Currently enrolled
        COMPLETED,   // Course completed with grade
        DROPPED,     // Student dropped the course
        WITHDRAWN,   // Student withdrew from course
        FAILED       // Failed the course
    }
    
    /**
     * Calculate grade points based on final grade percentage
     */
    public void calculateGradePoints() {
        if (finalGrade == null) {
            this.gradePoints = null;
            this.letterGrade = null;
            return;
        }
        
        if (finalGrade >= 90) {
            this.letterGrade = "A+";
            this.gradePoints = 4.0;
        } else if (finalGrade >= 85) {
            this.letterGrade = "A";
            this.gradePoints = 4.0;
        } else if (finalGrade >= 80) {
            this.letterGrade = "A-";
            this.gradePoints = 3.7;
        } else if (finalGrade >= 77) {
            this.letterGrade = "B+";
            this.gradePoints = 3.3;
        } else if (finalGrade >= 73) {
            this.letterGrade = "B";
            this.gradePoints = 3.0;
        } else if (finalGrade >= 70) {
            this.letterGrade = "B-";
            this.gradePoints = 2.7;
        } else if (finalGrade >= 67) {
            this.letterGrade = "C+";
            this.gradePoints = 2.3;
        } else if (finalGrade >= 63) {
            this.letterGrade = "C";
            this.gradePoints = 2.0;
        } else if (finalGrade >= 60) {
            this.letterGrade = "C-";
            this.gradePoints = 1.7;
        } else if (finalGrade >= 57) {
            this.letterGrade = "D+";
            this.gradePoints = 1.3;
        } else if (finalGrade >= 53) {
            this.letterGrade = "D";
            this.gradePoints = 1.0;
        } else if (finalGrade >= 50) {
            this.letterGrade = "D-";
            this.gradePoints = 0.7;
        } else {
            this.letterGrade = "F";
            this.gradePoints = 0.0;
        }
    }
}
