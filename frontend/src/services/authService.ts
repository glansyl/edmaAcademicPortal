import api from './api'
import { LoginRequest, LoginResponse, User } from '@/types'

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },

  setToken(token: string) {
    localStorage.setItem('token', token)
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user))
  },

  async updateStudentUser(studentId: number, data: { email?: string; newPassword?: string }): Promise<void> {
    await api.put(`/admin/users/student/${studentId}`, data)
  },

  async updateTeacherUser(teacherId: number, data: { email?: string; newPassword?: string }): Promise<void> {
    await api.put(`/admin/users/teacher/${teacherId}`, data)
  },
}
