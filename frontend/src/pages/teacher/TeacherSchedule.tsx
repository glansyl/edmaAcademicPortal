import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';
import { scheduleService, Schedule, CreateScheduleRequest } from '../../services/scheduleService';
import { teacherService } from '../../services/teacherService';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { ScheduleModal } from '../../components/ScheduleModal';
import { TeacherCalendarView } from '../../components/TeacherCalendarView';
import { Sidebar } from '../../components/Sidebar';
import { logger } from '../../lib/logger';
import { Course } from '@/types';
import toast from 'react-hot-toast';

const TeacherSchedule: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [modalDate, setModalDate] = useState<Date | undefined>();
  const [modalTimeSlot, setModalTimeSlot] = useState<{ start: string; end: string } | undefined>();

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  
  const dayLabels: Record<string, string> = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    SUNDAY: 'Sunday',
  };

  useEffect(() => {
    fetchData();
    // Set current day
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    setSelectedDay(today);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both schedules and courses
      const [schedulesData, coursesData] = await Promise.all([
        scheduleService.getMySchedules(),
        teacherService.getMyCourses()
      ]);
      
      setSchedules(schedulesData);
      setCourses(coursesData);
    } catch (error: any) {
      logger.error('Error fetching data:', error);
      setError('Failed to load data. Please try again later.');
      toast.error('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = (date?: Date, timeSlot?: { start: string; end: string }) => {
    setEditingSchedule(null);
    setModalDate(date);
    setModalTimeSlot(timeSlot);
    setIsModalOpen(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setModalDate(undefined);
    setModalTimeSlot(undefined);
    setIsModalOpen(true);
  };

  const handleSubmitSchedule = async (scheduleData: CreateScheduleRequest) => {
    try {
      if (editingSchedule) {
        // Update existing schedule
        await scheduleService.updateMySchedule(editingSchedule.id, scheduleData);
        toast.success('Schedule updated successfully');
      } else {
        // Create new schedule
        await scheduleService.createMySchedule(scheduleData);
        toast.success('Schedule created successfully');
      }
      
      // Refresh schedules
      await fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      logger.error('Error saving schedule:', error);
      const message = error.response?.data?.message || error.message || 'Failed to save schedule';
      toast.error(message);
      throw error; // Re-throw to show in modal
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      await scheduleService.deleteMySchedule(scheduleId);
      toast.success('Schedule deleted successfully');
      await fetchData();
    } catch (error: any) {
      logger.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };

  const getSchedulesByDay = (day: string) => {
    return schedules
      .filter(schedule => schedule.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getClassTypeColor = (type: string) => {
    switch (type) {
      case 'LECTURE':
        return 'bg-blue-100 text-blue-800';
      case 'LAB':
        return 'bg-purple-100 text-purple-800';
      case 'TUTORIAL':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTodaySchedule = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    return getSchedulesByDay(today);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-gray-600 mt-1">Manage your teaching schedule</p>
          </div>
          <button
            onClick={() => handleCreateSchedule()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Schedule
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Today's Classes Card */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Today's Classes
            </h2>
            {getTodaySchedule().length > 0 ? (
              <div className="space-y-3">
                {getTodaySchedule().map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleEditSchedule(schedule)}
                  >
                    <div className="flex-shrink-0 w-20 text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {formatTime(schedule.startTime)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(schedule.endTime)}
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {schedule.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getClassTypeColor(schedule.classType)}`}>
                          {schedule.classType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{schedule.courseCode}</p>
                      {schedule.location && (
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" />
                          {schedule.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Calendar className="w-12 h-12" />}
                title="No classes scheduled for today"
                description="Click 'Create Schedule' to add your first class"
              />
            )}
          </div>
        </Card>

        {/* Interactive Calendar View */}
        <TeacherCalendarView
          schedules={schedules}
          onCreateSchedule={handleCreateSchedule}
          onEditSchedule={handleEditSchedule}
          onDeleteSchedule={handleDeleteSchedule}
        />

        {/* List View by Day */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule by Day</h2>
            
            {/* Day Selector */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                    selectedDay === day
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {dayLabels[day]}
                </button>
              ))}
            </div>

            {/* Schedule for Selected Day */}
            {getSchedulesByDay(selectedDay).length > 0 ? (
              <div className="space-y-4">
                {getSchedulesByDay(selectedDay).map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-start p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleEditSchedule(schedule)}
                  >
                    <div className="flex-shrink-0 w-24 text-center">
                      <Clock className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                      <div className="text-sm font-medium text-gray-900">
                        {formatTime(schedule.startTime)}
                      </div>
                      <div className="text-xs text-gray-500">to</div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatTime(schedule.endTime)}
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {schedule.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {schedule.courseCode} - {schedule.courseName}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getClassTypeColor(schedule.classType)}`}>
                          {schedule.classType}
                        </span>
                      </div>
                      {schedule.location && (
                        <div className="flex items-center mt-3 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {schedule.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Calendar className="w-12 h-12" />}
                title={`No classes scheduled for ${dayLabels[selectedDay]}`}
                description="Click on a time slot in the calendar above to create a new schedule"
              />
            )}
          </div>
        </Card>
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitSchedule}
        courses={courses}
        selectedDate={modalDate}
        selectedTimeSlot={modalTimeSlot}
        editingSchedule={editingSchedule}
      />
    </div>
  );
};

export default TeacherSchedule;
