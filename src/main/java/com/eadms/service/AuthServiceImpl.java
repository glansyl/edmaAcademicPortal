package com.eadms.service;

import com.eadms.config.JwtTokenProvider;
import com.eadms.dto.request.LoginRequest;
import com.eadms.dto.response.LoginResponse;
import com.eadms.entity.User;
import com.eadms.exception.BadRequestException;
import com.eadms.exception.ResourceNotFoundException;
import com.eadms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    
    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());
        
        return LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getId())
                .message("Login successful")
                .build();
    }
    
    @Override
    @Transactional
    public User registerUser(String email, String password, User.Role role) {
        // Validate email
        if (email == null || email.trim().isEmpty()) {
            throw new BadRequestException("Email address is required");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email address '" + email + "' is already registered. Please use a different email or login with existing account.");
        }
        
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .isActive(true)
                .build();
        
        return userRepository.save(user);
    }
    
    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("No authenticated user found");
        }
        
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    @Override
    @Transactional
    public void updateStudentUser(Long studentId, com.eadms.dto.request.UserUpdateRequest request) {
        // Implementation for updating student user
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student user not found"));
        
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }
        
        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }
        
        userRepository.save(user);
    }
    
    @Override
    @Transactional
    public void updateTeacherUser(Long teacherId, com.eadms.dto.request.UserUpdateRequest request) {
        // Implementation for updating teacher user
        User user = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher user not found"));
        
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }
        
        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }
        
        userRepository.save(user);
    }
}
