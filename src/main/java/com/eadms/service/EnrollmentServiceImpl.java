package com.eadms.service;

import com.eadms.dto.request.EnrollmentRequest;
import com.eadms.dto.response.EnrollmentResponse;
import com.eadms.entity.Course;
import com.eadms.entity.Enrollment;
import com.eadms.entity.Student;
import com.eadms.exception.BadRequestException;
import com.eadms.exception.ResourceNotFoundException;
import com.eadms.repository.CourseRepository;
import com.eadms.repository.EnrollmentRepository;
import com.eadms.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {
    
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    
    @Override
    @Transactional
    public EnrollmentResponse enrollStudent(EnrollmentRequest request) {
        // Validate student exists
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));
        
        // Validate course exists
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", request.getCourseId()));
        
        // Check if already enrolled
        if (isStudentEnrolled(request.getStudentId(), request.getCourseId(), 
                request.getSemester(), request.getAcademicYear())) {
            throw new BadRequestException("Student is already enrolled in this course for the specified semester");
        }
        
        // Create enrollment
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .semester(request.getSemester())
                .academicYear(request.getAcademicYear())
                .status(Enrollment.EnrollmentStatus.ACTIVE)
                .enrollmentDate(LocalDate.now())
                .build();
        
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return mapToResponse(savedEnrollment);
    }
    
    @Override
    public List<EnrollmentResponse> getEnrollmentsByStudent(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<EnrollmentResponse> getActiveEnrollmentsByStudent(Long studentId) {
        return enrollmentRepository.findByStudentIdAndStatus(studentId, Enrollment.EnrollmentStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<Course> getActiveCoursesByStudent(Long studentId) {
        return enrollmentRepository.findActiveCoursesByStudentId(studentId);
    }
    
    @Override
    public List<EnrollmentResponse> getEnrollmentsByCourse(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public EnrollmentResponse updateEnrollmentStatus(Long enrollmentId, Enrollment.EnrollmentStatus status) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", enrollmentId));
        
        enrollment.setStatus(status);
        
        if (status == Enrollment.EnrollmentStatus.COMPLETED || 
            status == Enrollment.EnrollmentStatus.DROPPED || 
            status == Enrollment.EnrollmentStatus.WITHDRAWN) {
            enrollment.setCompletionDate(LocalDate.now());
        }
        
        Enrollment updatedEnrollment = enrollmentRepository.save(enrollment);
        return mapToResponse(updatedEnrollment);
    }
    
    @Override
    @Transactional
    public EnrollmentResponse completeEnrollment(Long enrollmentId, Double finalGrade) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", enrollmentId));
        
        enrollment.setFinalGrade(finalGrade);
        enrollment.calculateGradePoints();
        enrollment.setStatus(Enrollment.EnrollmentStatus.COMPLETED);
        enrollment.setCompletionDate(LocalDate.now());
        
        Enrollment updatedEnrollment = enrollmentRepository.save(enrollment);
        return mapToResponse(updatedEnrollment);
    }
    
    @Override
    @Transactional
    public void dropEnrollment(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", enrollmentId));
        
        enrollment.setStatus(Enrollment.EnrollmentStatus.DROPPED);
        enrollment.setCompletionDate(LocalDate.now());
        enrollmentRepository.save(enrollment);
    }
    
    @Override
    public Double calculateStudentGPA(Long studentId) {
        List<Enrollment> completedEnrollments = enrollmentRepository.findCompletedEnrollmentsWithGrades(studentId);
        
        if (completedEnrollments.isEmpty()) {
            return 0.0;
        }
        
        double totalGradePoints = 0.0;
        int totalCredits = 0;
        
        for (Enrollment enrollment : completedEnrollments) {
            int courseCredits = enrollment.getCourse().getCredits();
            totalGradePoints += enrollment.getGradePoints() * courseCredits;
            totalCredits += courseCredits;
        }
        
        return totalCredits > 0 ? totalGradePoints / totalCredits : 0.0;
    }
    
    @Override
    public Integer getTotalActiveCredits(Long studentId) {
        return enrollmentRepository.calculateTotalCreditsByStudentId(studentId);
    }
    
    @Override
    public boolean isStudentEnrolled(Long studentId, Long courseId, Integer semester, Integer academicYear) {
        return enrollmentRepository.findByStudentIdAndCourseIdAndSemesterAndAcademicYear(
                studentId, courseId, semester, academicYear
        ).isPresent();
    }
    
    private EnrollmentResponse mapToResponse(Enrollment enrollment) {
        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .studentId(enrollment.getStudent().getId())
                .studentName(enrollment.getStudent().getFullName())
                .courseId(enrollment.getCourse().getId())
                .courseName(enrollment.getCourse().getCourseName())
                .courseCode(enrollment.getCourse().getCourseCode())
                .credits(enrollment.getCourse().getCredits())
                .semester(enrollment.getSemester())
                .academicYear(enrollment.getAcademicYear())
                .status(enrollment.getStatus().name())
                .enrollmentDate(enrollment.getEnrollmentDate())
                .completionDate(enrollment.getCompletionDate())
                .finalGrade(enrollment.getFinalGrade())
                .letterGrade(enrollment.getLetterGrade())
                .gradePoints(enrollment.getGradePoints())
                .remarks(enrollment.getRemarks())
                .build();
    }
}
