package com.eadms.service;

import com.eadms.dto.request.CourseCreateRequest;
import com.eadms.dto.response.CourseResponse;
import com.eadms.entity.Course;
import com.eadms.entity.Teacher;
import com.eadms.exception.BadRequestException;
import com.eadms.exception.ResourceNotFoundException;
import com.eadms.repository.CourseRepository;
import com.eadms.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {
    
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    
    @Override
    @Transactional
    public CourseResponse createCourse(CourseCreateRequest request) {
        if (courseRepository.existsByCourseCode(request.getCourseCode())) {
            throw new BadRequestException("Course code already exists");
        }
        
        Course course = Course.builder()
                .courseCode(request.getCourseCode())
                .courseName(request.getCourseName())
                .semester(request.getSemester())
                .credits(request.getCredits())
                .description(request.getDescription())
                .build();
        
        // Handle backward compatibility: if teacherId is provided, add it to teachers list
        if (request.getTeacherId() != null && request.getTeacherId() > 0) {
            Teacher teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", request.getTeacherId()));
            course.getTeachers().add(teacher);
        }
        
        Course savedCourse = courseRepository.save(course);
        return mapToResponse(savedCourse);
    }
    
    @Override
    @Transactional
    public CourseResponse updateCourse(Long id, CourseCreateRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        
        course.setCourseCode(request.getCourseCode());
        course.setCourseName(request.getCourseName());
        course.setSemester(request.getSemester());
        course.setCredits(request.getCredits());
        course.setDescription(request.getDescription());
        
        // Keep existing teachers unless explicitly changed through assignTeachers
        // Backward compatibility: if teacherId is provided, clear and set single teacher
        if (request.getTeacherId() != null && request.getTeacherId() > 0) {
            course.getTeachers().clear();
            Teacher teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", request.getTeacherId()));
            course.getTeachers().add(teacher);
        }
        
        Course updatedCourse = courseRepository.save(course);
        return mapToResponse(updatedCourse);
    }
    
    @Override
    @Transactional
    public CourseResponse assignTeacher(Long courseId, Long teacherId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));
        
        // Add teacher if not already in the list
        if (!course.getTeachers().contains(teacher)) {
            course.getTeachers().add(teacher);
        }
        Course updatedCourse = courseRepository.save(course);
        return mapToResponse(updatedCourse);
    }
    
    @Override
    @Transactional
    public CourseResponse assignTeachers(Long courseId, List<Long> teacherIds) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        
        // Clear existing teachers and add new ones
        course.getTeachers().clear();
        
        for (Long teacherId : teacherIds) {
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));
            course.getTeachers().add(teacher);
        }
        
        Course updatedCourse = courseRepository.save(course);
        return mapToResponse(updatedCourse);
    }
    
    @Override
    @Transactional
    public CourseResponse removeTeacher(Long courseId, Long teacherId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));
        
        course.getTeachers().remove(teacher);
        Course updatedCourse = courseRepository.save(course);
        return mapToResponse(updatedCourse);
    }
    
    @Override
    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        courseRepository.delete(course);
    }
    
    @Override
    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        return mapToResponse(course);
    }
    
    @Override
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<CourseResponse> getCoursesByTeacher(Long teacherId) {
        return courseRepository.findByTeacherId(teacherId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public Long getTotalCourseCount() {
        return courseRepository.countAllCourses();
    }
    
    private CourseResponse mapToResponse(Course course) {
        List<Long> teacherIds = course.getTeachers().stream()
                .map(Teacher::getId)
                .toList();
        List<String> teacherNames = course.getTeachers().stream()
                .map(Teacher::getFullName)
                .toList();
        
        return CourseResponse.builder()
                .id(course.getId())
                .courseCode(course.getCourseCode())
                .courseName(course.getCourseName())
                .semester(course.getSemester())
                .credits(course.getCredits())
                .description(course.getDescription())
                .teacherIds(teacherIds)
                .teacherNames(teacherNames)
                .build();
    }
}
