package com.eadms.service;

import com.eadms.dto.request.MarksEntryRequest;
import com.eadms.dto.response.MarksResponse;
import com.eadms.entity.*;
import com.eadms.exception.ResourceNotFoundException;
import com.eadms.repository.*;
import com.eadms.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarksServiceImpl implements MarksService {
    
    private final MarksRepository marksRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    
    @Override
    @Transactional
    public MarksResponse enterMarks(MarksEntryRequest request) {
        ValidationUtil.validateMarks(request.getMarksObtained(), request.getMaxMarks());
        ValidationUtil.validateEnum(request.getExamType(), Marks.ExamType.class, "exam type");
        
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", request.getCourseId()));
        
        Marks marks = Marks.builder()
                .student(student)
                .course(course)
                .examType(Marks.ExamType.valueOf(request.getExamType().toUpperCase()))
                .marksObtained(request.getMarksObtained())
                .maxMarks(request.getMaxMarks())
                .remarks(request.getRemarks())
                .examDate(request.getExamDate())
                .build();
        
        Marks savedMarks = marksRepository.save(marks);
        return mapToResponse(savedMarks);
    }
    
    @Override
    @Transactional
    public MarksResponse updateMarks(Long marksId, MarksEntryRequest request) {
        ValidationUtil.validateMarks(request.getMarksObtained(), request.getMaxMarks());
        
        Marks marks = marksRepository.findById(marksId)
                .orElseThrow(() -> new ResourceNotFoundException("Marks", "id", marksId));
        
        marks.setExamType(Marks.ExamType.valueOf(request.getExamType().toUpperCase()));
        marks.setMarksObtained(request.getMarksObtained());
        marks.setMaxMarks(request.getMaxMarks());
        marks.setRemarks(request.getRemarks());
        marks.setExamDate(request.getExamDate());
        
        Marks updatedMarks = marksRepository.save(marks);
        return mapToResponse(updatedMarks);
    }
    
    @Override
    @Transactional
    public void deleteMarks(Long marksId) {
        Marks marks = marksRepository.findById(marksId)
                .orElseThrow(() -> new ResourceNotFoundException("Marks", "id", marksId));
        marksRepository.delete(marks);
    }
    
    @Override
    public List<MarksResponse> getMarksByStudent(Long studentId) {
        return marksRepository.findByStudentId(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<MarksResponse> getMarksByCourse(Long courseId) {
        log.info("Fetching marks for course ID: {}", courseId);
        
        List<Marks> marksList = marksRepository.findByCourseId(courseId);
        log.info("Found {} marks records for course ID: {}", marksList.size(), courseId);
        
        List<MarksResponse> responses = marksList.stream()
                .map(marks -> {
                    try {
                        MarksResponse response = mapToResponse(marks);
                        log.debug("Mapped marks ID {} - Student: {} ({}), Course: {}", 
                                response.getId(), response.getStudentName(), response.getStudentCode(), response.getCourseName());
                        return response;
                    } catch (Exception e) {
                        log.error("Error mapping marks ID {}: {}", marks.getId(), e.getMessage(), e);
                        throw e;
                    }
                })
                .collect(Collectors.toList());
        
        log.info("Successfully mapped {} marks responses for course ID: {}", responses.size(), courseId);
        return responses;
    }
    
    @Override
    public Double calculateAverageMarks(Long courseId) {
        Double average = marksRepository.findAverageMarksByCourseId(courseId);
        return average != null ? average : 0.0;
    }
    
    @Override
    public Double calculateStudentGPA(Long studentId) {
        Double gpa = marksRepository.findAveragePercentageByStudentId(studentId);
        return gpa != null ? gpa / 25.0 : 0.0;  // Convert percentage to 4.0 scale
    }
    
    private MarksResponse mapToResponse(Marks marks) {
        // Add null checks and logging for debugging
        if (marks == null) {
            log.error("Marks object is null");
            throw new IllegalArgumentException("Marks cannot be null");
        }
        
        log.debug("Mapping marks ID: {}", marks.getId());
        
        Student student = marks.getStudent();
        Course course = marks.getCourse();
        
        if (student == null) {
            log.error("Student is null for marks ID: {}", marks.getId());
            throw new IllegalStateException("Student is null for marks ID: " + marks.getId());
        }
        
        if (course == null) {
            log.error("Course is null for marks ID: {}", marks.getId());
            throw new IllegalStateException("Course is null for marks ID: " + marks.getId());
        }
        
        log.debug("Student details - ID: {}, StudentID: {}, Name: {} {}", 
                student.getId(), student.getStudentId(), student.getFirstName(), student.getLastName());
        log.debug("Course details - ID: {}, Code: {}, Name: {}", 
                course.getId(), course.getCourseCode(), course.getCourseName());
        
        MarksResponse response = MarksResponse.builder()
                .id(marks.getId())
                .studentId(student.getId()) // Keep database ID for backend operations
                .studentCode(student.getStudentId()) // Student ID like CSE-001
                .studentName(student.getFullName())
                .courseId(course.getId())
                .courseCode(course.getCourseCode())
                .courseName(course.getCourseName())
                .examType(marks.getExamType().name())
                .marksObtained(marks.getMarksObtained())
                .maxMarks(marks.getMaxMarks())
                .percentage(marks.getPercentage())
                .remarks(marks.getRemarks())
                .examDate(marks.getExamDate())
                .build();
        
        // Additional logging to verify the data
        log.debug("Final response - ID: {}, StudentCode: '{}', StudentName: '{}', CourseName: '{}'", 
                response.getId(), response.getStudentCode(), response.getStudentName(), response.getCourseName());
        
        return response;
    }
}
