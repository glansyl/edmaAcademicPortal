package com.eadms.controller;

import com.eadms.dto.request.AttendanceEntryRequest;
import com.eadms.dto.request.MarksEntryRequest;
import com.eadms.dto.response.*;
import com.eadms.entity.User;
import com.eadms.service.*;
import com.eadms.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@Slf4j
public class TeacherController {
    
    private final TeacherService teacherService;
    private final CourseService courseService;
    private final MarksService marksService;
    private final AttendanceService attendanceService;
    private final ReportService reportService;
    private final AuthService authService;
    private final StudentService studentService;
    
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        User user = authService.getCurrentUser();
        TeacherResponse teacher = teacherService.getTeacherByUserId(user.getId());
        Map<String, Object> stats = reportService.getTeacherDashboardStats(teacher.getId());
        return ResponseEntity.ok(ResponseUtil.success("Dashboard stats retrieved", stats));
    }
    
    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getMyCourses() {
        User user = authService.getCurrentUser();
        TeacherResponse teacher = teacherService.getTeacherByUserId(user.getId());
        List<CourseResponse> courses = courseService.getCoursesByTeacher(teacher.getId());
        return ResponseEntity.ok(ResponseUtil.success("Courses retrieved", courses));
    }
    
    @PostMapping("/marks")
    public ResponseEntity<ApiResponse<MarksResponse>> enterMarks(@Valid @RequestBody MarksEntryRequest request) {
        MarksResponse response = marksService.enterMarks(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseUtil.success("Marks entered successfully", response));
    }
    
    @PutMapping("/marks/{id}")
    public ResponseEntity<ApiResponse<MarksResponse>> updateMarks(
            @PathVariable Long id,
            @Valid @RequestBody MarksEntryRequest request) {
        MarksResponse response = marksService.updateMarks(id, request);
        return ResponseEntity.ok(ResponseUtil.success("Marks updated successfully", response));
    }
    
    @GetMapping("/marks/course/{courseId}")
    public ResponseEntity<ApiResponse<List<MarksResponse>>> getMarksByCourse(@PathVariable Long courseId) {
        log.info("Fetching marks for course ID: {} via API", courseId);
        List<MarksResponse> marks = marksService.getMarksByCourse(courseId);
        log.info("Returning {} marks records for course ID: {}", marks.size(), courseId);
        
        // Log first few records for debugging
        marks.stream().limit(3).forEach(mark -> 
            log.info("Sample mark - ID: {}, Student: '{}' ({}), Course: {}", 
                    mark.getId(), mark.getStudentName(), mark.getStudentCode(), mark.getCourseName())
        );
        
        return ResponseEntity.ok(ResponseUtil.success("Marks retrieved", marks));
    }
    
    @PostMapping("/attendance")
    public ResponseEntity<ApiResponse<AttendanceResponse>> markAttendance(
            @Valid @RequestBody AttendanceEntryRequest request) {
        AttendanceResponse response = attendanceService.markAttendance(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseUtil.success("Attendance marked successfully", response));
    }
    
    @PutMapping("/attendance/{id}")
    public ResponseEntity<ApiResponse<AttendanceResponse>> updateAttendance(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceEntryRequest request) {
        AttendanceResponse response = attendanceService.updateAttendance(id, request);
        return ResponseEntity.ok(ResponseUtil.success("Attendance updated successfully", response));
    }
    
    @GetMapping("/attendance/course/{courseId}")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAttendanceByCourse(@PathVariable Long courseId) {
        List<AttendanceResponse> attendance = attendanceService.getAttendanceByCourse(courseId);
        return ResponseEntity.ok(ResponseUtil.success("Attendance retrieved", attendance));
    }
    
    @GetMapping("/course/{courseId}/average")
    public ResponseEntity<ApiResponse<Double>> getCourseAverage(@PathVariable Long courseId) {
        Double average = marksService.calculateAverageMarks(courseId);
        return ResponseEntity.ok(ResponseUtil.success("Average calculated", average));
    }
    
    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getAllStudents() {
        List<StudentResponse> students = studentService.getAllStudents();
        return ResponseEntity.ok(ResponseUtil.success("Students retrieved", students));
    }
    
    @GetMapping("/course/{courseId}/students")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getStudentsByCourse(@PathVariable Long courseId) {
        List<StudentResponse> students = studentService.getStudentsByCourse(courseId);
        return ResponseEntity.ok(ResponseUtil.success("Students retrieved for course", students));
    }
    
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<TeacherResponse>> getMyProfile() {
        User user = authService.getCurrentUser();
        TeacherResponse teacher = teacherService.getTeacherByUserId(user.getId());
        return ResponseEntity.ok(ResponseUtil.success("Profile retrieved", teacher));
    }
}
