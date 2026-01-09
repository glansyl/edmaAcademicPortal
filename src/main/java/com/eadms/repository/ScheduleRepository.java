package com.eadms.repository;

import com.eadms.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    
    List<Schedule> findByCourseId(Long courseId);
    
    List<Schedule> findByDayOfWeek(DayOfWeek dayOfWeek);
    
    List<Schedule> findByTeacherId(Long teacherId);
    
    @Query("SELECT s FROM Schedule s WHERE s.teacher.id = :teacherId ORDER BY s.startDateTime")
    List<Schedule> findByTeacherIdOrderByStartDateTime(@Param("teacherId") Long teacherId);
    
    @Query("SELECT DISTINCT s FROM Schedule s " +
           "JOIN Enrollment e ON e.course.id = s.course.id " +
           "WHERE e.student.id = :studentId AND e.status = 'ACTIVE' " +
           "ORDER BY s.startDateTime")
    List<Schedule> findByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT s FROM Schedule s WHERE s.course.id IN :courseIds ORDER BY s.startDateTime")
    List<Schedule> findByCourseIdIn(@Param("courseIds") List<Long> courseIds);
    
    @Query("SELECT s FROM Schedule s WHERE s.teacher.id = :teacherId " +
           "AND s.startDateTime >= :startDate AND s.startDateTime <= :endDate " +
           "ORDER BY s.startDateTime")
    List<Schedule> findByTeacherIdAndDateRange(@Param("teacherId") Long teacherId,
                                               @Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT DISTINCT s FROM Schedule s " +
           "JOIN Enrollment e ON e.course.id = s.course.id " +
           "WHERE e.student.id = :studentId AND e.status = 'ACTIVE' " +
           "AND s.startDateTime >= :startDate AND s.startDateTime <= :endDate " +
           "ORDER BY s.startDateTime")
    List<Schedule> findByStudentIdAndDateRange(@Param("studentId") Long studentId,
                                               @Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT s FROM Schedule s WHERE s.teacher.id = :teacherId " +
           "AND s.startDateTime < :endDateTime AND s.endDateTime > :startDateTime")
    List<Schedule> findConflictingSchedules(@Param("teacherId") Long teacherId,
                                            @Param("startDateTime") LocalDateTime startDateTime,
                                            @Param("endDateTime") LocalDateTime endDateTime);
    
    // Delete all schedules for a specific teacher
    @Modifying
    @Query("DELETE FROM Schedule s WHERE s.teacher.id = :teacherId")
    void deleteByTeacherId(@Param("teacherId") Long teacherId);
}
