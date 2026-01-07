package com.eadms.controller;

import com.eadms.dto.request.CourseCreateRequest;
import com.eadms.dto.request.StudentCreateRequest;
import com.eadms.dto.request.StudentUpdateRequest;
import com.eadms.dto.request.TeacherCreateRequest;
import com.eadms.dto.request.UserUpdateRequest;
import com.eadms.dto.response.*;
import com.eadms.service.*;
import com.eadms.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    
    private final StudentService studentService;
    private final TeacherService teacherService;
    private final CourseService courseService;
    private final ReportService reportService;
    private final AuthService authService;
    
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = reportService.getAdminDashboardStats();
        return ResponseEntity.ok(ResponseUtil.success("Dashboard stats retrieved", stats));
    }
    
    // Student endpoints
    @PostMapping("/students")
    public ResponseEntity<ApiResponse<StudentResponse>> createStudent(@Valid @RequestBody StudentCreateRequest request) {
        StudentResponse response = studentService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseUtil.success("Student created successfully", response));
    }
    
    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getAllStudents() {
        List<StudentResponse> students = studentService.getAllStudents();
        return ResponseEntity.ok(ResponseUtil.success("Students retrieved", students));
    }
    
    @GetMapping("/students/next-id")
    public ResponseEntity<ApiResponse<Map<String, String>>> getNextStudentId(@RequestParam String className) {
        String nextId = studentService.getNextStudentId(className);
        Map<String, String> response = new HashMap<>();
        response.put("studentId", nextId);
        return ResponseEntity.ok(ResponseUtil.success("Next student ID generated", response));
    }
    
    @GetMapping("/students/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudentById(@PathVariable Long id) {
        StudentResponse student = studentService.getStudentById(id);
        return ResponseEntity.ok(ResponseUtil.success("Student retrieved", student));
    }
    
    @PutMapping("/students/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentUpdateRequest request) {
        StudentResponse response = studentService.updateStudent(id, request);
        return ResponseEntity.ok(ResponseUtil.success("Student updated successfully", response));
    }
    
    @DeleteMapping("/students/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ResponseUtil.success("Student deleted successfully", null));
    }
    
    // Teacher endpoints
    @PostMapping("/teachers")
    public ResponseEntity<ApiResponse<TeacherResponse>> createTeacher(@Valid @RequestBody TeacherCreateRequest request) {
        TeacherResponse response = teacherService.createTeacher(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseUtil.success("Teacher created successfully", response));
    }
    
    @GetMapping("/teachers")
    public ResponseEntity<ApiResponse<List<TeacherResponse>>> getAllTeachers() {
        List<TeacherResponse> teachers = teacherService.getAllTeachers();
        return ResponseEntity.ok(ResponseUtil.success("Teachers retrieved", teachers));
    }
    
    @GetMapping("/teachers/next-id")
    public ResponseEntity<ApiResponse<Map<String, String>>> getNextTeacherId(@RequestParam String department) {
        String nextId = teacherService.getNextTeacherId(department);
        Map<String, String> response = new HashMap<>();
        response.put("teacherId", nextId);
        return ResponseEntity.ok(ResponseUtil.success("Next teacher ID generated", response));
    }
    
    @PutMapping("/teachers/{id}")
    public ResponseEntity<ApiResponse<TeacherResponse>> updateTeacher(
            @PathVariable Long id,
            @Valid @RequestBody TeacherCreateRequest request) {
        TeacherResponse response = teacherService.updateTeacher(id, request);
        return ResponseEntity.ok(ResponseUtil.success("Teacher updated successfully", response));
    }
    
    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.ok(ResponseUtil.success("Teacher deleted successfully", null));
    }
    
    // Course endpoints
    @PostMapping("/courses")
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(@Valid @RequestBody CourseCreateRequest request) {
        CourseResponse response = courseService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseUtil.success("Course created successfully", response));
    }
    
    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getAllCourses() {
        List<CourseResponse> courses = courseService.getAllCourses();
        return ResponseEntity.ok(ResponseUtil.success("Courses retrieved", courses));
    }
    
    @PutMapping("/courses/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseCreateRequest request) {
        CourseResponse response = courseService.updateCourse(id, request);
        return ResponseEntity.ok(ResponseUtil.success("Course updated successfully", response));
    }
    
    @PutMapping("/courses/{courseId}/assign-teacher/{teacherId}")
    public ResponseEntity<ApiResponse<CourseResponse>> assignTeacher(
            @PathVariable Long courseId,
            @PathVariable Long teacherId) {
        CourseResponse response = courseService.assignTeacher(courseId, teacherId);
        return ResponseEntity.ok(ResponseUtil.success("Teacher assigned successfully", response));
    }
    
    @PutMapping("/courses/{courseId}/assign-teachers")
    public ResponseEntity<ApiResponse<CourseResponse>> assignTeachers(
            @PathVariable Long courseId,
            @RequestBody List<Long> teacherIds) {
        CourseResponse response = courseService.assignTeachers(courseId, teacherIds);
        return ResponseEntity.ok(ResponseUtil.success("Teachers assigned successfully", response));
    }
    
    @DeleteMapping("/courses/{courseId}/remove-teacher/{teacherId}")
    public ResponseEntity<ApiResponse<CourseResponse>> removeTeacher(
            @PathVariable Long courseId,
            @PathVariable Long teacherId) {
        CourseResponse response = courseService.removeTeacher(courseId, teacherId);
        return ResponseEntity.ok(ResponseUtil.success("Teacher removed successfully", response));
    }
    
    @DeleteMapping("/courses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ResponseUtil.success("Course deleted successfully", null));
    }
    
    // User management endpoints (Admin only)
    @PutMapping("/users/student/{studentId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> updateStudentUser(
            @PathVariable Long studentId,
            @Valid @RequestBody UserUpdateRequest request) {
        authService.updateStudentUser(studentId, request);
        return ResponseEntity.ok(ResponseUtil.success("Student user updated successfully", 
            Map.of("message", "Email and/or password updated successfully")));
    }
    
    @PutMapping("/users/teacher/{teacherId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> updateTeacherUser(
            @PathVariable Long teacherId,
            @Valid @RequestBody UserUpdateRequest request) {
        authService.updateTeacherUser(teacherId, request);
        return ResponseEntity.ok(ResponseUtil.success("Teacher user updated successfully", 
            Map.of("message", "Email and/or password updated successfully")));
    }
}
