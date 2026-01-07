import api from './api'

export interface Notice {
  id: number
  title: string
  content: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  targetAudience: 'ALL' | 'STUDENTS' | 'TEACHERS' | 'ADMINS'
  isActive: boolean
  createdByName: string
  createdById: number
  createdAt: string
  updatedAt: string
  expiresAt?: string
  isExpired: boolean
}

export interface NoticeRequest {
  title: string
  content: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  targetAudience: 'ALL' | 'STUDENTS' | 'TEACHERS' | 'ADMINS'
  expiresAt?: string
  isActive?: boolean
}

export const noticeService = {
  // Admin endpoints
  createNotice: async (data: NoticeRequest): Promise<Notice> => {
    const response = await api.post('/notices', data)
    return response.data.data
  },

  updateNotice: async (id: number, data: NoticeRequest): Promise<Notice> => {
    const response = await api.put(`/notices/${id}`, data)
    return response.data.data
  },

  deleteNotice: async (id: number): Promise<void> => {
    await api.delete(`/notices/${id}`)
  },

  getAllNotices: async (): Promise<Notice[]> => {
    const response = await api.get('/notices/all')
    return response.data.data
  },

  // Public endpoints
  getNoticesForCurrentUser: async (): Promise<Notice[]> => {
    const response = await api.get('/notices')
    return response.data.data
  },

  getNoticeById: async (id: number): Promise<Notice> => {
    const response = await api.get(`/notices/${id}`)
    return response.data.data
  },

  getActiveNotices: async (): Promise<Notice[]> => {
    const response = await api.get('/notices/active')
    return response.data.data
  },
}
