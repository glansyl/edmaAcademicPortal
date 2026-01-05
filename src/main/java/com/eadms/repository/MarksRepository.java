package com.eadms.repository;

import com.eadms.entity.Course;
import com.eadms.entity.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {
    
    List<Marks> findByStudentId(Long studentId);
    
    List<Marks> findByCourseId(Long courseId);
    
    List<Marks> findByStudentIdAndCourseId(Long studentId, Long courseId);
    
    @Query("SELECT AVG(m.marksObtained) FROM Marks m WHERE m.course.id = :courseId")
    Double findAverageMarksByCourseId(@Param("courseId") Long courseId);
    
    @Query("SELECT AVG(m.marksObtained / m.maxMarks * 100) FROM Marks m WHERE m.student.id = :studentId")
    Double findAveragePercentageByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT m FROM Marks m WHERE m.student.id = :studentId ORDER BY m.examDate DESC")
    List<Marks> findRecentMarksByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT DISTINCT m.course FROM Marks m WHERE m.student.id = :studentId")
    List<Course> findDistinctCoursesByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT m.examType, AVG(m.marksObtained / m.maxMarks * 100) FROM Marks m WHERE m.course.id = :courseId GROUP BY m.examType")
    List<Object[]> findAverageMarksByExamType(@Param("courseId") Long courseId);
}
