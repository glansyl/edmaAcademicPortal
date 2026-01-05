import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { studentService } from '@/services/studentService'
import { scheduleService } from '@/services/scheduleService'
import { DashboardStats, Schedule } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  BookX,
  User,
  GraduationCap,
  CalendarDays,
  ArrowRight,
  Info
} from 'lucide-react'

export function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [todaySchedule, setTodaySchedule] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true)
  
  const [error, setError] = useState<string | null>(null)
  const [scheduleError, setScheduleError] = useState<string | null>(null)

  // Helper function to get personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    const name = user?.firstName || user?.name?.split(' ')[0] || 'Student'
    
    if (hour < 12) return `Good morning, ${name} 👋`
    if (hour < 17) return `Good afternoon, ${name} 👋`
    return `Good evening, ${name} 👋`
  }

  // Helper function to get contextual subtitle
  const getContextualSubtitle = () => {
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    return `Here's your academic overview for ${today}`
  }

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setError(null)
      const data = await studentService.getStudentDashboard()
      setStats(data)
    } catch (error: any) {
      logger.error('Failed to fetch dashboard stats', error)
      let errorMessage = 'Failed to load dashboard statistics'
      
      // Handle specific error cases
      if (error?.response?.status === 404 || error?.response?.data?.message?.includes('not found')) {
        errorMessage = 'Student profile not found. Please contact your administrator to set up your student account.'
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch today's schedule
  const fetchTodaySchedule = async () => {
    try {
      setScheduleError(null)
      const data = await scheduleService.getTodaySchedule()
      setTodaySchedule(data)
    } catch (error) {
      logger.error('Failed to fetch schedule', error)
      setScheduleError('Failed to load today\'s schedule')
    } finally {
      setIsLoadingSchedule(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
    fetchTodaySchedule()
  }, [])

  // Retry function for failed requests
  const retryFetch = (type: 'stats' | 'schedule') => {
    switch (type) {
      case 'stats':
        setIsLoading(true)
        fetchDashboardStats()
        break
      case 'schedule':
        setIsLoadingSchedule(true)
        fetchTodaySchedule()
        break
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state with retry option
  if (error && !stats) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Dashboard</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => retryFetch('stats')} className="px-6 py-2">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const courses = stats?.myCourses || []
  const recentMarks = stats?.recentMarks || []
  const hasEnrolledCourses = courses.length > 0

  // Calculate metrics from backend data
  const currentGPA = stats?.gpa || 0
  const totalCredits = stats?.totalCredits || 0
  const attendancePercentage = stats?.attendancePercentage || 0
  
  // Determine semester credit target (typically 15-18 credits)
  const semesterCreditTarget = 18
  const creditsRemaining = Math.max(0, semesterCreditTarget - totalCredits)

  // UX: Show low attendance warning if below 75%
  const isLowAttendance = attendancePercentage > 0 && attendancePercentage < 75

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="w-5 h-5 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        {/* 1️⃣ IMPROVED HEADER AREA */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}
          </h1>
          <p className="text-gray-600">
            {getContextualSubtitle()}
          </p>
        </div>

        {/* UX: Empty state when no courses enrolled */}
        {!hasEnrolledCourses ? (
          <EmptyState
            icon={<BookX className="w-16 h-16" />}
            title="You are not enrolled in any courses yet"
            description="Contact your academic advisor or wait for enrollment confirmation to get started with your courses."
            action={
              <div className="space-y-3">
                <Link to="/student/schedule">
                  <Button variant="outline" className="px-6 py-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Schedule
                  </Button>
                </Link>
                <p className="text-xs text-gray-500">
                  Your courses will appear here once enrollment is confirmed
                </p>
              </div>
            }
          />
        ) : (
          <>
            {/* 5️⃣ REORDERED: Today's Classes comes FIRST (Priority Section) */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" aria-hidden="true" />
                Today's Classes
              </h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {isLoadingSchedule ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : scheduleError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-3">{scheduleError}</p>
                    <Button 
                      onClick={() => retryFetch('schedule')} 
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : todaySchedule.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No classes today
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You don't have any scheduled classes for today.
                    </p>
                    {/* 1️⃣ ADDED GUIDANCE: Next Action hint */}
                    <p className="text-sm text-gray-500 mb-4">
                      Your schedule will update once classes are assigned
                    </p>
                    <Button 
                      onClick={() => navigate('/student/schedule')}
                      variant="outline"
                      size="sm"
                    >
                      <CalendarDays className="w-4 h-4 mr-2" />
                      View Weekly Schedule
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todaySchedule.map((item, index) => (
                      <div 
                        key={item.id || index} 
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                        role="article"
                        aria-label={`${item.courseName} at ${item.startTime}`}
                      >
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg flex-shrink-0">
                          <Clock className="w-6 h-6 text-blue-600" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-blue-600">
                            {item.startTime} - {item.endTime}
                          </p>
                          <p className="text-base font-semibold text-gray-900 truncate">
                            {item.courseName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.courseCode} • {item.room} • {item.teacherName || 'Instructor'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4️⃣ IMPROVED CURRENT COURSES SECTION */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-green-600" aria-hidden="true" />
                Current Courses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => {
                  // Find marks for this course
                  const courseMarks = recentMarks.filter(m => m.course?.id === course.id)
                  const avgPercentage = courseMarks.length > 0
                    ? courseMarks.reduce((sum, m) => sum + (m.marksObtained / m.maxMarks) * 100, 0) / courseMarks.length
                    : null
                  
                  const getGrade = (percentage: number) => {
                    if (percentage >= 90) return { grade: 'A+', color: 'bg-green-600' }
                    if (percentage >= 85) return { grade: 'A', color: 'bg-green-500' }
                    if (percentage >= 80) return { grade: 'A-', color: 'bg-green-400' }
                    if (percentage >= 75) return { grade: 'B+', color: 'bg-blue-500' }
                    if (percentage >= 70) return { grade: 'B', color: 'bg-blue-400' }
                    if (percentage >= 65) return { grade: 'B-', color: 'bg-yellow-500' }
                    if (percentage >= 60) return { grade: 'C+', color: 'bg-orange-500' }
                    return { grade: 'C', color: 'bg-red-500' }
                  }

                  const gradeInfo = avgPercentage ? getGrade(avgPercentage) : null

                  // 2️⃣ INCREASED INFORMATION VALUE: Get status badge
                  const getStatusBadge = () => {
                    if (courseMarks.length === 0) {
                      return { text: 'Awaiting Grades', color: 'bg-gray-100 text-gray-600' }
                    }
                    return { text: 'Ongoing', color: 'bg-blue-100 text-blue-700' }
                  }

                  const statusBadge = getStatusBadge()

                  return (
                    <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-150">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{course.courseName}</h3>
                          <p className="text-sm text-gray-600 mb-2">{course.courseCode}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {course.credits} credits
                            </span>
                            {course.teacherNames && course.teacherNames.length > 0 && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {course.teacherNames[0]}
                              </span>
                            )}
                          </div>
                          {/* 2️⃣ ADDED STATUS BADGE */}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.text}
                          </span>
                        </div>
                        {gradeInfo && (
                          <div className={`${gradeInfo.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                            {gradeInfo.grade}
                          </div>
                        )}
                      </div>
                      
                      {avgPercentage && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium text-gray-900">{avgPercentage.toFixed(0)}%</span>
                          </div>
                          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`absolute h-full ${gradeInfo?.color || 'bg-gray-400'} rounded-full transition-all duration-300`}
                              style={{ width: `${avgPercentage}%` }}
                              role="progressbar"
                              aria-valuenow={avgPercentage}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`Course progress: ${avgPercentage.toFixed(0)}%`}
                            />
                          </div>
                        </div>
                      )}
                      
                      {!avgPercentage && (
                        <div className="text-center py-2">
                          <p className="text-sm text-gray-500">No grades available yet</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 2️⃣ IMPROVED METRIC CARDS - Now at bottom as supporting info */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Academic Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : (
                  <>
                    {/* 2️⃣ IMPROVED CREDITS CARD */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-150">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-600 text-sm font-medium flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Credits
                          <div className="group relative">
                            <Info className="w-3 h-3 text-gray-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Total credits enrolled this semester
                            </div>
                          </div>
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <p className="text-3xl font-bold text-gray-900">{totalCredits}</p>
                        {totalCredits > 0 && (
                          <>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium text-gray-900">{totalCredits} / {semesterCreditTarget}</span>
                              </div>
                              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="absolute h-full bg-blue-600 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min((totalCredits / semesterCreditTarget) * 100, 100)}%` }}
                                  role="progressbar"
                                  aria-valuenow={totalCredits}
                                  aria-valuemin={0}
                                  aria-valuemax={semesterCreditTarget}
                                  aria-label={`Credits progress: ${totalCredits} of ${semesterCreditTarget}`}
                                />
                              </div>
                            </div>
                            <p className="text-sm text-gray-500">
                              {creditsRemaining > 0 
                                ? `${creditsRemaining} credits remaining this semester`
                                : 'Full course load achieved'
                              }
                            </p>
                          </>
                        )}
                        {totalCredits === 0 && (
                          <p className="text-sm text-gray-500">
                            Credits will show after course enrollment
                          </p>
                        )}
                        {/* 3️⃣ ADDED CONTEXTUAL MICRO-COPY */}
                        <p className="text-xs text-gray-400 mt-2">
                          Semester requirement: 18 credits
                        </p>
                      </div>
                    </div>

                    {/* 2️⃣ IMPROVED ATTENDANCE CARD */}
                    <div className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow duration-150 ${
                      isLowAttendance 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-600 text-sm font-medium flex items-center gap-2" id="attendance-label">
                          <Calendar className="w-4 h-4" />
                          Attendance
                          <div className="group relative">
                            <Info className="w-3 h-3 text-gray-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Overall attendance percentage
                            </div>
                          </div>
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <p 
                          className={`text-3xl font-bold ${
                            attendancePercentage === 0 
                              ? 'text-gray-400' 
                              : isLowAttendance 
                                ? 'text-red-700' 
                                : 'text-gray-900'
                          }`}
                          aria-labelledby="attendance-label"
                        >
                          {attendancePercentage.toFixed(0)}%
                        </p>
                        {attendancePercentage === 0 ? (
                          <p className="text-sm text-gray-500">
                            Attendance will update after your first class
                          </p>
                        ) : isLowAttendance ? (
                          <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" aria-hidden="true" />
                            Below required 75%
                          </p>
                        ) : (
                          <p className="text-sm text-green-600 font-medium">
                            Good attendance record
                          </p>
                        )}
                        {/* 3️⃣ ADDED CONTEXTUAL MICRO-COPY */}
                        {attendancePercentage > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            Based on recorded classes so far
                          </p>
                        )}
                      </div>
                    </div>

                    {/* GPA Card - Only show when student has grades */}
                    {currentGPA > 0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-150">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-gray-600 text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            GPA
                            <div className="group relative">
                              <Info className="w-3 h-3 text-gray-400 cursor-help" />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Current semester GPA
                              </div>
                            </div>
                          </h3>
                        </div>
                        <div className="space-y-1">
                          <p className="text-3xl font-bold text-gray-900">{currentGPA.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">Current semester</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}