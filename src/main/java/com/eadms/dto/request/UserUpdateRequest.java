package com.eadms.dto.request;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    
    @Email(message = "Invalid email format")
    private String email;
    
    private String newPassword;
    
    // Flag to indicate if password should be reset
    private Boolean resetPassword = false;
}