package com.eadms.controller;

import com.eadms.dto.response.ApiResponse;
import com.eadms.service.ReportService;
import com.eadms.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    
    private final ReportService reportService;
    
    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminDashboard() {
        Map<String, Object> stats = reportService.getAdminDashboardStats();
        return ResponseEntity.ok(ResponseUtil.success("Admin dashboard stats retrieved", stats));
    }
    
    @GetMapping("/teacher/{teacherId}/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTeacherDashboard(@PathVariable Long teacherId) {
        Map<String, Object> stats = reportService.getTeacherDashboardStats(teacherId);
        return ResponseEntity.ok(ResponseUtil.success("Teacher dashboard stats retrieved", stats));
    }
    
    @GetMapping("/student/{studentId}/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentDashboard(@PathVariable Long studentId) {
        Map<String, Object> stats = reportService.getStudentDashboardStats(studentId);
        return ResponseEntity.ok(ResponseUtil.success("Student dashboard stats retrieved", stats));
    }
}
