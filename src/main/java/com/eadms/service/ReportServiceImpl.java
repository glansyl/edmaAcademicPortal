package com.eadms.service;

import com.eadms.entity.Course;
import com.eadms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {
    
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final MarksRepository marksRepository;
    private final AttendanceRepository attendanceRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final EnrollmentService enrollmentService;
    
    @Override
    public Map<String, Object> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", studentRepository.countAllStudents());
        stats.put("totalTeachers", teacherRepository.countAllTeachers());
        stats.put("totalCourses", courseRepository.countAllCourses());
        stats.put("activeUsers", userRepository.countActiveUsers());
        stats.put("classDistribution", studentRepository.countStudentsByClass());
        stats.put("departmentDistribution", teacherRepository.countTeachersByDepartment());
        return stats;
    }
    
    @Override
    public Map<String, Object> getTeacherDashboardStats(Long teacherId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Get teacher's courses
        List<Course> teacherCourses = courseRepository.findByTeacherId(teacherId);
        stats.put("totalCourses", teacherCourses.size());
        
        // Calculate total students across all teacher's courses
        int totalStudents = teacherCourses.stream()
            .mapToInt(course -> enrollmentRepository.countActiveEnrollmentsByCourseId(course.getId()).intValue())
            .sum();
        stats.put("studentsInMyCourses", totalStudents);
        
        // Get courses with detailed information
        List<Map<String, Object>> myCourses = teacherCourses.stream()
            .map(course -> {
                Map<String, Object> courseMap = new HashMap<>();
                courseMap.put("id", course.getId());
                courseMap.put("courseCode", course.getCourseCode());
                courseMap.put("courseName", course.getCourseName());
                courseMap.put("semester", course.getSemester());
                courseMap.put("credits", course.getCredits());
                courseMap.put("description", course.getDescription());
                return courseMap;
            })
            .collect(Collectors.toList());
        stats.put("myCourses", myCourses);
        
        // Calculate average attendance across all teacher's courses
        if (!teacherCourses.isEmpty()) {
            double totalAttendancePercentage = 0.0;
            int coursesWithAttendance = 0;
            
            for (Course course : teacherCourses) {
                Long totalPresent = attendanceRepository.countPresentByCourseId(course.getId());
                Long totalDays = attendanceRepository.countTotalByCourseId(course.getId());
                if (totalDays > 0) {
                    totalAttendancePercentage += (double) totalPresent / totalDays * 100;
                    coursesWithAttendance++;
                }
            }
            
            if (coursesWithAttendance > 0) {
                stats.put("averageAttendance", totalAttendancePercentage / coursesWithAttendance);
            } else {
                stats.put("averageAttendance", 0.0);
            }
        } else {
            stats.put("averageAttendance", 0.0);
        }
        
        // Calculate total scheduled classes (this could be enhanced with actual schedule data)
        stats.put("totalClasses", teacherCourses.size() * 15); // Assuming 15 classes per course per semester
        
        return stats;
    }
    
    @Override
    public Map<String, Object> getStudentDashboardStats(Long studentId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Calculate proper credit-weighted GPA from completed enrollments
        Double gpa = enrollmentService.calculateStudentGPA(studentId);
        stats.put("gpa", gpa);
        stats.put("overallGPA", gpa); // Alias for frontend compatibility
        
        // Get total credits from active enrollments
        Integer totalCredits = enrollmentService.getTotalActiveCredits(studentId);
        stats.put("totalCredits", totalCredits);
        
        // Calculate attendance percentage
        Long totalPresent = attendanceRepository.countPresentByStudentId(studentId);
        Long totalDays = attendanceRepository.countTotalByStudentId(studentId);
        Double attendancePercentage = totalDays > 0 ? (double) totalPresent / totalDays * 100 : 0.0;
        stats.put("attendancePercentage", attendancePercentage);
        stats.put("totalClasses", totalDays);
        
        // Get recent marks
        List<Object> recentMarks = marksRepository.findRecentMarksByStudentId(studentId)
            .stream()
            .limit(5)
            .map(mark -> {
                Map<String, Object> markMap = new HashMap<>();
                markMap.put("id", mark.getId());
                markMap.put("examType", mark.getExamType().name());
                markMap.put("marksObtained", mark.getMarksObtained());
                markMap.put("maxMarks", mark.getMaxMarks());
                markMap.put("percentage", mark.getPercentage());
                markMap.put("examDate", mark.getExamDate());
                if (mark.getCourse() != null) {
                    Map<String, Object> courseMap = new HashMap<>();
                    courseMap.put("id", mark.getCourse().getId());
                    courseMap.put("courseCode", mark.getCourse().getCourseCode());
                    courseMap.put("courseName", mark.getCourse().getCourseName());
                    markMap.put("course", courseMap);
                }
                return markMap;
            })
            .collect(Collectors.toList());
        stats.put("recentMarks", recentMarks);
        
        // Get enrolled courses from enrollment table (not marks)
        List<Course> enrolledCourses = enrollmentRepository.findActiveCoursesByStudentId(studentId);
        List<Map<String, Object>> myCourses = enrolledCourses.stream()
            .map(course -> {
                Map<String, Object> courseMap = new HashMap<>();
                courseMap.put("id", course.getId());
                courseMap.put("courseCode", course.getCourseCode());
                courseMap.put("courseName", course.getCourseName());
                courseMap.put("semester", course.getSemester());
                courseMap.put("credits", course.getCredits());
                if (course.getTeachers() != null && !course.getTeachers().isEmpty()) {
                    courseMap.put("teacherIds", course.getTeachers().stream().map(t -> t.getId()).collect(java.util.stream.Collectors.toList()));
                    courseMap.put("teacherNames", course.getTeachers().stream()
                            .map(t -> t.getFirstName() + " " + t.getLastName())
                            .collect(java.util.stream.Collectors.joining(", ")));
                }
                return courseMap;
            })
            .toList();
        stats.put("myCourses", myCourses);
        
        // Count active enrollments
        Long activeEnrollments = enrollmentRepository.countActiveEnrollmentsByStudentId(studentId);
        stats.put("activeEnrollments", activeEnrollments);
        
        return stats;
    }
}
