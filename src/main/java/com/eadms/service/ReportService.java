package com.eadms.service;

import java.util.Map;

public interface ReportService {
    Map<String, Object> getAdminDashboardStats();
    Map<String, Object> getTeacherDashboardStats(Long teacherId);
    Map<String, Object> getStudentDashboardStats(Long studentId);
}
