package com.eadms.repository;

import com.eadms.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    List<Attendance> findByStudentId(Long studentId);
    
    List<Attendance> findByCourseId(Long courseId);
    
    List<Attendance> findByStudentIdAndCourseId(Long studentId, Long courseId);
    
    Optional<Attendance> findByStudentIdAndCourseIdAndAttendanceDate(
        Long studentId, Long courseId, LocalDate attendanceDate
    );
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = 'PRESENT'")
    Long countPresentByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId")
    Long countTotalByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.course.id = :courseId AND a.status = 'PRESENT'")
    Long countPresentByCourseId(@Param("courseId") Long courseId);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.course.id = :courseId")
    Long countTotalByCourseId(@Param("courseId") Long courseId);
    
    @Query("SELECT a.status, COUNT(a) FROM Attendance a WHERE a.student.id = :studentId GROUP BY a.status")
    List<Object[]> countAttendanceByStatus(@Param("studentId") Long studentId);
}
