import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { scheduleService, Schedule } from '../../services/scheduleService';
import { teacherService } from '../../services/teacherService';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { ScheduleCalendar } from '../../components/ScheduleCalendar';
import { Sidebar } from '../../components/Sidebar';
import { logger } from '../../lib/logger';

const TeacherSchedule: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('');

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
    fetchSchedules();
    // Set current day
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    setSelectedDay(today);
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch teacher profile first to get Teacher.id
      const profile = await teacherService.getMyProfile();
      const data = await scheduleService.getTeacherSchedules(profile.id);
      setSchedules(data);
    } catch (error: any) {
      logger.error('Error fetching schedules:', error);
      setError('Failed to load schedule. Please try again later.');
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-600 mt-1">Manage your teaching schedule</p>
      </div>

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
                  className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200"
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
                        {schedule.courseName}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getClassTypeColor(schedule.classType)}`}>
                        {schedule.classType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{schedule.courseCode}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {schedule.roomNumber}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="w-12 h-12" />}
              title="No classes scheduled for today"
            />
          )}
        </div>
      </Card>

      {/* Calendar View */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Calendar</h2>
          {schedules.length > 0 ? (
            <ScheduleCalendar schedules={schedules} />
          ) : (
            <EmptyState
              icon={<Calendar className="w-12 h-12" />}
              title="No classes scheduled"
            />
          )}
        </div>
      </Card>

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
                  className="flex items-start p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
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
                          {schedule.courseName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {schedule.courseCode}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getClassTypeColor(schedule.classType)}`}>
                        {schedule.classType}
                      </span>
                    </div>
                    <div className="flex items-center mt-3 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      Room {schedule.roomNumber}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="w-12 h-12" />}
              title={`No classes scheduled for ${dayLabels[selectedDay]}`}
            />
          )}
        </div>
      </Card>
      </div>
    </div>
  );
};

export default TeacherSchedule;
