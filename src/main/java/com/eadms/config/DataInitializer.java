package com.eadms.config;

import com.eadms.entity.*;
import com.eadms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Data Initializer - Creates default admin user
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {
    
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:admin@eadms.com}")
    private String adminEmail;

    @Value("${admin.password:Admin@123}")
    private String adminPassword;
    
    @Bean
    public CommandLineRunner initializeData(
            UserRepository userRepository,
            TeacherRepository teacherRepository,
            StudentRepository studentRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository) {
        return args -> {
            // Check if admin user already exists
            if (userRepository.findByEmail(adminEmail).isPresent()) {
                log.info("ℹ️  Admin user already exists, skipping initialization");
                return;
            }
            
            log.info("🌱 Creating default admin user...");
            
            // Create default Admin User
            User adminUser = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(User.Role.ADMIN)
                    .isActive(true)
                    .build();
            
            userRepository.save(adminUser);
            log.info("✅ Default admin user created successfully!");
            log.info("📧 Admin Login: {} / {}", adminEmail, adminPassword);
            log.info("ℹ️  Use the admin panel to add teachers, students, and courses.");
        };
    }
}