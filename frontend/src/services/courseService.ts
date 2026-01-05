import api from './api'
import { Course } from '@/types'

export const courseService = {
  async getAllCourses(): Promise<Course[]> {
    const response = await api.get<Course[]>('/admin/courses')
    return response.data
  },

  async getCourseById(id: number): Promise<Course> {
    const response = await api.get<Course>(`/admin/courses/${id}`)
    return response.data
  },

  async createCourse(course: Partial<Course>): Promise<Course> {
    const response = await api.post<Course>('/admin/courses', course)
    return response.data
  },

  async updateCourse(id: number, course: Partial<Course>): Promise<Course> {
    const response = await api.put<Course>(`/admin/courses/${id}`, course)
    return response.data
  },

  async deleteCourse(id: number): Promise<void> {
    await api.delete(`/admin/courses/${id}`)
  },

  async assignTeacher(courseId: number, teacherId: number): Promise<Course> {
    const response = await api.put<Course>(`/admin/courses/${courseId}/assign-teacher/${teacherId}`)
    return response.data
  },

  async assignTeachers(courseId: number, teacherIds: number[]): Promise<Course> {
    const response = await api.put<Course>(`/admin/courses/${courseId}/assign-teachers`, teacherIds)
    return response.data
  },
}
