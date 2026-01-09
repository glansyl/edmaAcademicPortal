import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, Calendar, CheckCircle } from 'lucide-react';
import { scheduleService } from '../services/scheduleService';
import { useAuth } from '../contexts/AuthContext';

interface SyncStatus {
  teacherSchedules: number;
  studentSchedules: number;
  lastSync: string;
  isLoading: boolean;
}

export const ScheduleSyncDemo: React.FC = () => {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    teacherSchedules: 0,
    studentSchedules: 0,
    lastSync: '',
    isLoading: false
  });

  const checkSyncStatus = async () => {
    if (!user) return;
    
    setSyncStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      let teacherCount = 0;
      let studentCount = 0;
      
      if (user.role === 'TEACHER') {
        const teacherSchedules = await scheduleService.getMySchedules();
        teacherCount = teacherSchedules.length;
      }
      
      if (user.role === 'STUDENT') {
        const studentSchedules = await scheduleService.getMyStudentSchedules();
        studentCount = studentSchedules.length;
      }
      
      setSyncStatus({
        teacherSchedules: teacherCount,
        studentSchedules: studentCount,
        lastSync: new Date().toLocaleTimeString(),
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to check sync status:', error);
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    checkSyncStatus();
  }, [user]);

  if (!user || (user.role !== 'TEACHER' && user.role !== 'STUDENT')) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
          Schedule Sync Status
        </h3>
        <button
          onClick={checkSyncStatus}
          disabled={syncStatus.isLoading}
          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncStatus.isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="space-y-2">
        {user.role === 'TEACHER' && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-gray-600">
              <Users className="w-3 h-3 mr-1" />
              My Schedules
            </span>
            <span className="font-medium text-blue-600">{syncStatus.teacherSchedules}</span>
          </div>
        )}
        
        {user.role === 'STUDENT' && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-gray-600">
              <Calendar className="w-3 h-3 mr-1" />
              My Classes
            </span>
            <span className="font-medium text-green-600">{syncStatus.studentSchedules}</span>
          </div>
        )}
        
        {syncStatus.lastSync && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Last updated
            </span>
            <span>{syncStatus.lastSync}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          {user.role === 'TEACHER' 
            ? 'Schedules you create are automatically visible to enrolled students'
            : 'You see schedules from all courses you\'re enrolled in'
          }
        </p>
      </div>
    </div>
  );
};