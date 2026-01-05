package com.eadms.controller;

import com.eadms.dto.request.LoginRequest;
import com.eadms.dto.response.ApiResponse;
import com.eadms.dto.response.LoginResponse;
import com.eadms.dto.response.UserResponse;
import com.eadms.entity.User;
import com.eadms.service.AuthService;
import com.eadms.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ResponseUtil.success("Login successful", response));
    }
    
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        User user = authService.getCurrentUser();
        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .fullName(user.getFullName())
                .build();
        return ResponseEntity.ok(ResponseUtil.success("User retrieved", response));
    }
}
