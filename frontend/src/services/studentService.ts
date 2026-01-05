import api from './api'
import { Student, Marks, Attendance, DashboardStats, Assignment, Course, Enrollment } from '@/types'

export const studentService = {
  async getAllStudents(): Promise<Student[]> {
    const response = await api.get<Student[]>('/admin/students')
    return response.data
  },

  async getStudentById(id: number): Promise<Student> {
    const response = await api.get<Student>(`/admin/students/${id}`)
    return response.data
  },

  async createStudent(student: Partial<Student>): Promise<Student> {
    const response = await api.post<Student>('/admin/students', student)
    return response.data
  },

  async updateStudent(id: number, student: Partial<Student>): Promise<Student> {
    const response = await api.put<Student>(`/admin/students/${id}`, student)
    return response.data
  },

  async deleteStudent(id: number): Promise<void> {
    await api.delete(`/admin/students/${id}`)
  },

  async getStudentDashboard(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/student/dashboard/stats')
    return response.data
  },

  async getMyProfile(): Promise<Student> {
    const response = await api.get<Student>('/student/profile')
    return response.data
  },

  async getMyMarks(): Promise<Marks[]> {
    const response = await api.get<Marks[]>('/student/marks')
    return response.data || []
  },

  async getMyAttendance(): Promise<Attendance[]> {
    const response = await api.get<Attendance[]>('/student/attendance')
    return response.data || []
  },

  async getMyCourses(): Promise<Course[]> {
    const response = await api.get<Course[]>('/student/courses')
    return response.data || []
  },

  async getMyEnrollments(): Promise<Enrollment[]> {
    const response = await api.get<Enrollment[]>('/student/enrollments')
    return response.data || []
  },

  async getTotalCredits(): Promise<number> {
    const response = await api.get<number>('/student/credits')
    return response.data || 0
  },

  async getMyGPA(): Promise<number> {
    const response = await api.get<number>('/student/gpa')
    return response.data || 0
  },

  // Assignment-related methods
  async getMyAssignments(): Promise<Assignment[]> {
    try {
      const response = await api.get<Assignment[]>('/student/assignments')
      return response.data
    } catch (error) {
      // Endpoint doesn't exist yet, return empty array
      console.warn('Assignments endpoint not available yet')
      return []
    }
  },

  async getAssignmentsByStatus(status: 'PENDING' | 'SUBMITTED' | 'OVERDUE' | 'GRADED'): Promise<Assignment[]> {
    const response = await api.get<Assignment[]>(`/student/assignments?status=${status}`)
    return response.data
  },

  async submitAssignment(assignmentId: number, data: FormData | Record<string, unknown>): Promise<void> {
    await api.post(`/student/assignments/${assignmentId}/submit`, data)
  },

  async getCourseById(courseId: number): Promise<Course> {
    const response = await api.get<Course>(`/student/courses/${courseId}`)
    return response.data
  },

  async getMyTeachers(): Promise<any[]> {
    const response = await api.get<any[]>('/student/teachers')
    return response.data || []
  },
}
