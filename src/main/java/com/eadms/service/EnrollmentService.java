package com.eadms.service;

import com.eadms.dto.request.EnrollmentRequest;
import com.eadms.dto.response.EnrollmentResponse;
import com.eadms.entity.Course;
import com.eadms.entity.Enrollment;

import java.util.List;

public interface EnrollmentService {
    
    /**
     * Enroll a student in a course
     */
    EnrollmentResponse enrollStudent(EnrollmentRequest request);
    
    /**
     * Get all enrollments for a student
     */
    List<EnrollmentResponse> getEnrollmentsByStudent(Long studentId);
    
    /**
     * Get active enrollments for a student
     */
    List<EnrollmentResponse> getActiveEnrollmentsByStudent(Long studentId);
    
    /**
     * Get all active courses a student is enrolled in
     */
    List<Course> getActiveCoursesByStudent(Long studentId);
    
    /**
     * Get enrollments for a specific course
     */
    List<EnrollmentResponse> getEnrollmentsByCourse(Long courseId);
    
    /**
     * Update enrollment status
     */
    EnrollmentResponse updateEnrollmentStatus(Long enrollmentId, Enrollment.EnrollmentStatus status);
    
    /**
     * Update final grade and complete enrollment
     */
    EnrollmentResponse completeEnrollment(Long enrollmentId, Double finalGrade);
    
    /**
     * Drop a course (change status to DROPPED)
     */
    void dropEnrollment(Long enrollmentId);
    
    /**
     * Calculate student's GPA based on completed enrollments
     */
    Double calculateStudentGPA(Long studentId);
    
    /**
     * Get total credits for active enrollments
     */
    Integer getTotalActiveCredits(Long studentId);
    
    /**
     * Check if student is already enrolled in a course
     */
    boolean isStudentEnrolled(Long studentId, Long courseId, Integer semester, Integer academicYear);
}
