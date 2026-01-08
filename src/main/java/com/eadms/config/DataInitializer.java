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
            EnrollmentRepository enrollmentRepository,
            AttendanceRepository attendanceRepository,
            MarksRepository marksRepository) {
        return args -> {
            // Check if admin user already exists
            if (userRepository.findByEmail(adminEmail).isPresent()) {
                log.info("ℹ️  Data already exists, skipping initialization");
                return;
            }
            
            log.info("🌱 Initializing fake data for local development...");
            
            // Create Admin User
            User adminUser = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(User.Role.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(adminUser);
            log.info("✅ Admin user created: {} / {}", adminEmail, adminPassword);
            
            // Create Teachers
            Teacher[] teachers = new Teacher[3];
            for (int i = 0; i < 3; i++) {
                User teacherUser = User.builder()
                        .email("teacher" + (i + 1) + "@eadms.com")
                        .password(passwordEncoder.encode("Teacher@123"))
                        .role(User.Role.TEACHER)
                        .isActive(true)
                        .build();
                userRepository.save(teacherUser);
                
                teachers[i] = Teacher.builder()
                        .teacherId("T" + String.format("%03d", i + 1))
                        .firstName(new String[]{"John", "Sarah", "Michael"}[i])
                        .lastName(new String[]{"Smith", "Johnson", "Williams"}[i])
                        .department(new String[]{"Computer Science", "Mathematics", "Physics"}[i])
                        .contactNumber("555-010" + (i + 1))
                        .email("teacher" + (i + 1) + "@eadms.com")
                        .user(teacherUser)
                        .build();
                teacherRepository.save(teachers[i]);
            }
            log.info("✅ Created 3 teachers");
            
            // Create Students
            Student[] students = new Student[15];
            String[] firstNames = {"Alice", "Bob", "Charlie", "Diana", "Emma", "Frank", "Grace", "Henry", "Ivy", "Jack", "Kate", "Liam", "Mia", "Noah", "Olivia"};
            String[] lastNames = {"Anderson", "Brown", "Clark", "Davis", "Evans", "Foster", "Green", "Harris", "Irving", "Jones", "King", "Lee", "Miller", "Nelson", "Owen"};
            String[] classes = {"CS-A", "CS-A", "CS-B", "CS-B", "CS-A", "CS-B", "CS-A", "CS-B", "CS-A", "CS-B", "CS-A", "CS-B", "CS-A", "CS-B", "CS-A"};
            
            for (int i = 0; i < 15; i++) {
                User studentUser = User.builder()
                        .email("student" + (i + 1) + "@eadms.com")
                        .password(passwordEncoder.encode("Student@123"))
                        .role(User.Role.STUDENT)
                        .isActive(true)
                        .build();
                userRepository.save(studentUser);
                
                students[i] = Student.builder()
                        .studentId("S" + String.format("%04d", i + 1))
                        .firstName(firstNames[i])
                        .lastName(lastNames[i])
                        .className(classes[i])
                        .gender(i % 3 == 0 ? Student.Gender.MALE : (i % 3 == 1 ? Student.Gender.FEMALE : Student.Gender.OTHER))
                        .contactNumber("555-020" + String.format("%02d", i + 1))
                        .dateOfBirth(java.time.LocalDate.of(2000 + (i % 5), (i % 12) + 1, (i % 28) + 1))
                        .user(studentUser)
                        .build();
                studentRepository.save(students[i]);
            }
            log.info("✅ Created 15 students");
            
            // Create Courses
            Course[] courses = new Course[5];
            String[] courseCodes = {"CS101", "CS201", "MATH101", "PHY101", "CS301"};
            String[] courseNames = {"Introduction to Programming", "Data Structures", "Calculus I", "Physics Fundamentals", "Database Systems"};
            int[] semesters = {1, 3, 1, 2, 5};
            int[] credits = {4, 4, 3, 3, 4};
            
            for (int i = 0; i < 5; i++) {
                courses[i] = Course.builder()
                        .courseCode(courseCodes[i])
                        .courseName(courseNames[i])
                        .semester(semesters[i])
                        .credits(credits[i])
                        .description("This is a comprehensive course covering " + courseNames[i].toLowerCase())
                        .build();
                courseRepository.save(courses[i]);
                
                // Assign teachers to courses
                courses[i].getTeachers().add(teachers[i % 3]);
                teachers[i % 3].getCourses().add(courses[i]);
                courseRepository.save(courses[i]);
                teacherRepository.save(teachers[i % 3]);
            }
            log.info("✅ Created 5 courses");
            
            // Create Enrollments
            int enrollmentCount = 0;
            int currentYear = java.time.LocalDate.now().getYear();
            for (int i = 0; i < students.length; i++) {
                for (int j = 0; j < 3; j++) {
                    Enrollment enrollment = Enrollment.builder()
                            .student(students[i])
                            .course(courses[j])
                            .semester(courses[j].getSemester())
                            .academicYear(currentYear)
                            .status(Enrollment.EnrollmentStatus.ACTIVE)
                            .enrollmentDate(java.time.LocalDate.now().minusDays(30))
                            .build();
                    enrollmentRepository.save(enrollment);
                    enrollmentCount++;
                }
            }
            log.info("✅ Created {} enrollments", enrollmentCount);
            
            // Create Attendance Records
            int attendanceCount = 0;
            java.time.LocalDate today = java.time.LocalDate.now();
            Attendance.Status[] statuses = {Attendance.Status.PRESENT, Attendance.Status.PRESENT, Attendance.Status.PRESENT, Attendance.Status.ABSENT, Attendance.Status.LATE, Attendance.Status.EXCUSED};
            
            for (int day = 0; day < 10; day++) {
                java.time.LocalDate date = today.minusDays(day);
                for (int i = 0; i < students.length; i++) {
                    for (int j = 0; j < 3; j++) {
                        Attendance attendance = Attendance.builder()
                                .student(students[i])
                                .course(courses[j])
                                .attendanceDate(date)
                                .status(statuses[(i + j + day) % statuses.length])
                                .build();
                        attendanceRepository.save(attendance);
                        attendanceCount++;
                    }
                }
            }
            log.info("✅ Created {} attendance records", attendanceCount);
            
            // Create Marks
            int marksCount = 0;
            Marks.ExamType[] examTypes = {Marks.ExamType.QUIZ, Marks.ExamType.ASSIGNMENT, Marks.ExamType.MIDTERM, Marks.ExamType.FINAL};
            
            for (int i = 0; i < students.length; i++) {
                for (int j = 0; j < 3; j++) {
                    for (Marks.ExamType examType : examTypes) {
                        int maxMarks = examType == Marks.ExamType.FINAL ? 100 : (examType == Marks.ExamType.MIDTERM ? 50 : 20);
                        double marksObtained = maxMarks * (0.6 + (Math.random() * 0.35));
                        
                        Marks marks = Marks.builder()
                                .student(students[i])
                                .course(courses[j])
                                .examType(examType)
                                .marksObtained(marksObtained)
                                .maxMarks((double) maxMarks)
                                .examDate(today.minusDays(15 + (examTypes.length - java.util.Arrays.asList(examTypes).indexOf(examType)) * 10))
                                .remarks(marksObtained >= maxMarks * 0.8 ? "Excellent" : (marksObtained >= maxMarks * 0.6 ? "Good" : "Needs Improvement"))
                                .build();
                        marksRepository.save(marks);
                        marksCount++;
                    }
                }
            }
            log.info("✅ Created {} marks records", marksCount);
            
            log.info("🎉 Fake data initialization complete!");
            log.info("📧 Login Credentials:");
            log.info("   Admin: {} / {}", adminEmail, adminPassword);
            log.info("   Teacher: teacher1@eadms.com / Teacher@123");
            log.info("   Student: student1@eadms.com / Student@123");
        };
    }
}