package com.eadms.service;

import com.eadms.dto.request.StudentCreateRequest;
import com.eadms.dto.request.StudentUpdateRequest;
import com.eadms.dto.response.StudentResponse;
import com.eadms.entity.Student;
import com.eadms.entity.User;
import com.eadms.exception.BadRequestException;
import com.eadms.exception.ResourceNotFoundException;
import com.eadms.repository.StudentRepository;
import com.eadms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {
    
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final ModelMapper modelMapper;
    
    @Override
    @Transactional
    public StudentResponse createStudent(StudentCreateRequest request) {
        // Auto-generate class-based student ID
        String studentId = generateStudentIdByClass(request.getClassName());
        
        if (studentRepository.existsByStudentId(studentId)) {
            throw new BadRequestException("Student ID '" + studentId + "' already exists");
        }
        
        // Validate email format
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email address is required");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address '" + request.getEmail() + "' is already registered. Please use a different email.");
        }
        
        User user = authService.registerUser(request.getEmail(), request.getPassword(), User.Role.STUDENT);
        
        Student student = Student.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .studentId(studentId)
                .className(request.getClassName())
                .gender(Student.Gender.valueOf(request.getGender().toUpperCase()))
                .contactNumber(request.getContactNumber())
                .dateOfBirth(request.getDateOfBirth())
                .user(user)
                .build();
        
        Student savedStudent = studentRepository.save(student);
        return mapToResponse(savedStudent);
    }
    
    @Override
    @Transactional
    public StudentResponse updateStudent(Long id, StudentUpdateRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        
        // Update student details (email and password are not updated here)
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setClassName(request.getClassName());
        student.setGender(Student.Gender.valueOf(request.getGender().toUpperCase()));
        student.setContactNumber(request.getContactNumber());
        student.setDateOfBirth(request.getDateOfBirth());
        
        Student updatedStudent = studentRepository.save(student);
        return mapToResponse(updatedStudent);
    }
    
    @Override
    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        
        // Get the associated user before deleting the student
        User user = student.getUser();
        
        try {
            // Delete the student first (this will handle cascading to marks, attendance, enrollments)
            studentRepository.delete(student);
            
            // Then delete the associated user
            if (user != null) {
                userRepository.delete(user);
            }
        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("Error deleting student with ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete student: " + e.getMessage(), e);
        }
    }
    
    @Override
    public StudentResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        return mapToResponse(student);
    }
    
    @Override
    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<StudentResponse> getStudentsByClass(String className) {
        return studentRepository.findByClassName(className).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<StudentResponse> getStudentsByCourse(Long courseId) {
        return studentRepository.findStudentsByCourseId(courseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public Long getTotalStudentCount() {
        return studentRepository.countAllStudents();
    }
    
    @Override
    public StudentResponse getStudentByUserId(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user"));
        return mapToResponse(student);
    }
    
    private StudentResponse mapToResponse(Student student) {
        return StudentResponse.builder()
                .id(student.getId())
                .userId(student.getUser().getId())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .fullName(student.getFullName())
                .studentId(student.getStudentId())
                .className(student.getClassName())
                .gender(student.getGender().name())
                .contactNumber(student.getContactNumber())
                .dateOfBirth(student.getDateOfBirth())
                .email(student.getUser().getEmail())
                .isActive(student.getUser().getIsActive())
                .build();
    }
    
    private String generateStudentIdByClass(String className) {
        // Count students in the specific class
        long count = studentRepository.countByClassName(className);
        // Extract abbreviation from className (e.g., "Computer Science" -> "CSE")
        String classAbbr = getClassAbbreviation(className);
        // Format: CSE-001, ECE-002, etc.
        return String.format("%s-%03d", classAbbr, count + 1);
    }
    
    private String getClassAbbreviation(String className) {
        // Map common class names to abbreviations
        // You can expand this based on your needs
        return switch (className.toUpperCase()) {
            case "CSE", "COMPUTER SCIENCE", "COMPUTER SCIENCE ENGINEERING" -> "CSE";
            case "ECE", "ELECTRONICS", "ELECTRONICS AND COMMUNICATION", "ELECTRONICS AND COMMUNICATION ENGINEERING" -> "ECE";
            case "ISE", "INFORMATION SCIENCE", "INFORMATION SCIENCE ENGINEERING" -> "ISE";
            case "MECH", "MECHANICAL", "MECHANICAL ENGINEERING" -> "MECH";
            case "RA", "ROBOTICS AND AUTOMATION", "ROBOTICS" -> "RA";
            case "AIML", "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING", "AI AND ML" -> "AIML";
            default -> className.replaceAll("[^A-Z]", "").substring(0, Math.min(4, className.replaceAll("[^A-Z]", "").length()));
        };
    }
    
    public String getNextStudentId(String className) {
        return generateStudentIdByClass(className);
    }
}
