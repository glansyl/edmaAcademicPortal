package com.eadms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherBasicResponse {
    private Long id; // This should be USER ID for messaging
    private Long teacherId; // Actual teacher entity ID
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String department;
}
