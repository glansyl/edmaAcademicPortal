package com.eadms.service;

import com.eadms.dto.request.TeacherCreateRequest;
import com.eadms.dto.response.TeacherResponse;
import com.eadms.entity.Teacher;
import com.eadms.entity.User;
import com.eadms.exception.BadRequestException;
import com.eadms.exception.ResourceNotFoundException;
import com.eadms.repository.TeacherRepository;
import com.eadms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherServiceImpl implements TeacherService {
    
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    
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
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        teacherRepository.delete(teacher);
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
