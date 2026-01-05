import { useEffect, useState } from 'react'
import { teacherService } from '@/services/teacherService'
import { Course } from '@/types'
import { Sidebar } from '@/components/Sidebar'
import { BookOpen, Users, Calendar, Award } from 'lucide-react'
import toast from 'react-hot-toast'

export function MyCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      const data = await teacherService.getMyCourses()
      setCourses(data)
    } catch (error) {
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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Courses</h1>

        {courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No courses assigned</h3>
            <p className="mt-2 text-sm text-gray-500">
              You don't have any courses assigned yet. Please contact the administrator.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {course.courseName}
                        </h3>
                        <p className="text-sm text-gray-600">{course.courseCode}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">Semester</span>
                    </div>
                    <span className="font-medium text-gray-900">{course.semester}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <div className="flex items-center text-gray-600">
                      <Award className="h-4 w-4 mr-2" />
                      <span className="text-sm">Credits</span>
                    </div>
                    <span className="font-medium text-gray-900">{course.credits}</span>
                  </div>
                </div>

                {course.description && (
                  <p className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 line-clamp-2">
                    {course.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
