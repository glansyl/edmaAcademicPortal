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
 * Data Initializer - Creates default admin user and sample data
 * Updated to use TECH and IT departments only
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
            EnrollmentRepository enrollmentRepository,
            AttendanceRepository attendanceRepository,
            MarksRepository marksRepository) {
        return args -> {
            // Check if admin user already exists
            if (userRepository.findByEmail(adminEmail).isPresent()) {
                log.info("ℹ️  Data already exists, skipping initialization");
                return;
            }
            
            log.info("🌱 Initializing sample data for development...");
            
            // Create Admin User
            User adminUser = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(User.Role.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(adminUser);
            log.info("✅ Admin user created: {} / {}", adminEmail, adminPassword);
            
            // Create Teachers with TECH and IT departments only
            Teacher[] teachers = new Teacher[4];
            String[] departments = {"TECH", "TECH", "IT", "IT"};
            String[] firstNames = {"John", "Sarah", "Michael", "Emma"};
            String[] lastNames = {"Smith", "Johnson", "Williams", "Brown"};
            
            for (int i = 0; i < 4; i++) {
                User teacherUser = User.builder()
                        .email("teacher" + (i + 1) + "@eadms.com")
                        .password(passwordEncoder.encode("Teacher@123"))
                        .role(User.Role.TEACHER)
                        .isActive(true)
                        .build();
                userRepository.save(teacherUser);
                
                teachers[i] = Teacher.builder()
                        .teacherId(departments[i] + "-" + String.format("%03d", (i % 2) + 1))
                        .firstName(firstNames[i])
                        .lastName(lastNames[i])
                        .department(departments[i])
                        .contactNumber("555-010" + (i + 1))
                        .email("teacher" + (i + 1) + "@eadms.com")
                        .user(teacherUser)
                        .build();
                teacherRepository.save(teachers[i]);
            }
            log.info("✅ Created 4 teachers (2 TECH, 2 IT)");
            
            // Create Students with TECH and IT classes only
            Student[] students = new Student[10];
            String[] studentFirstNames = {"Alice", "Bob", "Charlie", "Diana", "Emma", "Frank", "Grace", "Henry", "Ivy", "Jack"};
            String[] studentLastNames = {"Anderson", "Brown", "Clark", "Davis", "Evans", "Foster", "Green", "Harris", "Irving", "Jones"};
            String[] classes = {"TECH", "TECH", "IT", "IT", "TECH", "IT", "TECH", "IT", "TECH", "IT"};
            
            for (int i = 0; i < 10; i++) {
                User studentUser = User.builder()
                        .email("student" + (i + 1) + "@eadms.com")
                        .password(passwordEncoder.encode("Student@123"))
                        .role(User.Role.STUDENT)
                        .isActive(true)
                        .build();
                userRepository.save(studentUser);
                
                // Calculate student ID based on class
                long classCount = studentRepository.countByClassName(classes[i]);
                String studentId = classes[i] + "-" + String.format("%03d", classCount + 1);
                
                students[i] = Student.builder()
                        .studentId(studentId)
                        .firstName(studentFirstNames[i])
                        .lastName(studentLastNames[i])
                        .className(classes[i])
                        .gender(i % 3 == 0 ? Student.Gender.MALE : (i % 3 == 1 ? Student.Gender.FEMALE : Student.Gender.OTHER))
                        .contactNumber("555-020" + String.format("%02d", i + 1))
                        .dateOfBirth(java.time.LocalDate.of(2000 + (i % 5), (i % 12) + 1, (i % 28) + 1))
                        .user(studentUser)
                        .build();
                studentRepository.save(students[i]);
            }
            log.info("✅ Created 10 students (5 TECH, 5 IT)");
            
            log.info("🎉 Sample data initialization complete!");
            log.info("📧 Login Credentials:");
            log.info("   Admin: {} / {}", adminEmail, adminPassword);
            log.info("   Teacher: teacher1@eadms.com / Teacher@123");
            log.info("   Student: student1@eadms.com / Student@123");
        };
    }
}
