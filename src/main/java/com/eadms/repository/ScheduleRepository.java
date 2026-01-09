package com.eadms.repository;

import com.eadms.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    
    List<Schedule> findByCourseId(Long courseId);
    
    List<Schedule> findByDayOfWeek(DayOfWeek dayOfWeek);
    
    @Query("SELECT s FROM Schedule s JOIN s.course c JOIN c.teachers t WHERE t.id = :teacherId ORDER BY s.dayOfWeek, s.startTime")
    List<Schedule> findByTeacherId(@Param("teacherId") Long teacherId);
    
    @Query("SELECT DISTINCT s FROM Schedule s " +
           "JOIN s.course c " +
           "JOIN Marks m ON m.course.id = c.id " +
           "WHERE m.student.id = :studentId " +
           "ORDER BY s.dayOfWeek, s.startTime")
    List<Schedule> findByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT s FROM Schedule s WHERE s.course.id IN :courseIds ORDER BY s.dayOfWeek, s.startTime")
    List<Schedule> findByCourseIdIn(@Param("courseIds") List<Long> courseIds);
    // --- Missing method for compilation ---
    void deleteByTeacherId(Long teacherId);
}
