package com.eadms.service;

import com.eadms.dto.request.AttendanceEntryRequest;
import com.eadms.dto.response.AttendanceResponse;

import java.util.List;
import java.util.Map;

public interface AttendanceService {
    AttendanceResponse markAttendance(AttendanceEntryRequest request);
    AttendanceResponse updateAttendance(Long attendanceId, AttendanceEntryRequest request);
    List<AttendanceResponse> getAttendanceByStudent(Long studentId);
    List<AttendanceResponse> getAttendanceByCourse(Long courseId);
    Double calculateAttendancePercentage(Long studentId, Long courseId);
    Map<String, Object> getAttendanceStats(Long studentId);
}
