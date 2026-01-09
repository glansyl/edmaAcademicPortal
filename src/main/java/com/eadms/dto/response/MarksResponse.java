package com.eadms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarksResponse {
    
    private Long id;
    private Long studentId; // Database ID
    private String studentCode; // Student ID like CSE-001, ECE-002
    private String studentName;
    private Long courseId;
    private String courseCode; // Course code like CS101, MATH201
    private String courseName;
    private String examType;
    private Double marksObtained;
    private Double maxMarks;
    private Double percentage;
    private String remarks;
    private LocalDate examDate;
}
