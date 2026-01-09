package com.eadms.controller;

import com.eadms.dto.ScheduleDTO;
import com.eadms.entity.Student;
import com.eadms.entity.User;
import com.eadms.repository.StudentRepository;
import com.eadms.repository.UserRepository;
import com.eadms.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/student/schedules")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentScheduleController {
    
    private final ScheduleService scheduleService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    
    @GetMapping
    public ResponseEntity<List<ScheduleDTO>> getMySchedules(Authentication authentication) {
        Student student = getCurrentStudent(authentication);
        return ResponseEntity.ok(scheduleService.getSchedulesByStudentId(student.getId()));
    }
    
    @GetMapping("/range")
    public ResponseEntity<List<ScheduleDTO>> getMySchedulesByDateRange(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        Student student = getCurrentStudent(authentication);
        return ResponseEntity.ok(scheduleService.getStudentSchedulesByDateRange(student.getId(), startDate, endDate));
    }
    
    private Student getCurrentStudent(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
    }
}