package com.eadms.repository;

import com.eadms.entity.Enrollment;
import com.eadms.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    
    // Find all enrollments for a student
    List<Enrollment> findByStudentId(Long studentId);
    
    // Find all enrollments for a course
    List<Enrollment> findByCourseId(Long courseId);
    
    // Find active enrollments for a student
    List<Enrollment> findByStudentIdAndStatus(Long studentId, Enrollment.EnrollmentStatus status);
    
    // Find enrollments for a student in a specific semester
    List<Enrollment> findByStudentIdAndSemesterAndAcademicYear(Long studentId, Integer semester, Integer academicYear);
    
    // Find active enrollments for current semester
    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId AND e.status = 'ACTIVE' AND e.academicYear = :academicYear AND e.semester = :semester")
    List<Enrollment> findActiveEnrollmentsForCurrentSemester(@Param("studentId") Long studentId, @Param("academicYear") Integer academicYear, @Param("semester") Integer semester);
    
    // Check if student is already enrolled in a course
    Optional<Enrollment> findByStudentIdAndCourseIdAndSemesterAndAcademicYear(Long studentId, Long courseId, Integer semester, Integer academicYear);
    
    // Check if enrollment exists
    boolean existsByStudentIdAndCourseIdAndStatus(Long studentId, Long courseId, Enrollment.EnrollmentStatus status);
    
    // Get all courses a student is enrolled in
    @Query("SELECT e.course FROM Enrollment e WHERE e.student.id = :studentId AND e.status = :status")
    List<Course> findCoursesByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") Enrollment.EnrollmentStatus status);
    
    // Get all courses a student is currently enrolled in (ACTIVE)
    @Query("SELECT e.course FROM Enrollment e WHERE e.student.id = :studentId AND e.status = 'ACTIVE'")
    List<Course> findActiveCoursesByStudentId(@Param("studentId") Long studentId);
    
    // Count active enrollments for a student
    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.student.id = :studentId AND e.status = 'ACTIVE'")
    Long countActiveEnrollmentsByStudentId(@Param("studentId") Long studentId);
    
    // Count students enrolled in a course
    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course.id = :courseId AND e.status = 'ACTIVE'")
    Long countActiveEnrollmentsByCourseId(@Param("courseId") Long courseId);
    
    // Calculate total credits for active enrollments
    @Query("SELECT COALESCE(SUM(e.course.credits), 0) FROM Enrollment e WHERE e.student.id = :studentId AND e.status = 'ACTIVE'")
    Integer calculateTotalCreditsByStudentId(@Param("studentId") Long studentId);
    
    // Get completed enrollments with grades for GPA calculation
    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId AND e.status = 'COMPLETED' AND e.gradePoints IS NOT NULL")
    List<Enrollment> findCompletedEnrollmentsWithGrades(@Param("studentId") Long studentId);
    
    // Get enrollment statistics by status
    @Query("SELECT e.status, COUNT(e) FROM Enrollment e WHERE e.student.id = :studentId GROUP BY e.status")
    List<Object[]> countEnrollmentsByStatus(@Param("studentId") Long studentId);
    
    // Find all students enrolled in a specific course
    @Query("SELECT e.student FROM Enrollment e WHERE e.course.id = :courseId AND e.status = 'ACTIVE'")
    List<com.eadms.entity.Student> findActiveStudentsByCourseId(@Param("courseId") Long courseId);
}
