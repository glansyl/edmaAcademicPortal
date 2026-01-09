package com.eadms.service;

import com.eadms.dto.ScheduleDTO;
import com.eadms.entity.Course;
import com.eadms.entity.Schedule;
import com.eadms.entity.Student;
import com.eadms.entity.Teacher;
import com.eadms.exception.BadRequestException;
import com.eadms.exception.ResourceNotFoundException;
import com.eadms.exception.ScheduleConflictException;
import com.eadms.repository.CourseRepository;
import com.eadms.repository.ScheduleRepository;
import com.eadms.repository.StudentRepository;
import com.eadms.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
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
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));
        return convertToDTO(schedule);
    }
    
    public List<ScheduleDTO> getSchedulesByTeacherId(Long teacherId) {
        return scheduleRepository.findByTeacherIdOrderByStartDateTime(teacherId).stream()
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
    
    public List<ScheduleDTO> getTeacherSchedulesByDateRange(Long teacherId, LocalDateTime startDate, LocalDateTime endDate) {
        return scheduleRepository.findByTeacherIdAndDateRange(teacherId, startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ScheduleDTO> getStudentSchedulesByDateRange(Long studentId, LocalDateTime startDate, LocalDateTime endDate) {
        return scheduleRepository.findByStudentIdAndDateRange(studentId, startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public ScheduleDTO createSchedule(ScheduleDTO scheduleDTO) {
        Course course = courseRepository.findById(scheduleDTO.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        Teacher teacher = teacherRepository.findById(scheduleDTO.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        
        // Validate date/time
        if (scheduleDTO.getStartDateTime() == null || scheduleDTO.getEndDateTime() == null) {
            throw new BadRequestException("Start and end date/time are required");
        }
        
        if (scheduleDTO.getEndDateTime().isBefore(scheduleDTO.getStartDateTime())) {
            throw new BadRequestException("End time must be after start time");
        }
        
    // Check for conflicts
    List<Schedule> conflicts = scheduleRepository.findConflictingSchedules(
            teacher.getId(), scheduleDTO.getStartDateTime(), scheduleDTO.getEndDateTime());
    
    if (!conflicts.isEmpty()) {
        Schedule conflict = conflicts.get(0);
        throw new ScheduleConflictException(String.format(
            "Schedule conflicts with existing class '%s' from %s to %s", 
            conflict.getTitle(),
            conflict.getStartDateTime(),
            conflict.getEndDateTime()
        ));
    }
        
        Schedule schedule = Schedule.builder()
                .course(course)
                .teacher(teacher)
                .title(scheduleDTO.getTitle())
                .description(scheduleDTO.getDescription())
                .startDateTime(scheduleDTO.getStartDateTime())
                .endDateTime(scheduleDTO.getEndDateTime())
                .recurrence(scheduleDTO.getRecurrence() != null ? scheduleDTO.getRecurrence() : Schedule.RecurrenceType.NONE)
                .location(scheduleDTO.getLocation())
                .classType(scheduleDTO.getClassType())
                .build();
        
        schedule = scheduleRepository.save(schedule);
        return convertToDTO(schedule);
    }
    
    public ScheduleDTO updateSchedule(Long id, ScheduleDTO scheduleDTO) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));
        
        if (scheduleDTO.getCourseId() != null) {
            Course course = courseRepository.findById(scheduleDTO.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
            schedule.setCourse(course);
        }
        
        if (scheduleDTO.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(scheduleDTO.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            schedule.setTeacher(teacher);
        }
        
        if (scheduleDTO.getTitle() != null) {
            schedule.setTitle(scheduleDTO.getTitle());
        }
        if (scheduleDTO.getDescription() != null) {
            schedule.setDescription(scheduleDTO.getDescription());
        }
        if (scheduleDTO.getStartDateTime() != null) {
            schedule.setStartDateTime(scheduleDTO.getStartDateTime());
        }
        if (scheduleDTO.getEndDateTime() != null) {
            schedule.setEndDateTime(scheduleDTO.getEndDateTime());
        }
        if (scheduleDTO.getRecurrence() != null) {
            schedule.setRecurrence(scheduleDTO.getRecurrence());
        }
        if (scheduleDTO.getLocation() != null) {
            schedule.setLocation(scheduleDTO.getLocation());
        }
        if (scheduleDTO.getClassType() != null) {
            schedule.setClassType(scheduleDTO.getClassType());
        }
        
        // Validate date/time if changed
        if (scheduleDTO.getStartDateTime() != null || scheduleDTO.getEndDateTime() != null) {
            if (schedule.getEndDateTime().isBefore(schedule.getStartDateTime())) {
                throw new BadRequestException("End time must be after start time");
            }
        }
        
        // Check for conflicts if datetime changed
        if (scheduleDTO.getStartDateTime() != null || scheduleDTO.getEndDateTime() != null) {
            final Long scheduleId = schedule.getId();
            List<Schedule> conflicts = scheduleRepository.findConflictingSchedules(
                    schedule.getTeacher().getId(), schedule.getStartDateTime(), schedule.getEndDateTime())
                    .stream()
                    .filter(s -> !s.getId().equals(scheduleId))
                    .collect(Collectors.toList());
            
            if (!conflicts.isEmpty()) {
                Schedule conflict = conflicts.get(0);
                throw new ScheduleConflictException(String.format(
                    "Schedule conflicts with existing class '%s' from %s to %s", 
                    conflict.getTitle(),
                    conflict.getStartDateTime(),
                    conflict.getEndDateTime()
                ));
            }
        }
        
        schedule = scheduleRepository.save(schedule);
        return convertToDTO(schedule);
    }
    
    public void deleteSchedule(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));
        
        // Prevent deleting past events
        if (schedule.getStartDateTime() != null && schedule.getStartDateTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot delete past events");
        }
        
        scheduleRepository.deleteById(id);
    }
    
    private ScheduleDTO convertToDTO(Schedule schedule) {
        String teacherName = schedule.getTeacher() != null 
                ? schedule.getTeacher().getFirstName() + " " + schedule.getTeacher().getLastName()
                : "Not Assigned";
        
        return ScheduleDTO.builder()
                .id(schedule.getId())
                .courseId(schedule.getCourse().getId())
                .courseCode(schedule.getCourse().getCourseCode())
                .courseName(schedule.getCourse().getCourseName())
                .teacherId(schedule.getTeacher() != null ? schedule.getTeacher().getId() : null)
                .teacherName(teacherName)
                .title(schedule.getTitle())
                .description(schedule.getDescription())
                .startDateTime(schedule.getStartDateTime())
                .endDateTime(schedule.getEndDateTime())
                .recurrence(schedule.getRecurrence())
                .location(schedule.getLocation())
                // Legacy fields for backward compatibility
                .dayOfWeek(schedule.getDayOfWeek())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .roomNumber(schedule.getRoomNumber())
                .classType(schedule.getClassType())
                .build();
    }
}
