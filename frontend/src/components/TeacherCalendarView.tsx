import React, { useState } from 'react';
import { Plus, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { Schedule } from '../services/scheduleService';

interface TeacherCalendarViewProps {
  schedules: Schedule[];
  onCreateSchedule: (date?: Date, timeSlot?: { start: string; end: string }) => void;
  onEditSchedule: (schedule: Schedule) => void;
  onDeleteSchedule: (scheduleId: number) => void;
}

export const TeacherCalendarView: React.FC<TeacherCalendarViewProps> = ({
  schedules,
  onCreateSchedule,
  onEditSchedule,
  onDeleteSchedule,
}) => {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getSchedulePosition = (startTime: string, endTime: string) => {
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

  const getSchedulesForDay = (day: string) => {
    const dayMap: Record<string, string> = {
      'Monday': 'MONDAY',
      'Tuesday': 'TUESDAY', 
      'Wednesday': 'WEDNESDAY',
      'Thursday': 'THURSDAY',
      'Friday': 'FRIDAY'
    };
    
    return schedules.filter(s => s.dayOfWeek === dayMap[day]);
  };

  const handleTimeSlotClick = (day: string, timeSlot: string) => {
    const dayIndex = weekDays.indexOf(day);
    const today = new Date();
    const targetDate = new Date(today);
    
    // Calculate the date for the selected day (assuming current week)
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    targetDate.setDate(today.getDate() + mondayOffset + dayIndex);
    
    const nextHour = String(parseInt(timeSlot.split(':')[0]) + 1).padStart(2, '0');
    const endTime = `${nextHour}:00`;
    
    onCreateSchedule(targetDate, { start: timeSlot, end: endTime });
  };

  const getCourseColor = (courseCode: string) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-green-500', 
      'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'
    ];
    const hash = courseCode.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Calendar</h3>
        <button
          onClick={() => onCreateSchedule()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Schedule
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-[80px_repeat(5,1fr)]">
        {/* Header Row */}
        <div className="p-4 bg-gray-50 border-r border-b border-gray-200"></div>
        {weekDays.map(day => (
          <div key={day} className="p-4 bg-gray-50 text-center font-semibold text-gray-700 border-r border-b border-gray-200 last:border-r-0">
            {day}
          </div>
        ))}

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

        {/* Day Columns */}
        {weekDays.map((day) => (
          <div key={day} className="relative border-r border-gray-200 last:border-r-0">
            {/* Time Grid Lines */}
            {timeSlots.map((time, index) => (
              <div 
                key={time} 
                className="h-[60px] border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleTimeSlotClick(day, time)}
                title={`Create schedule at ${formatTime(time)}`}
              />
            ))}

            {/* Schedules positioned absolutely */}
            {getSchedulesForDay(day).map((schedule) => {
              const position = getSchedulePosition(schedule.startTime, schedule.endTime);
              const color = getCourseColor(schedule.courseCode);
              
              return (
                <div
                  key={schedule.id}
                  className={`absolute left-1 right-1 ${color} text-white rounded-md px-2 py-1 overflow-hidden cursor-pointer hover:shadow-lg transition-all z-10 group`}
                  style={{
                    top: position.top,
                    height: position.height,
                    minHeight: '40px'
                  }}
                  onClick={() => setSelectedSchedule(schedule)}
                >
                  <div className="text-xs font-semibold truncate">{schedule.courseCode}</div>
                  <div className="text-xs opacity-90 truncate">{schedule.title}</div>
                  {schedule.location && (
                    <div className="text-xs opacity-75 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{schedule.location}</span>
                    </div>
                  )}
                  
                  {/* Action buttons on hover */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditSchedule(schedule);
                      }}
                      className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this schedule?')) {
                          onDeleteSchedule(schedule.id);
                        }
                      }}
                      className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Schedule Details Popup */}
      {selectedSchedule && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSchedule(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{selectedSchedule.title}</h3>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(selectedSchedule.startTime)} - {formatTime(selectedSchedule.endTime)}
              </div>
              
              {selectedSchedule.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {selectedSchedule.location}
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                <strong>Course:</strong> {selectedSchedule.courseCode} - {selectedSchedule.courseName}
              </div>
              
              {selectedSchedule.description && (
                <div className="text-sm text-gray-600">
                  <strong>Description:</strong> {selectedSchedule.description}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  onEditSchedule(selectedSchedule);
                  setSelectedSchedule(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this schedule?')) {
                    onDeleteSchedule(selectedSchedule.id);
                    setSelectedSchedule(null);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};