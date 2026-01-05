package com.eadms.service;

import com.eadms.dto.request.AttendanceEntryRequest;
import com.eadms.dto.response.AttendanceResponse;
import com.eadms.entity.*;
import com.eadms.exception.BadRequestException;
import com.eadms.exception.ResourceNotFoundException;
import com.eadms.repository.*;
import com.eadms.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {
    
    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    
    @Override
    @Transactional
    public AttendanceResponse markAttendance(AttendanceEntryRequest request) {
        ValidationUtil.validateEnum(request.getStatus(), Attendance.Status.class, "status");
        
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", request.getCourseId()));
        
        Optional<Attendance> existing = attendanceRepository.findByStudentIdAndCourseIdAndAttendanceDate(
                request.getStudentId(), request.getCourseId(), request.getAttendanceDate()
        );
        
        if (existing.isPresent()) {
            throw new BadRequestException("Attendance already marked for this date");
        }
        
        Attendance attendance = Attendance.builder()
                .student(student)
                .course(course)
                .attendanceDate(request.getAttendanceDate())
                .status(Attendance.Status.valueOf(request.getStatus().toUpperCase()))
                .build();
        
        Attendance savedAttendance = attendanceRepository.save(attendance);
        return mapToResponse(savedAttendance);
    }
    
    @Override
    @Transactional
    public AttendanceResponse updateAttendance(Long attendanceId, AttendanceEntryRequest request) {
        ValidationUtil.validateEnum(request.getStatus(), Attendance.Status.class, "status");
        
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", attendanceId));
        
        attendance.setStatus(Attendance.Status.valueOf(request.getStatus().toUpperCase()));
        attendance.setAttendanceDate(request.getAttendanceDate());
        
        Attendance updatedAttendance = attendanceRepository.save(attendance);
        return mapToResponse(updatedAttendance);
    }
    
    @Override
    public List<AttendanceResponse> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AttendanceResponse> getAttendanceByCourse(Long courseId) {
        return attendanceRepository.findByCourseId(courseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public Double calculateAttendancePercentage(Long studentId, Long courseId) {
        List<Attendance> attendances = attendanceRepository.findByStudentIdAndCourseId(studentId, courseId);
        if (attendances.isEmpty()) {
            return 0.0;
        }
        
        long presentCount = attendances.stream()
                .filter(a -> a.getStatus() == Attendance.Status.PRESENT)
                .count();
        
        return (double) presentCount / attendances.size() * 100;
    }
    
    @Override
    public Map<String, Object> getAttendanceStats(Long studentId) {
        Long totalPresent = attendanceRepository.countPresentByStudentId(studentId);
        Long totalDays = attendanceRepository.countTotalByStudentId(studentId);
        
        Double percentage = totalDays > 0 ? (double) totalPresent / totalDays * 100 : 0.0;
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDays", totalDays);
        stats.put("presentDays", totalPresent);
        stats.put("absentDays", totalDays - totalPresent);
        stats.put("percentage", percentage);
        
        return stats;
    }
    
    private AttendanceResponse mapToResponse(Attendance attendance) {
        return AttendanceResponse.builder()
                .id(attendance.getId())
                .studentId(attendance.getStudent().getId())
                .studentName(attendance.getStudent().getFullName())
                .courseId(attendance.getCourse().getId())
                .courseName(attendance.getCourse().getCourseName())
                .attendanceDate(attendance.getAttendanceDate())
                .status(attendance.getStatus().name())
                .build();
    }
}
