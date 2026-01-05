import { useEffect, useState } from 'react'
import { teacherService } from '@/services/teacherService'
import { DashboardStats } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from '@/components/Sidebar'
import { Card } from '@/components/ui/Card'
import { Users, BookOpen, ClipboardList, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export function TeacherDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const data = await teacherService.getTeacherDashboard()
      setStats(data)
    } catch (error) {
      toast.error('Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
        </div>
      </div>
    )
  }

  const getUserName = () => {
    if (!user?.email) return 'Professor'
    const name = user.email.split('@')[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 flex-1">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {getUserName()}!</h1>
            <p className="mt-2 text-gray-600">Here's an overview of your teaching schedule and tasks.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <span className="font-medium text-gray-700 text-sm">Total Students</span>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.studentsInMyCourses || 0}</p>
              <p className="text-sm text-gray-500">Across {stats?.myCourses?.length || 0} courses</p>
            </Card>

            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <span className="font-medium text-gray-700 text-sm">Courses</span>
                <BookOpen className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.myCourses?.length || 0} <span className="text-base font-normal text-gray-600">Active</span></p>
              <p className="text-sm text-gray-500">This semester</p>
            </Card>

            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <span className="font-medium text-gray-700 text-sm">Total Classes</span>
                <ClipboardList className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.totalClasses || 0}</p>
              <p className="text-sm text-gray-500">Scheduled</p>
            </Card>

            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <span className="font-medium text-gray-700 text-sm">Avg Attendance</span>
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.averageAttendance ? `${stats.averageAttendance.toFixed(0)}%` : 'N/A'}</p>
              <p className="text-sm text-gray-500">Across all courses</p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* My Courses */}
            <div className="lg:col-span-3">
              <Card className="p-7 bg-white border border-gray-200 rounded-xl shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-gray-900">My Courses</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stats?.myCourses && stats.myCourses.length > 0 ? (
                    stats.myCourses.map((course) => (
                      <div key={course.id} className="rounded-lg p-5 bg-white border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex flex-col">
                          <h3 className="font-semibold text-gray-900 text-base">{course.courseName}</h3>
                          <p className="text-sm text-gray-500 mt-1">{course.courseCode}</p>
                          <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                              Sem {course.semester} • {course.credits} Credits
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8 col-span-full">No courses assigned</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
