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

import java.time.LocalDate;
import java.util.List;

/**
 * Data Initializer - Creates sample data for demonstration
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
    
    @Value("${app.initialize.sample-data:false}")
    private boolean initializeSampleData;
    
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
            
            // Initialize sample data if enabled
            if (initializeSampleData) {
                log.info("🌱 Initializing sample data...");
                initializeSampleData(userRepository, teacherRepository, studentRepository, courseRepository, enrollmentRepository);
            } else {
                log.info("ℹ️  Sample data initialization is disabled. Use the admin panel to add data or set app.initialize.sample-data=true");
            }
        };
    }
    
    private void initializeSampleData(
            UserRepository userRepository,
            TeacherRepository teacherRepository,
            StudentRepository studentRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository) {
        
        log.info("👨‍🏫 Creating sample teachers...");
        
        // Create Teachers
        String[][] teacherData = {
            {"Anand", "Rao", "CSE", "anand.rao@college.edu", "9811111111"},
            {"Emily", "Carter", "ECE", "emily.carter@college.edu", "9822222222"},
            {"Hiroshi", "Tanaka", "ISE", "hiroshi.tanaka@college.edu", "9833333333"},
            {"Maria", "Gonzalez", "MECH", "maria.gonzalez@college.edu", "9844444444"},
            {"Omar", "Al-Khalid", "RA", "omar.khalid@college.edu", "9855555555"},
            {"Chen", "Wei", "AIML", "chen.wei@college.edu", "9866666666"},
            {"James", "Wilson", "CSE", "james.wilson@college.edu", "9877777777"},
            {"Sofia", "Rossi", "ECE", "sofia.rossi@college.edu", "9888888888"},
            {"Ahmed", "Hassan", "ISE", "ahmed.hassan@college.edu", "9899999999"},
            {"Laura", "Schmidt", "MECH", "laura.schmidt@college.edu", "9800000000"}
        };
        
        for (String[] data : teacherData) {
            User teacherUser = User.builder()
                    .email(data[3])
                    .password(passwordEncoder.encode("teacher@123"))
                    .role(User.Role.TEACHER)
                    .isActive(true)
                    .build();
            userRepository.save(teacherUser);
            
            Teacher teacher = Teacher.builder()
                    .firstName(data[0])
                    .lastName(data[1])
                    .department(data[2])
                    .contactNumber(data[4])
                    .user(teacherUser)
                    .build();
            teacherRepository.save(teacher);
        }
        
        log.info("👨‍🎓 Creating sample students...");
        
        // Create Students
        String[][] studentData = {
            {"Aarav", "Sharma", "CSE", "Male", "12/03/2003", "9876543210", "aarav.sharma@college.edu"},
            {"Emily", "Carter", "ECE", "Female", "21/06/2002", "9123456780", "emily.carter@college.edu"},
            {"Mohammed", "Al-Fayed", "ISE", "Male", "09/11/2003", "9234567810", "mohammed.fayed@college.edu"},
            {"Yuki", "Tanaka", "AIML", "Female", "18/01/2004", "9345678120", "yuki.tanaka@college.edu"},
            {"Lucas", "Martinez", "MECH", "Male", "30/05/2002", "9456781230", "lucas.martinez@college.edu"},
            {"Amina", "Hassan", "CSE", "Female", "14/09/2003", "9567812340", "amina.hassan@college.edu"},
            {"Ivan", "Petrov", "RA", "Male", "02/02/2003", "9678123450", "ivan.petrov@college.edu"},
            {"Sofia", "Rossi", "ECE", "Female", "21/06/2004", "9781234560", "sofia.rossi@college.edu"},
            {"Wei", "Zhang", "ISE", "Male", "11/12/2002", "9892345671", "wei.zhang@college.edu"},
            {"Ana", "Silva", "AIML", "Female", "07/08/2003", "9812345672", "ana.silva@college.edu"},
            {"James", "OConnor", "MECH", "Male", "16/04/2002", "9823456783", "james.oconnor@college.edu"},
            {"Noura", "Al-Sabah", "CSE", "Female", "28/10/2003", "9834567894", "noura.sabah@college.edu"},
            {"Daniel", "Muller", "RA", "Male", "03/01/2004", "9845678905", "daniel.muller@college.edu"},
            {"Grace", "Kim", "ECE", "Female", "19/07/2002", "9856789016", "grace.kim@college.edu"},
            {"Samuel", "Johnson", "ISE", "Male", "25/09/2003", "9867890127", "samuel.johnson@college.edu"}
        };
        
        for (int i = 0; i < studentData.length; i++) {
            String[] data = studentData[i];
            User studentUser = User.builder()
                    .email(data[6])
                    .password(passwordEncoder.encode("student@123"))
                    .role(User.Role.STUDENT)
                    .isActive(true)
                    .build();
            userRepository.save(studentUser);
            
            // Parse date
            String[] dateParts = data[4].split("/");
            LocalDate dateOfBirth = LocalDate.of(
                Integer.parseInt(dateParts[2]), // year
                Integer.parseInt(dateParts[1]), // month
                Integer.parseInt(dateParts[0])  // day
            );
            
            Student student = Student.builder()
                    .firstName(data[0])
                    .lastName(data[1])
                    .studentId(String.format("%s%03d", data[2], i + 1))
                    .className(data[2])
                    .gender(Student.Gender.valueOf(data[3].toUpperCase()))
                    .dateOfBirth(dateOfBirth)
                    .contactNumber(data[5])
                    .user(studentUser)
                    .build();
            studentRepository.save(student);
        }
        
        log.info("📚 Creating sample courses...");
        
        // Create Courses
        String[][] courseData = {
            {"CSE101", "Programming Fundamentals", "1
}

