import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Sidebar } from '../../components/Sidebar'
import { studentService } from '@/services/studentService'
import { Student, DashboardStats } from '@/types'
import { User, Mail, Phone, MapPin, Calendar, BookOpen, TrendingUp, Award } from 'lucide-react'
import { Loading } from '@/components/ui/Loading'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

// Helper functions defined outside component
const getLetterGrade = (gpa: number) => {
  if (gpa <= 0) return null
  if (gpa >= 3.85) return 'A+'
  if (gpa >= 3.7) return 'A'
  if (gpa >= 3.5) return 'A-'
  if (gpa >= 3.3) return 'B+'
  if (gpa >= 3.0) return 'B'
  if (gpa >= 2.7) return 'B-'
  return 'C+'
}

const getAttendanceStatus = (percentage: number, hasAttendanceData: boolean) => {
  if (!hasAttendanceData || percentage === 0) {
    return { status: 'Not started', color: 'text-gray-600' }
  }
  if (percentage >= 90) return { status: 'Excellent', color: 'text-green-600' }
  if (percentage >= 75) return { status: 'Good', color: 'text-green-600' }
  if (percentage >= 60) return { status: 'Fair', color: 'text-yellow-600' }
  return { status: 'Poor', color: 'text-red-600' }
}

export function StudentProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Student | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const [profileData, statsData] = await Promise.all([
        studentService.getMyProfile(),
        studentService.getStudentDashboard()
      ])
      setProfile(profileData)
      setStats(statsData)
    } catch (error) {
      logger.error('Failed to load profile:', error)
      toast.error('Failed to load profile')
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

  const coursesEnrolled = stats?.myCourses?.length || 0
  const gpa = stats?.gpa || 0
  const attendancePercentage = stats?.attendancePercentage || 0
  
  // Check if we have actual attendance data (not just zero)
  const hasAttendanceData = stats?.attendancePercentage !== undefined && stats?.attendancePercentage > 0
  const letterGrade = getLetterGrade(gpa)
  const attendanceInfo = getAttendanceStatus(attendancePercentage, hasAttendanceData)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Profile</h1>
        <p className="text-gray-600 mb-8">View your academic information and performance</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
                {profile?.firstName?.[0]}{profile?.lastName?.[0]}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{profile?.firstName} {profile?.lastName}</h2>
                <p className="text-blue-100 mt-1">Student ID: {profile?.studentId}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Full Name</label>
                    <p className="text-gray-900 font-medium">{profile?.firstName} {profile?.lastName}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Student ID</label>
                    <p className="text-gray-900 font-medium">{profile?.studentId}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Email Address</label>
                    <div className="flex items-center mt-1">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900 font-medium">{user?.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Phone Number</label>
                    <div className="flex items-center mt-1">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900 font-medium">{profile?.contact || 'Not added yet'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Class</label>
                    <p className="text-gray-900 font-medium">{profile?.className || 'Not assigned'}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Gender</label>
                    <p className="text-gray-900 font-medium">{profile?.gender || 'Not specified'}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Date of Birth</label>
                    <div className="flex items-center mt-1">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900 font-medium">
                        {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not added yet'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Account Status</label>
                    <p className={`font-medium ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {user?.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Stats */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Academic Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Courses Enrolled</p>
                  <p className="text-3xl font-bold text-gray-900">{coursesEnrolled}</p>
                  {/* 3️⃣ ADDED CONTEXTUAL MICRO-COPY */}
                  <p className="text-xs text-gray-500 mt-2">Courses assigned for current semester</p>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Current GPA</p>
                  {/* 1️⃣ FIXED GPA LOGIC */}
                  {letterGrade ? (
                    <div className="flex items-baseline">
                      <p className="text-3xl font-bold text-gray-900">{letterGrade}</p>
                      <p className="ml-2 text-sm text-green-600">{gpa.toFixed(2)} GPA</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-medium text-gray-500">GPA not available yet</p>
                      <p className="text-xs text-gray-400 mt-1">Grades will appear after evaluation</p>
                    </div>
                  )}
                  {/* 3️⃣ ADDED CONTEXTUAL MICRO-COPY */}
                  <p className="text-xs text-gray-500 mt-2">Calculated after grades are published</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Attendance</p>
                  {/* 2️⃣ FIXED ATTENDANCE LOGIC */}
                  {hasAttendanceData ? (
                    <div className="flex items-baseline">
                      <p className="text-3xl font-bold text-gray-900">{attendancePercentage.toFixed(0)}%</p>
                      <p className={`ml-2 text-sm ${attendanceInfo.color}`}>{attendanceInfo.status}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-medium text-gray-500">Attendance not started</p>
                      <p className="text-xs text-gray-400 mt-1">Attendance will update after your first class</p>
                    </div>
                  )}
                  {/* 3️⃣ ADDED CONTEXTUAL MICRO-COPY */}
                  <p className="text-xs text-gray-500 mt-2">Based on recorded class sessions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
