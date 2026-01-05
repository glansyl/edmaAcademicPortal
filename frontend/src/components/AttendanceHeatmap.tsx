import React from 'react';
import { Attendance } from '../types';

interface AttendanceHeatmapProps {
  attendanceRecords: Attendance[];
  startDate: Date;
  endDate: Date;
}

export const AttendanceHeatmap: React.FC<AttendanceHeatmapProps> = ({
  attendanceRecords,
  startDate,
  endDate,
}) => {
  // Generate array of all dates in range
  const generateDateRange = (start: Date, end: Date): Date[] => {
    const dates: Date[] = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const allDates = generateDateRange(startDate, endDate);

  // Group dates by week
  const groupByWeeks = (dates: Date[]) => {
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    dates.forEach((date, index) => {
      currentWeek.push(date);
      
      // Start new week on Sunday or if it's the last date
      if (date.getDay() === 6 || index === dates.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    return weeks;
  };

  const weeks = groupByWeeks(allDates);

  // Get attendance status for a specific date
  const getAttendanceStatus = (date: Date): 'present' | 'absent' | 'no-class' => {
    const dateStr = date.toISOString().split('T')[0];
    const record = attendanceRecords.find(
      r => new Date(r.attendanceDate).toISOString().split('T')[0] === dateStr
    );
    
    if (!record) return 'no-class';
    return record.status === 'PRESENT' ? 'present' : 'absent';
  };

  const getColorClass = (status: 'present' | 'absent' | 'no-class'): string => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'absent':
        return 'bg-red-500';
      case 'no-class':
        return 'bg-gray-100';
    }
  };

  const getTooltip = (date: Date, status: 'present' | 'absent' | 'no-class'): string => {
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    switch (status) {
      case 'present':
        return `${dateStr} - Present`;
      case 'absent':
        return `${dateStr} - Absent`;
      case 'no-class':
        return `${dateStr} - No class`;
    }
  };

  const monthLabels = weeks.map(week => {
    const firstDate = week[0];
    return firstDate.toLocaleDateString('en-US', { month: 'short' });
  });

  // Get unique months for labels
  const uniqueMonths: { month: string; index: number }[] = [];
  monthLabels.forEach((month, index) => {
    if (index === 0 || month !== monthLabels[index - 1]) {
      uniqueMonths.push({ month, index });
    }
  });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Attendance Pattern</h3>
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <span>Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 rounded-sm border border-gray-300"></div>
            <span>No class</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-2">
            <div className="w-8"></div>
            {uniqueMonths.map(({ month, index }) => (
              <div
                key={`${month}-${index}`}
                className="text-xs text-gray-600 font-medium"
                style={{ marginLeft: `${index * 16}px` }}
              >
                {month}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2">
              {dayLabels.map(day => (
                <div
                  key={day}
                  className="text-xs text-gray-600 h-4 flex items-center"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
                    const date = week.find(d => d.getDay() === dayIndex);
                    if (!date) {
                      return (
                        <div
                          key={dayIndex}
                          className="w-4 h-4 bg-transparent"
                        />
                      );
                    }
                    
                    const status = getAttendanceStatus(date);
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`w-4 h-4 rounded-sm ${getColorClass(status)} border border-gray-200 hover:ring-2 hover:ring-blue-400 cursor-pointer transition-all`}
                        title={getTooltip(date, status)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-200">
        <div className="text-gray-600">
          {attendanceRecords.filter(r => r.status === 'PRESENT').length} days present
        </div>
        <div className="text-gray-600">
          {attendanceRecords.filter(r => r.status === 'ABSENT').length} days absent
        </div>
        <div className="text-gray-600">
          Total: {attendanceRecords.length} classes
        </div>
      </div>
    </div>
  );
};
