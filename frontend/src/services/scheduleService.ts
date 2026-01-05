import api from './api'
import { logger } from '@/lib/logger';

export interface Schedule {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  teacherName: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
  roomNumber: string;
  classType: string;
}

export const scheduleService = {
  getAllSchedules: async (): Promise<Schedule[]> => {
    const response = await api.get('/schedules');
    return response.data;
  },

  getScheduleById: async (id: number): Promise<Schedule> => {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },

  getTeacherSchedules: async (teacherId: number): Promise<Schedule[]> => {
    const response = await api.get(`/schedules/teacher/${teacherId}`);
    return response.data;
  },

  getStudentSchedules: async (studentId: number): Promise<Schedule[]> => {
    const response = await api.get(`/schedules/student/${studentId}`);
    return response.data;
  },

  getTodaySchedule: async (): Promise<Schedule[]> => {
    // Note: This endpoint doesn't exist yet on backend
    // For now, we'll get all schedules and filter by today
    try {
      const response = await api.get('/schedules');
      // Response is already unwrapped by interceptor
      const allSchedules = response.data || [];
      const today = new Date().getDay(); // 0=Sunday, 1=Monday, etc.
      const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const todayName = dayMap[today];
      return allSchedules.filter((s: Schedule) => s.dayOfWeek === todayName);
    } catch (error) {
      console.error('Failed to fetch today schedule:', error);
      return [];
    }
  },

  getMySchedule: async (): Promise<Schedule[]> => {
    try {
      const response = await api.get('/schedules');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      return [];
    }
  },

  getSchedulesByDay: async (dayOfWeek: string): Promise<Schedule[]> => {
    const response = await api.get(`/schedules/day/${dayOfWeek}`);
    return response.data;
  },

  createSchedule: async (schedule: Partial<Schedule>): Promise<Schedule> => {
    const response = await api.post('/schedules', schedule);
    return response.data;
  },

  updateSchedule: async (id: number, schedule: Partial<Schedule>): Promise<Schedule> => {
    const response = await api.put(`/schedules/${id}`, schedule);
    return response.data;
  },

  deleteSchedule: async (id: number): Promise<void> => {
    await api.delete(`/schedules/${id}`);
  },
};
