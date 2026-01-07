package com.eadms.controller;

import com.eadms.dto.response.ApiResponse;
import com.eadms.repository.*;
import com.eadms.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

/**
 * Diagnostic Controller - Helps debug database connection issues
 * REMOVE THIS IN PRODUCTION!
 */
@RestController
@RequestMapping("/api/diagnostic")
@RequiredArgsConstructor
public class DiagnosticController {
    
    private final DataSource dataSource;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final Environment environment;
    
    @Value("${spring.datasource.url:NOT_SET}")
    private String datasourceUrl;
    
    @GetMapping("/database-info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDatabaseInfo() {
        Map<String, Object> info = new HashMap<>();
        
        try {
            // Get active profile
            String[] activeProfiles = environment.getActiveProfiles();
            info.put("activeProfiles", activeProfiles.length > 0 ? String.join(", ", activeProfiles) : "NONE");
            
            // Get datasource URL (sanitized)
            info.put("datasourceUrl", sanitizeUrl(datasourceUrl));
            
            // Get actual database connection info
            try (Connection conn = dataSource.getConnection()) {
                info.put("databaseProductName", conn.getMetaData().getDatabaseProductName());
                info.put("databaseProductVersion", conn.getMetaData().getDatabaseProductVersion());
                info.put("databaseURL", sanitizeUrl(conn.getMetaData().getURL()));
                info.put("databaseUsername", conn.getMetaData().getUserName());
            }
            
            // Get counts from database
            info.put("userCount", userRepository.count());
            info.put("teacherCount", teacherRepository.count());
            info.put("studentCount", studentRepository.count());
            info.put("courseCount", courseRepository.count());
            
            // Check if using custom count methods
            info.put("teacherCountCustom", teacherRepository.countAllTeachers());
            info.put("studentCountCustom", studentRepository.countAllStudents());
            info.put("courseCountCustom", courseRepository.countAllCourses());
            
            info.put("status", "SUCCESS");
            
        } catch (Exception e) {
            info.put("status", "ERROR");
            info.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(ResponseUtil.success("Database diagnostic info", info));
    }
    
    private String sanitizeUrl(String url) {
        if (url == null || url.equals("NOT_SET")) {
            return url;
        }
        // Hide password in URL
        return url.replaceAll("://([^:]+):([^@]+)@", "://$1:****@");
    }
}
