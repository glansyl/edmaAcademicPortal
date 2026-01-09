import { useEffect, useState } from 'react';
import { scheduleService, Schedule } from '../../services/scheduleService';
import { studentService } from '../../services/studentService';
import { Clock, MapPin, Calendar, BookOpen, User } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';

type ViewMode = 'today' | 'week';

const StudentSchedule = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  const weekDays: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday")[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  useEffect(() => {
    loadSchedules();
  }, [user]);

  const loadSchedules = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Use the new student-specific API endpoint
      const data = await scheduleService.getMyStudentSchedules();
      setSchedules(data);
    } catch (error: any) {
      logger.error('Failed to load schedules:', error);
      setError('Failed to load schedule. Please try again later.');
      toast.error('Failed to load your schedule');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDateTime = (dateTime: string): string => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getClassPosition = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = (startHour - 8) * 60 + startMin;
    const endMinutes = (endHour - 8) * 60 + endMin;
    const duration = endMinutes - startMinutes;
    
    return {
      top: `${(startMinutes / 60) * 60}px`,
      height: `${Math.max((duration / 60) * 60, 40)}px`
    };
  };

  const getTodaySchedule = (): Schedule[] => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    return schedules
      .filter(s => s.dayOfWeek === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getSchedulesForDay = (day: string): Schedule[] => {
    const dayMap: Record<string, string> = {
      'Monday': 'MONDAY',
      'Tuesday': 'TUESDAY', 
      'Wednesday': 'WEDNESDAY',
      'Thursday': 'THURSDAY',
      'Friday': 'FRIDAY'
    };
    
    return schedules
      .filter(s => s.dayOfWeek === dayMap[day])
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getCourseColor = (courseCode: string) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-green-500', 
      'bg-orange-500', 'bg-pink-500', 'bg-indigo-500',
      'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
    ];
    const hash = courseCode.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-gray-600 mt-1">View your class timetable</p>
          </div>
          
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('today')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'today' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'week' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={loadSchedules}
              className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Today's Schedule View */}
        {viewMode === 'today' && (
          <div className="space-y-3">
            {getTodaySchedule().length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes today</h3>
                <p className="text-gray-600">You don't have any scheduled classes today</p>
              </div>
            ) : (
              getTodaySchedule().map((schedule) => (
                <div key={schedule.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex">
                    <div className={`w-1.5 rounded-l-lg ${getCourseColor(schedule.courseCode)}`} />
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">{schedule.title}</h3>
                          <p className="text-sm text-gray-600">{schedule.courseCode} - {schedule.courseName}</p>
                          {schedule.description && (
                            <p className="text-sm text-gray-500 mt-1">{schedule.description}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                            </div>
                            {schedule.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{schedule.location}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {schedule.classType && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getClassTypeColor(schedule.classType)}`}>
                                {schedule.classType}
                              </span>
                            )}
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <User className="w-3 h-3" />
                              <span>{schedule.teacherName}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Weekly Calendar View */}
        {viewMode === 'week' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-gray-200">
              <div className="p-4 bg-gray-50 border-r border-gray-200"></div>
              {weekDays.map(day => (
                <div key={day} className="p-4 bg-gray-50 text-center font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[80px_repeat(5,1fr)] relative">
              {/* Time Column */}
              <div className="bg-gray-50 border-r border-gray-200">
                {timeSlots.map((time, index) => (
                  <div 
                    key={time} 
                    className="h-[60px] px-3 py-2 text-sm text-gray-600 border-b border-gray-200 text-right flex items-center justify-end"
                  >
                    {index < timeSlots.length - 1 && formatTime(time)}
                  </div>
                ))}
              </div>

              {/* Day Columns with Classes */}
              {weekDays.map((day) => (
                <div key={day} className="relative border-r border-gray-200 last:border-r-0">
                  {/* Time Grid Lines */}
                  {timeSlots.map((time) => (
                    <div 
                      key={time} 
                      className="h-[60px] border-b border-gray-100"
                    />
                  ))}

                  {/* Classes positioned absolutely */}
                  {getSchedulesForDay(day).map((schedule) => {
                    const position = getClassPosition(schedule.startTime, schedule.endTime);
                    const color = getCourseColor(schedule.courseCode);
                    
                    return (
                      <div
                        key={schedule.id}
                        className={`absolute left-1 right-1 ${color} text-white rounded-md px-2 py-1 overflow-hidden hover:shadow-lg transition-shadow z-10 cursor-pointer`}
                        style={{
                          top: position.top,
                          height: position.height,
                          minHeight: '40px'
                        }}
                        title={`${schedule.title}\n${schedule.courseCode} - ${schedule.courseName}\nTeacher: ${schedule.teacherName}\nLocation: ${schedule.location || 'TBD'}`}
                      >
                        <div className="text-xs font-semibold truncate">{schedule.courseCode}</div>
                        <div className="text-xs opacity-90 truncate">{schedule.title}</div>
                        {schedule.location && (
                          <div className="text-xs opacity-75 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{schedule.location}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Summary */}
        {schedules.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Schedule Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{schedules.length}</div>
                <div className="text-sm text-blue-700">Total Classes</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(schedules.map(s => s.courseCode)).size}
                </div>
                <div className="text-sm text-green-700">Enrolled Courses</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {getTodaySchedule().length}
                </div>
                <div className="text-sm text-purple-700">Classes Today</div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {schedules.length === 0 && !loading && !error && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No schedules available</h3>
            <p className="text-gray-600 mb-4">
              You don't have any scheduled classes yet. This could be because:
            </p>
            <ul className="text-sm text-gray-500 space-y-1 max-w-md mx-auto">
              <li>• You're not enrolled in any courses</li>
              <li>• Your teachers haven't created schedules yet</li>
              <li>• There's a temporary issue loading your data</li>
            </ul>
            <button 
              onClick={loadSchedules}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSchedule;
