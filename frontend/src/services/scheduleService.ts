import api from './api'
import { logger } from '@/lib/logger';

export interface Schedule {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  teacherId?: number;
  teacherName: string;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  recurrence: 'NONE' | 'WEEKLY';
  location?: string;
  // Legacy fields for backward compatibility
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
  roomNumber: string;
  classType: string;
}

export interface CreateScheduleRequest {
  courseId: number;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  recurrence?: 'NONE' | 'WEEKLY';
  location?: string;
  classType?: string;
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

  getMySchedules: async (): Promise<Schedule[]> => {
    const response = await api.get('/teacher/schedules');
    return response.data;
  },

  getStudentSchedules: async (studentId: number): Promise<Schedule[]> => {
    const response = await api.get(`/schedules/student/${studentId}`);
    return response.data;
  },

  getMyStudentSchedules: async (): Promise<Schedule[]> => {
    const response = await api.get('/student/schedules');
    return response.data;
  },

  getTodaySchedule: async (): Promise<Schedule[]> => {
    try {
      const response = await api.get('/schedules');
      const allSchedules = response.data || [];
      const today = new Date().getDay();
      const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const todayName = dayMap[today];
      return allSchedules.filter((s: Schedule) => s.dayOfWeek === todayName);
    } catch (error) {
      console.error('Failed to fetch today schedule:', error);
      return [];
    }
  },

  getSchedulesByDay: async (dayOfWeek: string): Promise<Schedule[]> => {
    const response = await api.get(`/schedules/day/${dayOfWeek}`);
    return response.data;
  },

  // Teacher-specific methods
  createMySchedule: async (schedule: CreateScheduleRequest): Promise<Schedule> => {
    const response = await api.post('/teacher/schedules', schedule);
    return response.data;
  },

  updateMySchedule: async (id: number, schedule: Partial<CreateScheduleRequest>): Promise<Schedule> => {
    const response = await api.put(`/teacher/schedules/${id}`, schedule);
    return response.data;
  },

  deleteMySchedule: async (id: number): Promise<void> => {
    await api.delete(`/teacher/schedules/${id}`);
  },

  // Admin methods (legacy)
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
