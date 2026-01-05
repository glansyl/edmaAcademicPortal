package com.eadms.service;

import com.eadms.dto.request.MarksEntryRequest;
import com.eadms.dto.response.MarksResponse;

import java.util.List;

public interface MarksService {
    MarksResponse enterMarks(MarksEntryRequest request);
    MarksResponse updateMarks(Long marksId, MarksEntryRequest request);
    void deleteMarks(Long marksId);
    List<MarksResponse> getMarksByStudent(Long studentId);
    List<MarksResponse> getMarksByCourse(Long courseId);
    Double calculateAverageMarks(Long courseId);
    Double calculateStudentGPA(Long studentId);
}
