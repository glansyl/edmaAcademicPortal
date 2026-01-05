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
public class EnrollmentResponse {
    
    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private Integer credits;
    private Integer semester;
    private Integer academicYear;
    private String status;
    private LocalDate enrollmentDate;
    private LocalDate completionDate;
    private Double finalGrade;
    private String letterGrade;
    private Double gradePoints;
    private String remarks;
}
