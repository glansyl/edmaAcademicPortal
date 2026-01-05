package com.eadms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "marks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Marks extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExamType examType;
    
    @Column(nullable = false)
    private Double marksObtained;
    
    @Column(nullable = false)
    private Double maxMarks;
    
    private String remarks;
    
    @Column(nullable = false)
    private LocalDate examDate;
    
    public enum ExamType {
        MIDTERM, FINAL, ASSIGNMENT, QUIZ
    }
    
    public Double getPercentage() {
        if (maxMarks == null || maxMarks == 0) {
            return 0.0;
        }
        return (marksObtained / maxMarks) * 100;
    }
}
