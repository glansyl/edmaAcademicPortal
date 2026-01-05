package com.eadms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentUpdateRequest {
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotBlank(message = "Class name is required")
    private String className;
    
    @NotBlank(message = "Gender is required")
    private String gender;
    
    private String contactNumber;
    
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;
    
    // Email and password are NOT included in update requests
    // They can only be set during creation
}
