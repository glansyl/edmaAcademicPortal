package com.eadms.controller;

import com.eadms.dto.response.*;
import com.eadms.entity.Course;
import com.eadms.entity.User;
import com.eadms.service.*;
import com.eadms.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {
    
    private final StudentService studentService;
    private final MarksService marksService;
    private final AttendanceService attendanceService;
    private final ReportService reportService;
    private final AuthService authService;
    private final EnrollmentService enrollmentService;
    private final CourseService courseService;
    
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        User user = authService.getCurrentUser();
        StudentResponse student = studentService.getStudentByUserId(user.getId());
        Map<String, Object> stats = reportService.getStudentDashboardStats(student.getId());
        return ResponseEntity.ok(ResponseUtil.success("Dashboard stats retrieved", stats));
    }
    
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<StudentResponse>> getProfile() {
        User user = authService.getCurrentUser();
        StudentResponse student = studentService.getStudentByUserId(user.getId());
        return ResponseEntity.ok(ResponseUtil.success("Profile retrieved", student));
    }
    
    @GetMapping("/marks")
    public ResponseEntity<ApiResponse<List<MarksResponse>>> getMyMarks() {
        User user = authService.getCurrentUser();
        StudentResponse student = studentService.getStudentByUserId(user.getId());
        List<MarksResponse> marks = marksService.getMarksByStudent(student.getId());
        return ResponseEntity.ok(ResponseUtil.success("Marks retrieved", marks));
    }
    
    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getMyAttendance() {
        User user = authService.getCurrentUser();
        StudentResponse student = studentService.getStudentByUserId(user.getId());
        List<AttendanceResponse> attendance = attendanceService.getAttendanceByStudent(student.getId());
        return ResponseEntity.ok(ResponseUtil.success("Attendance retrieved", attendance));
    }
    
    @GetMapping("/attendance/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAttendanceStats() {
        User user = authService.getCurrentUser();
        StudentResponse student = studentService.getStudentByUserId(user.getId());
        Map<String, Object> stats = attendanceService.getAttendanceStats(student.getId());
        return ResponseEntity.ok(ResponseUtil.success("Attendance stats retrieved", stats));
    }
    
    @GetMapping("/gpa")
    public ResponseEntity<ApiResponse<Double>> getGPA() {
        User user = authService.getCurrentUser();
        StudentResponse student = studentService.getStudentByUserId(user.getId());
        Double gpa = enrollmentService.calculateStudentGPA(student.getId());
        return ResponseEntity.ok(ResponseUtil.success("GPA calculated", gpa));
    }
    
    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getMyCourses() {
        User user = authService.getCurrentUser();
        StudentResponse student = studentService.getStudentByUserId(user.getId());
        
        List<Course> courses = enrollmentService.getActiveCoursesByStudent(student.getId());
        List<CourseResponse> courseResponses = courses.stream()
                .map(course -> CourseResponse.builder()
                        .id(course.getId())
                        .courseCode(course.getCourseCode())
                        .courseName(course.getCourseName())
                        .semester(course.getSemester())
                        .credits(course.getCredits())
                        .description(course.getDescription())
                        .teacherIds(course.getTeachers() != null ? 
                                course.getTeachers().stream().map(t -> t.getId()).collect(java.util.stream.Collectors.toList()) : 
                                java.util.Collections.emptyList())
                        .teacherNames(course.getTeachers() != null ? 
                                course.getTeachers().stream()
                                        .map(t -> t.getFirstName() + " " + t.getLastName())
                                        .collect(java.util.stream.Collectors.toList()) : 
                                java.util.Collections.emptyList())
                        .build())
                .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(ResponseUtil.success("Courses retrieved", courseResponses));
    }
    
    @GetMapping("/enrollments")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getMyEnrollments() {
        User user = authService.getCurrentUser();
        StudentResponse student = studentService.getStudentByUserId(user.getId());
        List<EnrollmentResponse> enrollments = enrollmentService.getActiveEnrollmentsByStudent(student.getId());
        return ResponseEntity.ok(ResponseUtil.success("Enrollments retrieved", enrollments));
    }
    
    @GetMapping("/credits")
    public ResponseEntity<ApiResponse<Integer>> getTotalCredits() {
        User user = authService.getCurrentUser();
        StudentResponse student = studentService.getStudentByUserId(user.getId());
        Integer totalCredits = enrollmentService.getTotalActiveCredits(student.getId());
        return ResponseEntity.ok(ResponseUtil.success("Total credits calculated", totalCredits));
    }
    
    @GetMapping("/teachers")
    public ResponseEntity<ApiResponse<List<TeacherBasicResponse>>> getMyTeachers() {
        try {
            User user = authService.getCurrentUser();
            StudentResponse student = studentService.getStudentByUserId(user.getId());
            
            // Get active courses and extract unique teachers
            List<Course> courses = enrollmentService.getActiveCoursesByStudent(student.getId());
            
            // Use a map to ensure unique teachers by USER ID (not teacher entity ID)
            Map<Long, TeacherBasicResponse> teacherMap = new java.util.HashMap<>();
            
            for (Course course : courses) {
                if (course.getTeachers() != null && !course.getTeachers().isEmpty()) {
                    for (com.eadms.entity.Teacher teacher : course.getTeachers()) {
                        if (teacher.getUser() != null) {
                            Long userId = teacher.getUser().getId();
                            if (!teacherMap.containsKey(userId)) {
                                teacherMap.put(userId, TeacherBasicResponse.builder()
                                    .id(userId) // USER ID for messaging
                                    .teacherId(teacher.getId()) // Teacher entity ID
                                    .firstName(teacher.getFirstName())
                                    .lastName(teacher.getLastName())
                                    .fullName(teacher.getFirstName() + " " + teacher.getLastName())
                                    .email(teacher.getEmail())
                                    .department(teacher.getDepartment())
                                    .build());
                            }
                        }
                    }
                }
            }
            
            List<TeacherBasicResponse> teachers = new java.util.ArrayList<>(teacherMap.values());
            return ResponseEntity.ok(ResponseUtil.success("Teachers retrieved", teachers));
        } catch (Exception e) {
            // Return empty list if student has no enrollments or other error
            return ResponseEntity.ok(ResponseUtil.success("Teachers retrieved", new java.util.ArrayList<>()));
        }
    }
}
