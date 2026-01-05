package com.eadms.controller;

import com.eadms.dto.request.EnrollmentRequest;
import com.eadms.dto.response.ApiResponse;
import com.eadms.dto.response.EnrollmentResponse;
import com.eadms.entity.Enrollment;
import com.eadms.service.EnrollmentService;
import com.eadms.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/enrollments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class EnrollmentController {
    
    private final EnrollmentService enrollmentService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<EnrollmentResponse>> enrollStudent(@Valid @RequestBody EnrollmentRequest request) {
        EnrollmentResponse enrollment = enrollmentService.enrollStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseUtil.success("Student enrolled successfully", enrollment));
    }
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getStudentEnrollments(@PathVariable Long studentId) {
        List<EnrollmentResponse> enrollments = enrollmentService.getEnrollmentsByStudent(studentId);
        return ResponseEntity.ok(ResponseUtil.success("Enrollments retrieved", enrollments));
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getCourseEnrollments(@PathVariable Long courseId) {
        List<EnrollmentResponse> enrollments = enrollmentService.getEnrollmentsByCourse(courseId);
        return ResponseEntity.ok(ResponseUtil.success("Enrollments retrieved", enrollments));
    }
    
    @PutMapping("/{enrollmentId}/status")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> updateEnrollmentStatus(
            @PathVariable Long enrollmentId,
            @RequestParam String status) {
        Enrollment.EnrollmentStatus enrollmentStatus = Enrollment.EnrollmentStatus.valueOf(status.toUpperCase());
        EnrollmentResponse enrollment = enrollmentService.updateEnrollmentStatus(enrollmentId, enrollmentStatus);
        return ResponseEntity.ok(ResponseUtil.success("Enrollment status updated", enrollment));
    }
    
    @PutMapping("/{enrollmentId}/complete")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> completeEnrollment(
            @PathVariable Long enrollmentId,
            @RequestParam Double finalGrade) {
        EnrollmentResponse enrollment = enrollmentService.completeEnrollment(enrollmentId, finalGrade);
        return ResponseEntity.ok(ResponseUtil.success("Enrollment completed", enrollment));
    }
    
    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<ApiResponse<Void>> dropEnrollment(@PathVariable Long enrollmentId) {
        enrollmentService.dropEnrollment(enrollmentId);
        return ResponseEntity.ok(ResponseUtil.success("Enrollment dropped", null));
    }
}
