import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { teacherService } from '@/services/teacherService'
import { attendanceService } from '@/services/attendanceService'
import { Course, Student, Attendance } from '@/types'
import { Users, Calendar, CheckCircle, XCircle, Clock, AlertCircle, Download } from 'lucide-react'
import { logger } from '@/lib/logger'
import toast from 'react-hot-toast'
import { generateAttendancePdfFromStudents } from '@/utils/attendancePdfGenerator'

export function TeacherAttendance() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [attendanceRecords, setAttendanceRecords] = useState<Map<number, string>>(new Map())
  const [existingAttendance, setExistingAttendance] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [viewMode, setViewMode] = useState<'mark' | 'view'>('mark')
  const [teacherName, setTeacherName] = useState<string>('')

  useEffect(() => {
    loadCourses()
    loadTeacherProfile()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      loadStudents()
      if (viewMode === 'view') {
        loadExistingAttendance()
      }
    }
  }, [selectedCourse, viewMode])

  useEffect(() => {
    if (selectedCourse && attendanceDate && viewMode === 'mark') {
      checkExistingAttendance()
    }
  }, [selectedCourse, attendanceDate, viewMode])

  const loadCourses = async () => {
    try {
      const data = await teacherService.getMyCourses()
      logger.log('Loaded courses:', data)
      setCourses(data)
      if (data.length === 0) {
        toast.error('No courses assigned to you. Please contact the administrator.')
      }
    } catch (error) {
      logger.error('Failed to load courses:', error)
      toast.error('Failed to load courses')
    }
  }

  const loadTeacherProfile = async () => {
    try {
      const profile = await teacherService.getMyProfile()
      setTeacherName(`${profile.firstName} ${profile.lastName}`)
    } catch (error) {
      logger.error('Failed to load teacher profile:', error)
    }
  }

  const loadStudents = async () => {
    if (!selectedCourse) return
    setIsLoading(true)
    try {
      const data = await teacherService.getStudentsByCourse(selectedCourse.id)
      setStudents(data)
      // Initialize all students as present by default
      const initialRecords = new Map<number, string>()
      data.forEach(student => initialRecords.set(student.id, 'PRESENT'))
      setAttendanceRecords(initialRecords)
    } catch (error) {
      toast.error('Failed to load students')
    } finally {
      setIsLoading(false)
    }
  }

  const checkExistingAttendance = async () => {
    if (!selectedCourse) return
    try {
      const attendance = await attendanceService.getAttendanceByCourse(selectedCourse.id)
      const todayAttendance = attendance.filter(
        a => a.attendanceDate === attendanceDate
      )
      
      if (todayAttendance.length > 0) {
        const records = new Map<number, string>()
        todayAttendance.forEach(a => {
          records.set(a.studentId, a.status)
        })
        setAttendanceRecords(records)
        toast.success('Loaded existing attendance for this date')
      }
    } catch (error) {
      logger.log('No existing attendance found')
    }
  }

  const loadExistingAttendance = async () => {
    if (!selectedCourse) return
    setIsLoading(true)
    try {
      const data = await attendanceService.getAttendanceByCourse(selectedCourse.id)
      setExistingAttendance(data.sort((a, b) => 
        new Date(b.attendanceDate).getTime() - new Date(a.attendanceDate).getTime()
      ))
    } catch (error) {
      toast.error('Failed to load attendance records')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = (studentId: number, status: string) => {
    setAttendanceRecords(prev => new Map(prev.set(studentId, status)))
  }

  const markAllPresent = () => {
    const allPresent = new Map<number, string>()
    students.forEach(student => allPresent.set(student.id, 'PRESENT'))
    setAttendanceRecords(allPresent)
    toast.success('Marked all students as present')
  }

  const markAllAbsent = () => {
    const allAbsent = new Map<number, string>()
    students.forEach(student => allAbsent.set(student.id, 'ABSENT'))
    setAttendanceRecords(allAbsent)
    toast.success('Marked all students as absent')
  }

  const handleSaveAttendance = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course')
      return
    }

    setIsSaving(true)
    try {
      const promises = Array.from(attendanceRecords.entries()).map(([studentId, status]) =>
        attendanceService.markAttendance({
          studentId,
          courseId: selectedCourse.id,
          attendanceDate,
          status,
        })
      )

      await Promise.all(promises)
      toast.success('Attendance saved successfully')
    } catch (error) {
      toast.error('Failed to save attendance')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course')
      return
    }

    if (students.length === 0) {
      toast.error('No attendance data to download')
      return
    }

    setIsGeneratingPdf(true)
    try {
      generateAttendancePdfFromStudents(
        students,
        attendanceRecords,
        selectedCourse,
        attendanceDate,
        teacherName
      )
      toast.success('PDF downloaded successfully')
    } catch (error) {
      logger.error('Failed to generate PDF:', error)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'ABSENT':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'LATE':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'EXCUSED':
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'ABSENT':
        return 'bg-red-50 border-red-200 text-red-700'
      case 'LATE':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'EXCUSED':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Attendance</h1>
          <p className="text-gray-600">Mark and track student attendance for your courses</p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-6 flex gap-2">
          <Button
            onClick={() => setViewMode('mark')}
            variant={viewMode === 'mark' ? 'primary' : 'outline'}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Mark Attendance
          </Button>
          <Button
            onClick={() => setViewMode('view')}
            variant={viewMode === 'view' ? 'primary' : 'outline'}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            View Records
          </Button>
        </div>

        {/* Course Selection */}
        <Card className="p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Course
          </label>
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No courses assigned to you yet.</p>
              <p className="text-sm text-gray-400">Please contact the administrator to assign courses.</p>
            </div>
          ) : (
            <select
              value={selectedCourse?.id || ''}
              onChange={(e) => {
                const course = courses.find(c => c.id === Number(e.target.value))
                setSelectedCourse(course || null)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Choose a course...</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.courseCode} - {course.courseName}
                </option>
              ))}
            </select>
          )}
        </Card>

        {viewMode === 'mark' && selectedCourse && (
          <>
            {/* Date Selection */}
            <Card className="p-6 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attendance Date
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </Card>

            {/* Quick Actions */}
            {students.length > 0 && (
              <div className="mb-6 flex gap-3">
                <Button onClick={markAllPresent} variant="outline" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Mark All Present
                </Button>
                <Button onClick={markAllAbsent} variant="outline" className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Mark All Absent
                </Button>
              </div>
            )}

            {/* Student List */}
            {isLoading ? (
              <Card className="p-12 text-center">
                <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
                <p className="mt-4 text-gray-500">Loading students...</p>
              </Card>
            ) : students.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Students Found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {selectedCourse ? 'No students enrolled in this course' : 'Select a course to view students'}
                </p>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map(student => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.className}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map(status => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(student.id, status)}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                    attendanceRecords.get(student.id) === status
                                      ? getStatusColor(status)
                                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <span className="flex items-center gap-1">
                                    {attendanceRecords.get(student.id) === status && getStatusIcon(status)}
                                    {status}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                  <Button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf || !selectedCourse || students.length === 0}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download Attendance (PDF)
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSaveAttendance}
                    disabled={isSaving || students.length === 0}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Save Attendance
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}

        {viewMode === 'view' && selectedCourse && (
          <Card className="overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
                <p className="mt-4 text-gray-500">Loading records...</p>
              </div>
            ) : existingAttendance.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Records Found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  No attendance records available for this course
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {existingAttendance.map(record => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.attendanceDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                            {getStatusIcon(record.status)}
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
