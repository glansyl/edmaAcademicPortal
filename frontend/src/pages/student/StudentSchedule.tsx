import { useEffect, useState } from 'react';
import { scheduleService } from '../../services/scheduleService';
import { studentService } from '../../services/studentService';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '@/lib/logger';

type ScheduleItem = {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  startTime: string;
  endTime: string;
  course: string;
  code: string;
  room: string;
  color: string;
};

type ViewMode = 'today' | 'week';

const StudentSchedule = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  const courseColors: Record<string, string> = {
    'CS101': 'bg-blue-500',
    'CS102': 'bg-purple-500',
    'CS103': 'bg-green-500',
    'CS104': 'bg-orange-500',
    'CS105': 'bg-pink-500',
    'CS106': 'bg-indigo-500',
  };

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
      // Fetch student profile first to get Student.id
      const profile = await studentService.getMyProfile();
      const data = await scheduleService.getStudentSchedules(profile.id);
      const formattedData: ScheduleItem[] = data.map((item: Schedule) => {
        // Convert MONDAY to Monday
        const dayName = item.dayOfWeek.charAt(0) + item.dayOfWeek.slice(1).toLowerCase();
        return {
          day: dayName as "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday",
          startTime: item.startTime,
          endTime: item.endTime,
          course: item.courseName,
          code: item.courseCode,
          room: item.roomNumber,
          color: courseColors[item.courseCode] || 'bg-gray-500'
        };
      });
      setSchedules(formattedData);
    } catch (error: any) {
      logger.error('Failed to load schedules:', error);
      setError('Failed to load schedule. Please try again later.');
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

  const getClassPosition = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = (startHour - 8) * 60 + startMin;
    const endMinutes = (endHour - 8) * 60 + endMin;
    const duration = endMinutes - startMinutes;
    
    return {
      top: `${(startMinutes / 60) * 60}px`,
      height: `${(duration / 60) * 60}px`
    };
  };

  const getTodaySchedule = (): ScheduleItem[] => {
    const today = new Date().toLocaleString('en-US', { weekday: 'long' }) as "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
    return schedules.filter(s => s.day === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
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
              getTodaySchedule().map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex">
                    <div className={`w-1.5 rounded-l-lg ${item.color}`} />
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{item.course}</h3>
                          <p className="text-sm text-gray-600">{item.code}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(item.startTime)} - {formatTime(item.endTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{item.room}</span>
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
                    className="h-[60px] px-3 py-2 text-sm text-gray-600 border-b border-gray-200 text-right"
                    style={{ height: '60px' }}
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
                      style={{ height: '60px' }}
                    />
                  ))}

                  {/* Classes positioned absolutely */}
                  {schedules
                    .filter(s => s.day === day)
                    .map((item, index) => {
                      const position = getClassPosition(item.startTime, item.endTime);
                      return (
                        <div
                          key={index}
                          className={`absolute left-1 right-1 ${item.color} text-white rounded-md px-2 py-1 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow z-10`}
                          style={{
                            top: position.top,
                            height: position.height,
                            minHeight: '40px'
                          }}
                        >
                          <div className="text-xs font-semibold truncate">{item.code}</div>
                          <div className="text-xs opacity-90 truncate">{item.course}</div>
                          <div className="text-xs opacity-75 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{item.room}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSchedule;
