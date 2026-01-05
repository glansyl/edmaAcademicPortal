package com.eadms.service;

import com.eadms.dto.request.StudentCreateRequest;
import com.eadms.dto.request.StudentUpdateRequest;
import com.eadms.dto.response.StudentResponse;

import java.util.List;

public interface StudentService {
    StudentResponse createStudent(StudentCreateRequest request);
    StudentResponse updateStudent(Long id, StudentUpdateRequest request);
    void deleteStudent(Long id);
    StudentResponse getStudentById(Long id);
    List<StudentResponse> getAllStudents();
    List<StudentResponse> getStudentsByClass(String className);
    List<StudentResponse> getStudentsByCourse(Long courseId);
    Long getTotalStudentCount();
    StudentResponse getStudentByUserId(Long userId);
    String getNextStudentId(String className);
}
