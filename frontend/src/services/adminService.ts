import api from './api'
import { DashboardStats } from '@/types'

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/admin/dashboard/stats')
    return response.data
  },
  
  async getNextTeacherId(department: string): Promise<{ teacherId: string }> {
    const response = await api.get<{ teacherId: string }>(`/admin/teachers/next-id?department=${department}`)
    return response.data
  },
  
  async getNextStudentId(className: string): Promise<{ studentId: string }> {
    const response = await api.get<{ studentId: string }>(`/admin/students/next-id?className=${encodeURIComponent(className)}`)
    return response.data
  },
}
