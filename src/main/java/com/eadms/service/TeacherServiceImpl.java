package com.eadms.service;

import com.eadms.dto.request.TeacherCreateRequest;
import com.eadms.dto.response.TeacherResponse;
import com.eadms.entity.Course;
import com.eadms.entity.Teacher;
import com.eadms.entity.User;
import com.eadms.exception.BadRequestException;
import com.eadms.exception.ResourceNotFoundException;
import com.eadms.repository.CourseRepository;
import com.eadms.repository.ScheduleRepository;
import com.eadms.repository.TeacherRepository;
import com.eadms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeacherServiceImpl implements TeacherService {
    
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final CourseRepository courseRepository;
    private final ScheduleRepository scheduleRepository;
    
    @Override
    @Transactional
    public TeacherResponse createTeacher(TeacherCreateRequest request) {
        // Auto-generate department-based teacher ID
        String teacherId = generateTeacherIdByDepartment(request.getDepartment());
        
        if (teacherRepository.existsByTeacherId(teacherId)) {
            throw new BadRequestException("Teacher ID '" + teacherId + "' already exists");
        }
        
        // Validate email format
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email address is required");
        }
        
        // Check if email already exists in User table
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address '" + request.getEmail() + "' is already registered. Please use a different email.");
        }
        
        if (teacherRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' already exists in teacher records");
        }
        
        User user = authService.registerUser(request.getEmail(), request.getPassword(), User.Role.TEACHER);
        
        Teacher teacher = Teacher.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .teacherId(teacherId)
                .department(request.getDepartment())
                .email(request.getEmail())
                .contactNumber(request.getContactNumber())
                .user(user)
                .build();
        
        Teacher savedTeacher = teacherRepository.save(teacher);
        return mapToResponse(savedTeacher);
    }
    
    @Override
    @Transactional
    public TeacherResponse updateTeacher(Long id, TeacherCreateRequest request) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        
        if (!teacher.getTeacherId().equals(request.getTeacherId()) && 
            teacherRepository.existsByTeacherId(request.getTeacherId())) {
            throw new BadRequestException("Teacher ID already exists");
        }
        
        teacher.setFirstName(request.getFirstName());
        teacher.setLastName(request.getLastName());
        teacher.setTeacherId(request.getTeacherId());
        teacher.setDepartment(request.getDepartment());
        teacher.setEmail(request.getEmail());
        teacher.setContactNumber(request.getContactNumber());
        
        Teacher updatedTeacher = teacherRepository.save(teacher);
        return mapToResponse(updatedTeacher);
    }
    
    @Override
    @Transactional
    public void deleteTeacher(Long id) {
        log.info("Starting deletion of teacher with ID: {}", id);
        
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        
        log.info("Found teacher: {} {} (ID: {}, TeacherID: {})", 
                teacher.getFirstName(), teacher.getLastName(), teacher.getId(), teacher.getTeacherId());
        
        // Get the associated user before deleting the teacher
        User user = teacher.getUser();
        log.info("Associated user ID: {}, Email: {}", user != null ? user.getId() : "null", user != null ? user.getEmail() : "null");
        
        try {
            // Check if teacher has course assignments
            int courseCount = teacher.getCourses() != null ? teacher.getCourses().size() : 0;
            log.info("Teacher is assigned to {} courses", courseCount);
            
            // Step 1: Delete all schedules for this teacher
            log.info("Deleting all schedules for teacher...");
            scheduleRepository.deleteByTeacherId(id);
            scheduleRepository.flush();
            log.info("Successfully deleted teacher schedules");
            
            // Step 2: Remove teacher from all course assignments
            log.info("Removing teacher from all course assignments...");
            teacherRepository.removeTeacherFromAllCourses(id);
            teacherRepository.flush();
            log.info("Successfully removed teacher from course assignments");
            
            // Step 3: Delete the teacher entity
            log.info("Deleting teacher entity...");
            teacherRepository.delete(teacher);
            teacherRepository.flush();
            log.info("Successfully deleted teacher entity");
            
            // Step 4: Delete the associated user
            if (user != null) {
                log.info("Deleting associated user...");
                userRepository.delete(user);
                userRepository.flush();
                log.info("Successfully deleted associated user");
            }
            
            log.info("Teacher deletion completed successfully for ID: {}", id);
            
        } catch (Exception e) {
            // Log the actual error for debugging in production
            log.error("Error deleting teacher with ID {}: {}", id, e.getMessage(), e);
            
            // Re-throw with more specific error message
            throw new RuntimeException("Failed to delete teacher. This may be due to existing course assignments or database constraints. Error: " + e.getMessage(), e);
        }
    }
    
    @Override
    public TeacherResponse getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        return mapToResponse(teacher);
    }
    
    @Override
    public List<TeacherResponse> getAllTeachers() {
        return teacherRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public Long getTotalTeacherCount() {
        return teacherRepository.countAllTeachers();
    }
    
    @Override
    public TeacherResponse getTeacherByUserId(Long userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for user"));
        return mapToResponse(teacher);
    }
    
    private TeacherResponse mapToResponse(Teacher teacher) {
        return TeacherResponse.builder()
                .id(teacher.getId())
                .firstName(teacher.getFirstName())
                .lastName(teacher.getLastName())
                .fullName(teacher.getFullName())
                .teacherId(teacher.getTeacherId())
                .department(teacher.getDepartment())
                .email(teacher.getEmail())
                .contactNumber(teacher.getContactNumber())
                .isActive(teacher.getUser().getIsActive())
                .build();
    }
    
    private String generateTeacherIdByDepartment(String department) {
        // Count teachers in the specific department
        long count = teacherRepository.countByDepartment(department);
        // Format: CSE-001, ECE-002, etc.
        return String.format("%s-%03d", department.toUpperCase(), count + 1);
    }
    
    public String getNextTeacherId(String department) {
        return generateTeacherIdByDepartment(department);
    }
}
