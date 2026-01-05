import api from './api'
import { Attendance } from '@/types'

export const attendanceService = {
  async markAttendance(attendance: Partial<Attendance>): Promise<Attendance> {
    const response = await api.post<Attendance>('/teacher/attendance', attendance)
    return response.data
  },

  async updateAttendance(id: number, attendance: Partial<Attendance>): Promise<Attendance> {
    const response = await api.put<Attendance>(`/teacher/attendance/${id}`, attendance)
    return response.data
  },

  async getAttendanceByStudent(studentId: number): Promise<Attendance[]> {
    const response = await api.get<Attendance[]>(`/teacher/attendance/student/${studentId}`)
    return response.data
  },

  async getAttendanceByCourse(courseId: number): Promise<Attendance[]> {
    const response = await api.get<Attendance[]>(`/teacher/attendance/course/${courseId}`)
    return response.data
  },
}
