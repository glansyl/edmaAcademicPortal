import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, BookOpen, FileText } from 'lucide-react';
import { Course } from '@/types';
import { CreateScheduleRequest, Schedule } from '../services/scheduleService';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (schedule: CreateScheduleRequest) => Promise<void>;
  courses: Course[];
  selectedDate?: Date;
  selectedTimeSlot?: { start: string; end: string };
  editingSchedule?: Schedule | null;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  courses,
  selectedDate,
  selectedTimeSlot,
  editingSchedule,
}) => {
  const [formData, setFormData] = useState<CreateScheduleRequest>({
    courseId: 0,
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    recurrence: 'NONE',
    location: '',
    classType: 'LECTURE',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (editingSchedule) {
        // Populate form with existing schedule data
        setFormData({
          courseId: editingSchedule.courseId,
          title: editingSchedule.title,
          description: editingSchedule.description || '',
          startDateTime: editingSchedule.startDateTime,
          endDateTime: editingSchedule.endDateTime,
          recurrence: editingSchedule.recurrence,
          location: editingSchedule.location || '',
          classType: editingSchedule.classType || 'LECTURE',
        });
      } else {
        // Reset form for new schedule
        const now = new Date();
        const defaultDate = selectedDate || now;
        const defaultStartTime = selectedTimeSlot?.start || '09:00';
        const defaultEndTime = selectedTimeSlot?.end || '10:00';
        
        // Format datetime for input
        const dateStr = defaultDate.toISOString().split('T')[0];
        const startDateTime = `${dateStr}T${defaultStartTime}`;
        const endDateTime = `${dateStr}T${defaultEndTime}`;

        setFormData({
          courseId: 0,
          title: '',
          description: '',
          startDateTime,
          endDateTime,
          recurrence: 'NONE',
          location: '',
          classType: 'LECTURE',
        });
      }
      setErrors({});
    }
  }, [isOpen, selectedDate, selectedTimeSlot, editingSchedule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.courseId) newErrors.courseId = 'Course is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.startDateTime) newErrors.startDateTime = 'Start time is required';
    if (!formData.endDateTime) newErrors.endDateTime = 'End time is required';
    if (new Date(formData.startDateTime) >= new Date(formData.endDateTime)) {
      newErrors.endDateTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save schedule' });
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    setFormData(prev => ({
      ...prev,
      courseId,
      title: course ? `${course.courseName} - ${course.courseCode}` : prev.title,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            {editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Course *
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => handleCourseChange(Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.courseId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value={0}>Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseCode} - {course.courseName}
                </option>
              ))}
            </select>
            {errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="w-4 h-4 inline mr-1" />
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter class title"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Optional description"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Start Time *
              </label>
              <input
                type="datetime-local"
                value={formData.startDateTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startDateTime: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startDateTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDateTime && <p className="text-red-500 text-xs mt-1">{errors.startDateTime}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="datetime-local"
                value={formData.endDateTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endDateTime: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDateTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDateTime && <p className="text-red-500 text-xs mt-1">{errors.endDateTime}</p>}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Room number or location"
            />
          </div>

          {/* Class Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Type
            </label>
            <select
              value={formData.classType}
              onChange={(e) => setFormData(prev => ({ ...prev, classType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LECTURE">Lecture</option>
              <option value="LAB">Lab</option>
              <option value="TUTORIAL">Tutorial</option>
            </select>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recurrence
            </label>
            <select
              value={formData.recurrence}
              onChange={(e) => setFormData(prev => ({ ...prev, recurrence: e.target.value as 'NONE' | 'WEEKLY' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NONE">One-time event</option>
              <option value="WEEKLY">Weekly</option>
            </select>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (editingSchedule ? 'Updating...' : 'Creating...') : (editingSchedule ? 'Update Schedule' : 'Create Schedule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};