package com.eadms.controller;

import com.eadms.dto.ScheduleDTO;
import com.eadms.entity.Teacher;
import com.eadms.entity.User;
import com.eadms.exception.ResourceNotFoundException;
import com.eadms.exception.UnauthorizedException;
import com.eadms.repository.TeacherRepository;
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
@RequestMapping("/api/teacher/schedules")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherScheduleController {
    
    private final ScheduleService scheduleService;
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    
    @GetMapping
    public ResponseEntity<List<ScheduleDTO>> getMySchedules(Authentication authentication) {
        Teacher teacher = getCurrentTeacher(authentication);
        return ResponseEntity.ok(scheduleService.getSchedulesByTeacherId(teacher.getId()));
    }
    
    @GetMapping("/range")
    public ResponseEntity<List<ScheduleDTO>> getMySchedulesByDateRange(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        Teacher teacher = getCurrentTeacher(authentication);
        return ResponseEntity.ok(scheduleService.getTeacherSchedulesByDateRange(teacher.getId(), startDate, endDate));
    }
    
    @PostMapping
    public ResponseEntity<ScheduleDTO> createSchedule(
            Authentication authentication,
            @RequestBody ScheduleDTO scheduleDTO) {
        Teacher teacher = getCurrentTeacher(authentication);
        scheduleDTO.setTeacherId(teacher.getId());
        return ResponseEntity.ok(scheduleService.createSchedule(scheduleDTO));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ScheduleDTO> updateSchedule(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody ScheduleDTO scheduleDTO) {
        Teacher teacher = getCurrentTeacher(authentication);
        
        // Verify the schedule belongs to this teacher
        ScheduleDTO existingSchedule = scheduleService.getScheduleById(id);
        if (!existingSchedule.getTeacherId().equals(teacher.getId())) {
            throw new UnauthorizedException("You can only update your own schedules");
        }
        
        scheduleDTO.setTeacherId(teacher.getId());
        return ResponseEntity.ok(scheduleService.updateSchedule(id, scheduleDTO));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(
            Authentication authentication,
            @PathVariable Long id) {
        Teacher teacher = getCurrentTeacher(authentication);
        
        // Verify the schedule belongs to this teacher
        ScheduleDTO existingSchedule = scheduleService.getScheduleById(id);
        if (!existingSchedule.getTeacherId().equals(teacher.getId())) {
            throw new UnauthorizedException("You can only delete your own schedules");
        }
        
        scheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
    
    private Teacher getCurrentTeacher(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
    }
}