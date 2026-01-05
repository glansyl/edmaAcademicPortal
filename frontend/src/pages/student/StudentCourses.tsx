import { useEffect, useState } from 'react'
import { studentService } from '@/services/studentService'
import { Course } from '@/types'
import { Sidebar } from '@/components/Sidebar'
import { BookOpen, User, Calendar, Award } from 'lucide-react'
import { Loading } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'

export function StudentCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      const data = await studentService.getMyCourses()
      setCourses(data)
    } catch (error) {
      logger.error('Failed to load courses:', error)
      toast.error('Failed to load courses')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <Loading />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-2">
            You are enrolled in {courses.length} {courses.length === 1 ? 'course' : 'courses'} this semester
          </p>
        </div>

        {courses.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-16 h-16" />}
            title="No courses enrolled"
            description="You are not enrolled in any courses yet. Contact your administrator to enroll in courses."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Course Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {course.courseName}
                    </h3>
                    <p className="text-sm text-gray-600">{course.courseCode}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                </div>

                {/* Course Details */}
                <div className="space-y-3">
                  {course.teacherName && (
                    <div className="flex items-center text-sm text-gray-700">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{course.teacherName}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Semester {course.semester}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-700">
                    <Award className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{course.credits} {course.credits === 1 ? 'Credit' : 'Credits'}</span>
                  </div>
                </div>

                {/* Course Description */}
                {course.description && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                )}

                {/* Course Stats - Placeholder for future features */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-500">View Details</span>
                  <svg 
                    className="w-4 h-4 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
