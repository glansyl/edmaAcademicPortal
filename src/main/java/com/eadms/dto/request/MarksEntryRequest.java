package com.eadms.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarksEntryRequest {
    
    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    @NotBlank(message = "Exam type is required")
    private String examType;
    
    @NotNull(message = "Marks obtained is required")
    @Min(value = 0, message = "Marks obtained must be non-negative")
    private Double marksObtained;
    
    @NotNull(message = "Max marks is required")
    @Min(value = 1, message = "Max marks must be positive")
    private Double maxMarks;
    
    private String remarks;
    
    @NotNull(message = "Exam date is required")
    private LocalDate examDate;
}
