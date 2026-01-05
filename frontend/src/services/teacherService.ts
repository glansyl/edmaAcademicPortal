import api from './api'
import { Teacher, Course, DashboardStats, Student } from '@/types'

export const teacherService = {
  async getAllTeachers(): Promise<Teacher[]> {
    const response = await api.get<Teacher[]>('/admin/teachers')
    return response.data
  },

  async getTeacherById(id: number): Promise<Teacher> {
    const response = await api.get<Teacher>(`/admin/teachers/${id}`)
    return response.data
  },

  async createTeacher(teacher: Partial<Teacher>): Promise<Teacher> {
    const response = await api.post<Teacher>('/admin/teachers', teacher)
    return response.data
  },

  async updateTeacher(id: number, teacher: Partial<Teacher>): Promise<Teacher> {
    const response = await api.put<Teacher>(`/admin/teachers/${id}`, teacher)
    return response.data
  },

  async deleteTeacher(id: number): Promise<void> {
    await api.delete(`/admin/teachers/${id}`)
  },

  async getTeacherDashboard(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/teacher/dashboard/stats')
    return response.data
  },

  async getMyCourses(): Promise<Course[]> {
    const response = await api.get<Course[]>('/teacher/courses')
    return response.data
  },

  async getStudents(): Promise<Student[]> {
    const response = await api.get<Student[]>('/teacher/students')
    return response.data
  },

  async getStudentsByCourse(courseId: number): Promise<Student[]> {
    const response = await api.get<Student[]>(`/teacher/course/${courseId}/students`)
    return response.data
  },

  async getMyProfile(): Promise<Teacher> {
    const response = await api.get<Teacher>('/teacher/profile')
    return response.data
  },
}
