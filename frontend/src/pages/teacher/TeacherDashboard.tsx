import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { teacherService } from '@/services/teacherService'
import { DashboardStats, Student } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from '@/components/Sidebar'
import { Card } from '@/components/ui/Card'
import { Users, BookOpen, ClipboardList, Clock, Search, User } from 'lucide-react'
import toast from 'react-hot-toast'

export function TeacherDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)

  useEffect(() => {
    loadDashboard()
    loadStudents()
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

  const loadStudents = async () => {
    setIsLoadingStudents(true)
    try {
      const data = await teacherService.getStudents()
      setStudents(data)
    } catch (error) {
      console.error('Failed to load students:', error)
      // Don't show error toast for students as it's not critical for dashboard
    } finally {
      setIsLoadingStudents(false)
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

  const handleStudentClick = (studentId: string) => {
    // Navigate to student detail page
    navigate(`/teacher/students/${studentId}`)
  }

  // Filter students based on search query
  const filteredStudents = students.filter(student => {
    if (!searchQuery.trim()) return false
    
    const query = searchQuery.toLowerCase()
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
    const studentId = student.studentId.toLowerCase()
    
    return fullName.includes(query) || studentId.includes(query)
  }).slice(0, 5) // Limit to max 5 results

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
                <span className="font-medium text-gray-700 text-sm">Total Courses</span>
                <ClipboardList className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.totalCourses || 0}</p>
              <p className="text-sm text-gray-500">Available</p>
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
            {/* My Courses - Left Side */}
            <div className="lg:col-span-2">
              <Card className="p-7 bg-white border border-gray-200 rounded-xl shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-gray-900">My Courses</h2>
                <div className="grid gap-4 md:grid-cols-2">
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

            {/* Quick Student Lookup - Right Side */}
            <div className="lg:col-span-1">
              <Card className="p-7 bg-white border border-gray-200 rounded-xl shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Quick Student Lookup</h2>
                
                {/* Search Input */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or student ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Search Results */}
                <div className="space-y-3">
                  {searchQuery.trim() === '' ? (
                    <div className="text-center py-8">
                      <Search className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">Search to find a student</p>
                    </div>
                  ) : isLoadingStudents ? (
                    <div className="text-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Loading students...</p>
                    </div>
                  ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => handleStudentClick(student.studentId)}
                        className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <User className="h-8 w-8 text-gray-400 bg-gray-100 rounded-full p-1.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              ID: {student.studentId} • {student.className}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <User className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">No students found</p>
                      <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
                    </div>
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
