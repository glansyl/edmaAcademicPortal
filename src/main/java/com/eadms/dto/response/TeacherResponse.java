package com.eadms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherResponse {
    
    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String teacherId;
    private String department;
    private String email;
    private String contactNumber;
    private Boolean isActive;
}
