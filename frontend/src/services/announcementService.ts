import api from './api'
import { Announcement } from '@/types'

/**
 * Announcement Service
 * Handles all announcement-related API calls for the student dashboard
 */
export const announcementService = {
  /**
   * Get all announcements visible to the current user
   * Filters based on user role and target audience
   */
  async getAllAnnouncements(): Promise<Announcement[]> {
    const response = await api.get<Announcement[]>('/announcements')
    return response.data
  },

  /**
   * Get announcements by priority level
   * @param priority - HIGH, MEDIUM, or LOW
   */
  async getAnnouncementsByPriority(priority: 'HIGH' | 'MEDIUM' | 'LOW'): Promise<Announcement[]> {
    const response = await api.get<Announcement[]>(`/announcements?priority=${priority}`)
    return response.data
  },

  /**
   * Get announcements by type
   * @param type - INFO, WARNING, or URGENT
   */
  async getAnnouncementsByType(type: 'INFO' | 'WARNING' | 'URGENT'): Promise<Announcement[]> {
    const response = await api.get<Announcement[]>(`/announcements?type=${type}`)
    return response.data
  },

  /**
   * Get recent announcements (last 7 days)
   */
  async getRecentAnnouncements(): Promise<Announcement[]> {
    try {
      const response = await api.get<Announcement[]>('/announcements/recent')
      return response.data
    } catch (error) {
      // Endpoint doesn't exist yet, return empty array
      console.warn('Announcements endpoint not available yet')
      return []
    }
  },

  /**
   * Mark announcement as read
   * @param announcementId - ID of the announcement to mark as read
   */
  async markAsRead(announcementId: number): Promise<void> {
    await api.post(`/announcements/${announcementId}/read`)
  },

  /**
   * Get announcement by ID
   * @param announcementId - ID of the announcement
   */
  async getAnnouncementById(announcementId: number): Promise<Announcement> {
    const response = await api.get<Announcement>(`/announcements/${announcementId}`)
    return response.data
  },
}
