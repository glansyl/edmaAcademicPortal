package com.eadms.repository;

import com.eadms.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    
    Optional<Teacher> findByTeacherId(String teacherId);
    
    List<Teacher> findByDepartment(String department);
    
    Boolean existsByTeacherId(String teacherId);
    
    Boolean existsByEmail(String email);
    
    Long countByDepartment(String department);
    
    @Query("SELECT COUNT(t) FROM Teacher t")
    Long countAllTeachers();
    
    Optional<Teacher> findByUserId(Long userId);
    
    @Query("SELECT t.department, COUNT(t) FROM Teacher t GROUP BY t.department")
    List<Object[]> countTeachersByDepartment();
    
    // Custom query to remove teacher from course_teachers junction table
    @Modifying
    @Query(value = "DELETE FROM course_teachers WHERE teacher_id = :teacherId", nativeQuery = true)
    void removeTeacherFromAllCourses(@Param("teacherId") Long teacherId);
}
