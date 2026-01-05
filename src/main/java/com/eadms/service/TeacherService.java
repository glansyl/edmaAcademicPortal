package com.eadms.service;

import com.eadms.dto.request.TeacherCreateRequest;
import com.eadms.dto.response.TeacherResponse;

import java.util.List;

public interface TeacherService {
    TeacherResponse createTeacher(TeacherCreateRequest request);
    TeacherResponse updateTeacher(Long id, TeacherCreateRequest request);
    void deleteTeacher(Long id);
    TeacherResponse getTeacherById(Long id);
    List<TeacherResponse> getAllTeachers();
    Long getTotalTeacherCount();
    TeacherResponse getTeacherByUserId(Long userId);
    String getNextTeacherId(String department);
}
