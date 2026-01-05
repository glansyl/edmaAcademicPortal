package com.eadms.repository;

import com.eadms.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    
    Optional<Student> findByStudentId(String studentId);
    
    List<Student> findByClassName(String className);
    
    Boolean existsByStudentId(String studentId);
    
    Long countByClassName(String className);
    
    @Query("SELECT COUNT(s) FROM Student s")
    Long countAllStudents();
    
    Optional<Student> findByUserId(Long userId);
    
    @Query("SELECT s.className, COUNT(s) FROM Student s GROUP BY s.className")
    List<Object[]> countStudentsByClass();
    
    @Query("SELECT s FROM Student s JOIN Enrollment e ON s.id = e.student.id WHERE e.course.id = :courseId AND e.status = 'ACTIVE'")
    List<Student> findStudentsByCourseId(@Param("courseId") Long courseId);
}
