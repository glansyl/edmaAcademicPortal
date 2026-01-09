package com.eadms.service;

import com.eadms.dto.ScheduleDTO;
import com.eadms.entity.Course;
import com.eadms.entity.Schedule;
import com.eadms.entity.Student;
import com.eadms.entity.Teacher;
import com.eadms.repository.CourseRepository;
import com.eadms.repository.ScheduleRepository;
import com.eadms.repository.StudentRepository;
import com.eadms.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleService {
    
    private final ScheduleRepository scheduleRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    
    public List<ScheduleDTO> getAllSchedules() {
        return scheduleRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public ScheduleDTO getScheduleById(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        return convertToDTO(schedule);
    }
        // --- Missing methods for compilation ---
        public List<ScheduleDTO> getTeacherSchedulesByDateRange(Long teacherId, java.time.LocalDateTime start, java.time.LocalDateTime end) {
            // TODO: Implement actual logic
            return java.util.Collections.emptyList();
        }

        public List<ScheduleDTO> getStudentSchedulesByDateRange(Long studentId, java.time.LocalDateTime start, java.time.LocalDateTime end) {
            // TODO: Implement actual logic
            return java.util.Collections.emptyList();
        }
    
    public List<ScheduleDTO> getSchedulesByTeacherId(Long teacherId) {
        return scheduleRepository.findByTeacherId(teacherId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ScheduleDTO> getSchedulesByStudentId(Long studentId) {
        return scheduleRepository.findByStudentId(studentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ScheduleDTO> getSchedulesByDayOfWeek(DayOfWeek dayOfWeek) {
        return scheduleRepository.findByDayOfWeek(dayOfWeek).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public ScheduleDTO createSchedule(ScheduleDTO scheduleDTO) {
        Course course = courseRepository.findById(scheduleDTO.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        Schedule schedule = Schedule.builder()
                .course(course)
                .dayOfWeek(scheduleDTO.getDayOfWeek())
                .startTime(scheduleDTO.getStartTime())
                .endTime(scheduleDTO.getEndTime())
                .roomNumber(scheduleDTO.getRoomNumber())
                .classType(scheduleDTO.getClassType())
                .build();
        
        schedule = scheduleRepository.save(schedule);
        return convertToDTO(schedule);
    }
    
    public ScheduleDTO updateSchedule(Long id, ScheduleDTO scheduleDTO) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        
        if (scheduleDTO.getCourseId() != null) {
            Course course = courseRepository.findById(scheduleDTO.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            schedule.setCourse(course);
        }
        
        if (scheduleDTO.getDayOfWeek() != null) {
            schedule.setDayOfWeek(scheduleDTO.getDayOfWeek());
        }
        if (scheduleDTO.getStartTime() != null) {
            schedule.setStartTime(scheduleDTO.getStartTime());
        }
        if (scheduleDTO.getEndTime() != null) {
            schedule.setEndTime(scheduleDTO.getEndTime());
        }
        if (scheduleDTO.getRoomNumber() != null) {
            schedule.setRoomNumber(scheduleDTO.getRoomNumber());
        }
        if (scheduleDTO.getClassType() != null) {
            schedule.setClassType(scheduleDTO.getClassType());
        }
        
        schedule = scheduleRepository.save(schedule);
        return convertToDTO(schedule);
    }
    
    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }
    
    private ScheduleDTO convertToDTO(Schedule schedule) {
        String teacherName = schedule.getCourse().getTeachers() != null && !schedule.getCourse().getTeachers().isEmpty()
                ? schedule.getCourse().getTeachers().stream()
                        .map(t -> t.getFirstName() + " " + t.getLastName())
                        .collect(java.util.stream.Collectors.joining(", "))
                : "Not Assigned";
        
        return ScheduleDTO.builder()
                .id(schedule.getId())
                .courseId(schedule.getCourse().getId())
                .courseCode(schedule.getCourse().getCourseCode())
                .courseName(schedule.getCourse().getCourseName())
                .teacherName(teacherName)
                .dayOfWeek(schedule.getDayOfWeek())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .roomNumber(schedule.getRoomNumber())
                .classType(schedule.getClassType())
                .build();
    }
}
