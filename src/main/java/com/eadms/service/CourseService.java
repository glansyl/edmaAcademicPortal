package com.eadms.service;

import com.eadms.dto.request.CourseCreateRequest;
import com.eadms.dto.response.CourseResponse;

import java.util.List;

public interface CourseService {
    CourseResponse createCourse(CourseCreateRequest request);
    CourseResponse updateCourse(Long id, CourseCreateRequest request);
    CourseResponse assignTeacher(Long courseId, Long teacherId);
    CourseResponse assignTeachers(Long courseId, List<Long> teacherIds);
    CourseResponse removeTeacher(Long courseId, Long teacherId);
    void deleteCourse(Long id);
    CourseResponse getCourseById(Long id);
    List<CourseResponse> getAllCourses();
    List<CourseResponse> getCoursesByTeacher(Long teacherId);
    Long getTotalCourseCount();
}
