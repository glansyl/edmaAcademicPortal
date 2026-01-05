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
public class StudentResponse {
    
    private Long id; // Student entity ID
    private Long userId; // User ID for messaging
    private String firstName;
    private String lastName;
    private String fullName;
    private String studentId;
    private String className;
    private String gender;
    private String contactNumber;
    private LocalDate dateOfBirth;
    private String email;
    private Boolean isActive;
}
