import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Schedule } from '../services/scheduleService';

interface ScheduleCalendarProps {
  schedules: Schedule[];
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ schedules }) => {
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Time slots from 8 AM to 6 PM
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const formatTime = (time: string) => {
    const [hours] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour} ${ampm}`;
  };

  const getClassTypeColor = (type: string) => {
    switch (type) {
      case 'LECTURE':
        return 'bg-blue-100 border-blue-300 text-blue-900';
      case 'LAB':
        return 'bg-purple-100 border-purple-300 text-purple-900';
      case 'TUTORIAL':
        return 'bg-green-100 border-green-300 text-green-900';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  const getSchedulesForDayAndTime = (day: string, timeSlot: string) => {
    return schedules.filter(schedule => {
      if (schedule.dayOfWeek !== day) return false;
      const scheduleHour = schedule.startTime.split(':')[0];
      const slotHour = timeSlot.split(':')[0];
      return scheduleHour === slotHour;
    });
  };

  const calculateRowSpan = (schedule: Schedule) => {
    const start = parseInt(schedule.startTime.split(':')[0]);
    const end = parseInt(schedule.endTime.split(':')[0]);
    const endMinutes = parseInt(schedule.endTime.split(':')[1]);
    return endMinutes > 0 ? end - start + 1 : end - start;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Calendar Grid */}
        <div className="grid grid-cols-6 border border-gray-200 rounded-lg overflow-hidden">
          {/* Header Row - Time Column */}
          <div className="bg-gray-50 border-r border-gray-200 p-3 font-semibold text-gray-700 text-center">
            Time
          </div>
          
          {/* Header Row - Day Columns */}
          {dayLabels.map((day) => (
            <div
              key={day}
              className="bg-gray-50 border-r border-gray-200 p-3 font-semibold text-gray-700 text-center last:border-r-0"
            >
              {day}
            </div>
          ))}

          {/* Time Slot Rows */}
          {timeSlots.map((timeSlot) => (
            <React.Fragment key={timeSlot}>
              {/* Time Column */}
              <div className="border-r border-t border-gray-200 p-2 text-sm text-gray-600 text-center bg-gray-50 font-medium">
                {formatTime(timeSlot)}
              </div>

              {/* Day Columns */}
              {daysOfWeek.map((day) => {
                const daySchedules = getSchedulesForDayAndTime(day, timeSlot);
                
                return (
                  <div
                    key={`${day}-${timeSlot}`}
                    className="border-r border-t border-gray-200 p-1 min-h-[60px] last:border-r-0 relative"
                  >
                    {daySchedules.map((schedule) => {
                      // Only render if this is the starting time slot
                      const scheduleStartHour = schedule.startTime.split(':')[0];
                      const slotHour = timeSlot.split(':')[0];
                      
                      if (scheduleStartHour === slotHour) {
                        return (
                          <div
                            key={schedule.id}
                            className={`${getClassTypeColor(schedule.classType)} border-l-4 rounded p-2 text-xs absolute top-1 left-1 right-1`}
                            style={{
                              height: `${calculateRowSpan(schedule) * 60 - 8}px`,
                              zIndex: 10
                            }}
                          >
                            <div className="font-semibold mb-1 line-clamp-1">
                              {schedule.courseName}
                            </div>
                            <div className="text-xs opacity-75 mb-1">
                              {schedule.courseCode}
                            </div>
                            <div className="flex items-center gap-1 text-xs opacity-75">
                              <Clock className="w-3 h-3" />
                              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </div>
                            <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                              <MapPin className="w-3 h-3" />
                              {schedule.roomNumber}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
