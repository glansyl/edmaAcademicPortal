import api from './api'
import { Marks } from '@/types'

export const marksService = {
  async enterMarks(marks: Partial<Marks>): Promise<Marks> {
    const response = await api.post<Marks>('/teacher/marks', marks)
    return response.data
  },

  async updateMarks(id: number, marks: Partial<Marks>): Promise<Marks> {
    const response = await api.put<Marks>(`/teacher/marks/${id}`, marks)
    return response.data
  },

  async deleteMarks(id: number): Promise<void> {
    await api.delete(`/teacher/marks/${id}`)
  },

  async getMarksByStudent(studentId: number): Promise<Marks[]> {
    const response = await api.get<Marks[]>(`/teacher/marks/student/${studentId}`)
    return response.data
  },

  async getMarksByCourse(courseId: number): Promise<Marks[]> {
    const response = await api.get<Marks[]>(`/teacher/marks/course/${courseId}`)
    return response.data
  },
}
