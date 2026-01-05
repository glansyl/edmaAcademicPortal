package com.eadms.service;

import com.eadms.dto.request.MarksEntryRequest;
import com.eadms.dto.response.MarksResponse;
import com.eadms.entity.*;
import com.eadms.exception.ResourceNotFoundException;
import com.eadms.repository.*;
import com.eadms.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
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
        return marksRepository.findByCourseId(courseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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
        return MarksResponse.builder()
                .id(marks.getId())
                .studentId(marks.getStudent().getId())
                .studentName(marks.getStudent().getFullName())
                .courseId(marks.getCourse().getId())
                .courseName(marks.getCourse().getCourseName())
                .examType(marks.getExamType().name())
                .marksObtained(marks.getMarksObtained())
                .maxMarks(marks.getMaxMarks())
                .percentage(marks.getPercentage())
                .remarks(marks.getRemarks())
                .examDate(marks.getExamDate())
                .build();
    }
}
