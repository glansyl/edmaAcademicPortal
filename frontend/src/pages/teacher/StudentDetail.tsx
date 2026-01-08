import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { teacherService } from '@/services/teacherService'
import { Student, Course, Marks, Attendance } from '@/types'
import { Sidebar } from '@/components/Sidebar'
import { Card } from '@/components/ui/Card'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Calendar, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Minus
} from 'lucide-react'
import toast from 'react-hot-toast'

export function StudentDetail() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const [student, setStudent] = useState<Student | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [studentMarks, setStudentMarks] = useState<Marks[]>([])
  const [studentAttendance, setStudentAttendance] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAcademics, setIsLoadingAcademics] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'marks' | 'attendance'>('overview')

  useEffect(() => {
    if (studentId) {
      loadStudent()
    }
  }, [studentId])

  useEffect(() => {
    if (student && courses.length > 0) {
      loadAcademicData()
    }
  }, [student, courses])

  const loadStudent = async () => {
    try {
      // Get all students and find the one with matching studentId
      const [students, teacherCourses] = await Promise.all([
        teacherService.getStudents(),
        teacherService.getMyCourses()
      ])
      
      const foundStudent = students.find(s => s.studentId === studentId)
      
      if (foundStudent) {
        setStudent(foundStudent)
        setCourses(teacherCourses)
      } else {
        toast.error('Student not found')
        navigate('/teacher')
      }
    } catch (error) {
      toast.error('Failed to load student details')
      navigate('/teacher')
    } finally {
      setIsLoading(false)
    }
  }

  const loadAcademicData = async () => {
    if (!student) return
    
    setIsLoadingAcademics(true)
    try {
      // Load marks and attendance for all teacher's courses
      const marksPromises = courses.map(course => 
        teacherService.getMarksByCourse(course.id).catch(() => [])
      )
      const attendancePromises = courses.map(course => 
        teacherService.getAttendanceByCourse(course.id).catch(() => [])
      )

      const [allMarksArrays, allAttendanceArrays] = await Promise.all([
        Promise.all(marksPromises),
        Promise.all(attendancePromises)
      ])

      // Flatten and filter for this specific student
      const allMarks = allMarksArrays.flat()
      const allAttendance = allAttendanceArrays.flat()

      const studentMarksData = allMarks.filter(mark => mark.studentId === student.id)
      const studentAttendanceData = allAttendance.filter(att => att.studentId === student.id)

      setStudentMarks(studentMarksData)
      setStudentAttendance(studentAttendanceData)
    } catch (error) {
      console.error('Failed to load academic data:', error)
      // Don't show error toast as this is supplementary data
    } finally {
      setIsLoadingAcademics(false)
    }
  }

  const handleBack = () => {
    navigate('/teacher')
  }

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'ABSENT':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'LATE':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'EXCUSED':
        return <Minus className="h-4 w-4 text-blue-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getGrade = (marksObtained: number, maxMarks: number) => {
    const percentage = (marksObtained / maxMarks) * 100
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B+'
    if (percentage >= 60) return 'B'
    if (percentage >= 50) return 'C'
    return 'F'
  }

  const calculateAttendancePercentage = () => {
    if (studentAttendance.length === 0) return 0
    const presentCount = studentAttendance.filter(att => att.status === 'PRESENT').length
    return Math.round((presentCount / studentAttendance.length) * 100)
  }

  const calculateAverageMarks = () => {
    if (studentMarks.length === 0) return 0
    const totalPercentage = studentMarks.reduce((sum, mark) => {
      return sum + (mark.marksObtained / mark.maxMarks) * 100
    }, 0)
    return Math.round(totalPercentage / studentMarks.length)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Student not found</h3>
            <button
              onClick={handleBack}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 flex-1">
        <div className="mx-auto max-w-4xl px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Student Details</h1>
            <p className="mt-2 text-gray-600">View student information and academic details</p>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('marks')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'marks'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Marks ({studentMarks.length})
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'attendance'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Attendance ({studentAttendance.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Student Information Card */}
              <Card className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="flex items-start space-x-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-blue-600" />
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {student.firstName} {student.lastName}
                    </h2>
                    <p className="text-lg text-gray-600 mb-4">Student ID: {student.studentId}</p>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <GraduationCap className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Class</p>
                            <p className="text-sm text-gray-900">{student.className}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Gender</p>
                            <p className="text-sm text-gray-900">{student.gender}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Contact</p>
                            <p className="text-sm text-gray-900">{student.contactNumber}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Date of Birth</p>
                            <p className="text-sm text-gray-900">
                              {new Date(student.dateOfBirth).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Academic Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Average Marks</h3>
                      <p className="text-sm text-gray-600">Across all courses</p>
                    </div>
                  </div>
                  {isLoadingAcademics ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">{calculateAverageMarks()}%</p>
                  )}
                </Card>

                <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <Clock className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>
                      <p className="text-sm text-gray-600">Overall percentage</p>
                    </div>
                  </div>
                  {isLoadingAcademics ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">{calculateAttendancePercentage()}%</p>
                  )}
                </Card>

                <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <BookOpen className="h-8 w-8 text-purple-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Courses</h3>
                      <p className="text-sm text-gray-600">Enrolled in your courses</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'marks' && (
            <div className="space-y-6">
              <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Academic Performance</h3>
                {isLoadingAcademics ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                  </div>
                ) : studentMarks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {studentMarks.map((mark) => {
                          const percentage = (mark.marksObtained / mark.maxMarks) * 100
                          const grade = getGrade(mark.marksObtained, mark.maxMarks)
                          return (
                            <tr key={mark.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {mark.courseName || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {mark.examType}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {mark.marksObtained} / {mark.maxMarks}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {percentage.toFixed(1)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {grade}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {new Date(mark.examDate).toLocaleDateString()}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No marks recorded yet</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Attendance Records</h3>
                {isLoadingAcademics ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                  </div>
                ) : studentAttendance.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {studentAttendance
                          .sort((a, b) => new Date(b.attendanceDate).getTime() - new Date(a.attendanceDate).getTime())
                          .map((attendance) => (
                            <tr key={attendance.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(attendance.attendanceDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {courses.find(c => c.id === attendance.courseId)?.courseName || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  {getAttendanceIcon(attendance.status)}
                                  <span className="text-sm text-gray-900">{attendance.status}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No attendance records found</p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}