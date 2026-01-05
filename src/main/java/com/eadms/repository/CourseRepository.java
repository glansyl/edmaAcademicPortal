package com.eadms.repository;

import com.eadms.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    Optional<Course> findByCourseCode(String courseCode);
    
    @Query("SELECT c FROM Course c JOIN c.teachers t WHERE t.id = :teacherId")
    List<Course> findByTeacherId(Long teacherId);
    
    List<Course> findBySemester(Integer semester);
    
    Boolean existsByCourseCode(String courseCode);
    
    @Query("SELECT COUNT(c) FROM Course c")
    Long countAllCourses();
}
