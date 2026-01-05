import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/DropdownMenu'
import { Course, Student, Enrollment } from '@/types'
import { courseService } from '@/services/courseService'
import { studentService } from '@/services/studentService'
import api from '@/services/api'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'
import { BookOpen, UserPlus, Trash2, CheckCircle, XCircle, Edit, Search, AlertTriangle, CheckSquare, Info, MoreVertical, Eye, Users, Calendar, Award, Lock, GraduationCap } from 'lucide-react'

export function EnrollmentManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showConfirmEnrollModal, setShowConfirmEnrollModal] = useState(false)
  const [showDropConfirmModal, setShowDropConfirmModal] = useState(false)
  const [showCourseChangeWarning, setShowCourseChangeWarning] = useState(false)
  const [pendingCourseId, setPendingCourseId] = useState<number | null>(null)
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<Enrollment | null>(null)
  const [completingEnrollment, setCompletingEnrollment] = useState<Enrollment | null>(null)
  const [finalGrade, setFinalGrade] = useState('')
  const [currentYear] = useState(new Date().getFullYear())
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      loadEnrollments()
      // Reset selections when course changes
      setSelectedStudents([])
      setSearchQuery('')
    } else {
      setEnrollments([])
      setSelectedStudents([])
    }
  }, [selectedCourse, currentYear])

  const loadData = async () => {
    try {
      const [coursesData, studentsData] = await Promise.all([
        courseService.getAllCourses(),
        studentService.getAllStudents()
      ])
      setCourses(coursesData)
      setStudents(studentsData)
    } catch (error: any) {
      console.error('Failed to load data:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to load data'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const loadEnrollments = async () => {
    if (!selectedCourse) return
    try {
      const response = await api.get(`/admin/enrollments/course/${selectedCourse}`)
      setEnrollments(response.data || [])
    } catch (error: any) {
      console.error('Failed to load enrollments:', error)
      const errorMessage = error?.response?.data?.message
      if (errorMessage) toast.error(errorMessage)
    }
  }

  const handleEnroll = async () => {
    if (!selectedCourse || selectedStudents.length === 0) {
      toast.error('Please select a course and at least one student')
      return
    }

    setShowConfirmEnrollModal(true)
  }

  const confirmEnrollment = async () => {
    if (!selectedCourse || !selectedCourseData) return
    
    setShowConfirmEnrollModal(false)
    setIsEnrolling(true)
    let successCount = 0
    let failCount = 0

    for (const studentId of selectedStudents) {
      try {
        await api.post('/admin/enrollments', {
          studentId,
          courseId: selectedCourse,
          semester: selectedCourseData.semester, // Use course's semester
          academicYear: currentYear
        })
        successCount++
      } catch (error: any) {
        failCount++
        logger.error('Failed to enroll student:', error)
      }
    }

    setIsEnrolling(false)
    setSelectedStudents([])
    
    if (successCount > 0) {
      toast.success(`Successfully enrolled ${successCount} student(s)`)
      loadEnrollments()
    }
    if (failCount > 0) {
      toast.error(`Failed to enroll ${failCount} student(s)`)
    }
  }

  const handleDropEnrollment = async (enrollment: Enrollment) => {
    setEnrollmentToDelete(enrollment)
    setShowDropConfirmModal(true)
  }

  const confirmDropEnrollment = async () => {
    if (!enrollmentToDelete) return

    try {
      await api.delete(`/admin/enrollments/${enrollmentToDelete.id}`)
      toast.success('Enrollment removed successfully')
      setShowDropConfirmModal(false)
      setEnrollmentToDelete(null)
      loadEnrollments()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to remove enrollment'
      toast.error(errorMessage)
    }
  }

  const handleCompleteEnrollment = async () => {
    if (!completingEnrollment || !finalGrade) {
      toast.error('Please enter a final grade')
      return
    }

    const grade = parseFloat(finalGrade)
    if (isNaN(grade) || grade < 0 || grade > 100) {
      toast.error('Grade must be between 0 and 100')
      return
    }

    try {
      await api.put(`/admin/enrollments/${completingEnrollment.id}/complete?finalGrade=${grade}`)
      toast.success('Enrollment completed with grade')
      setShowCompleteModal(false)
      setCompletingEnrollment(null)
      setFinalGrade('')
      loadEnrollments()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to complete enrollment'
      toast.error(errorMessage)
    }
  }

  const handleUpdateStatus = async (enrollmentId: number, status: string) => {
    try {
      await api.put(`/admin/enrollments/${enrollmentId}/status?status=${status}`)
      toast.success('Status updated successfully')
      loadEnrollments()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update status'
      toast.error(errorMessage)
    }
  }

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const getEnrolledStudentIds = () => {
    return enrollments.map(e => e.studentId)
  }

  const getAvailableStudents = () => {
    const enrolledIds = getEnrolledStudentIds()
    const available = students.filter(s => !enrolledIds.includes(s.id))
    
    if (!searchQuery.trim()) {
      return available
    }
    
    const query = searchQuery.toLowerCase()
    return available.filter(student => 
      student.firstName.toLowerCase().includes(query) ||
      student.lastName.toLowerCase().includes(query) ||
      student.studentId.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.className?.toLowerCase().includes(query)
    )
  }

  const getSelectedCourse = () => {
    return courses.find(c => c.id === selectedCourse)
  }

  const getActiveEnrollments = () => {
    return enrollments.filter(e => e.status === 'ACTIVE')
  }

  const isFullyEnrolled = () => {
    return availableStudents.length === 0 && !searchQuery
  }

  const isStep1Complete = () => {
    return selectedCourse !== null
  }

  const isStep2Complete = () => {
    return isStep1Complete() && enrollments.length > 0
  }

  const handleCourseChange = (newCourseId: number | null) => {
    // Warn if changing course with active selections
    if (selectedStudents.length > 0 && selectedCourse !== newCourseId) {
      setPendingCourseId(newCourseId)
      setShowCourseChangeWarning(true)
    } else {
      setSelectedCourse(newCourseId)
    }
  }

  const confirmCourseChange = () => {
    setSelectedCourse(pendingCourseId)
    setShowCourseChangeWarning(false)
    setPendingCourseId(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'DROPPED': return 'bg-red-100 text-red-800'
      case 'WITHDRAWN': return 'bg-yellow-100 text-yellow-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const availableStudents = getAvailableStudents()
  const selectedCourseData = getSelectedCourse()
  const activeEnrollmentsCount = getActiveEnrollments().length

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Enrollment Management</h1>
          <p className="text-gray-600 mt-1">Configure course enrollments and manage student registrations</p>
        </div>

        {/* Step Indicator - Functional */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                isStep1Complete() 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                {isStep1Complete() ? '✓' : '1'}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900 block">Configure Course</span>
                {!isStep1Complete() && (
                  <span className="text-xs text-gray-500">Select a course to begin</span>
                )}
              </div>
            </div>
            <div className={`flex-1 h-px mx-4 ${isStep1Complete() ? 'bg-green-600' : 'bg-gray-300'}`} />
            
            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                !isStep1Complete()
                  ? 'bg-gray-200 text-gray-500'
                  : isStep2Complete()
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}>
                {!isStep1Complete() ? (
                  <Lock className="w-4 h-4" />
                ) : isStep2Complete() ? (
                  '✓'
                ) : (
                  '2'
                )}
              </div>
              <div>
                <span className={`text-sm font-medium block ${
                  isStep1Complete() ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  Select Students
                </span>
                {!isStep1Complete() && (
                  <span className="text-xs text-gray-400">Locked</span>
                )}
              </div>
            </div>
            <div className={`flex-1 h-px mx-4 ${isStep2Complete() ? 'bg-green-600' : 'bg-gray-300'}`} />
            
            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                !isStep2Complete()
                  ? 'bg-gray-200 text-gray-500'
                  : 'bg-blue-600 text-white'
              }`}>
                {!isStep2Complete() ? <Lock className="w-4 h-4" /> : '3'}
              </div>
              <div>
                <span className={`text-sm font-medium block ${
                  isStep2Complete() ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  Review Enrollments
                </span>
                {!isStep2Complete() && (
                  <span className="text-xs text-gray-400">Locked</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Enrollment Setup & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Configure Enrollment */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                    1
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Configure Enrollment</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedCourse || ''}
                      onChange={(e) => handleCourseChange(Number(e.target.value) || null)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose a course...</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.courseCode} - {course.courseName} (Sem {course.semester}, {course.credits} credits)
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-gray-500 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>Semester and credits are automatically set based on the course. Enrollment will be created for Academic Year {currentYear}.</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      value={currentYear}
                      disabled
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Current academic year is automatically selected
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Student Selection */}
            {selectedCourse && (
              <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${
                isFullyEnrolled() ? 'opacity-60' : ''
              }`}>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                        2
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">Select Students to Enroll</h2>
                      {isFullyEnrolled() && (
                        <Lock className="w-4 h-4 text-gray-400 ml-2" />
                      )}
                    </div>
                    {selectedStudents.length > 0 && !isFullyEnrolled() && (
                      <Badge variant="secondary" className="text-sm">
                        {selectedStudents.length} selected
                      </Badge>
                    )}
                  </div>
                  {isFullyEnrolled() && (
                    <div className="mt-3 flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <CheckSquare className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-600">
                        <strong className="text-gray-900">Enrollment Complete:</strong> All available students are enrolled. Change course to enroll additional students.
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {availableStudents.length === 0 && !searchQuery ? (
                    // All students enrolled state
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
                        <CheckSquare className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">All Students Enrolled</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Every student is already enrolled in this course for the selected semester.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedCourse(null)}
                        >
                          Select Different Course
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Search Bar */}
                      <div className="mb-4 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name, student ID, email, or class..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {availableStudents.length === 0 ? (
                        // No search results
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <p className="text-gray-600">
                            No students found matching "<span className="font-medium">{searchQuery}</span>"
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Student List */}
                          <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                            <div className="max-h-80 overflow-y-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                  <tr>
                                    <th className="w-12 px-4 py-3">
                                      <input
                                        type="checkbox"
                                        checked={selectedStudents.length === availableStudents.length && availableStudents.length > 0}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedStudents(availableStudents.map(s => s.id))
                                          } else {
                                            setSelectedStudents([])
                                          }
                                        }}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {availableStudents.map(student => (
                                    <tr
                                      key={student.id}
                                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                                        selectedStudents.includes(student.id) ? 'bg-blue-50' : ''
                                      }`}
                                      onClick={() => toggleStudentSelection(student.id)}
                                    >
                                      <td className="px-4 py-3">
                                        <input
                                          type="checkbox"
                                          checked={selectedStudents.includes(student.id)}
                                          onChange={() => toggleStudentSelection(student.id)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-gray-900">
                                          {student.firstName} {student.lastName}
                                        </div>
                                        <div className="text-xs text-gray-500">{student.email}</div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <code className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                                          S-{student.studentId}
                                        </code>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-700">
                                        {student.className || '—'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Enrollment Action */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                              {selectedStudents.length > 0 ? (
                                <span>
                                  <span className="font-medium text-gray-900">{selectedStudents.length}</span> student{selectedStudents.length !== 1 ? 's' : ''} selected
                                </span>
                              ) : (
                                <span>Select students to enroll</span>
                              )}
                            </div>
                            <Button
                              onClick={handleEnroll}
                              disabled={isEnrolling || selectedStudents.length === 0}
                              size="lg"
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              {isEnrolling ? 'Enrolling...' : `Enroll ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}
                            </Button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Course Context Panel */}
          {selectedCourse && (
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 overflow-hidden sticky top-8">
                <div className="p-4 bg-blue-600 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4" />
                    <h3 className="font-semibold text-sm">Course Context</h3>
                  </div>
                  <p className="text-xs text-blue-100">Enrollment configuration summary</p>
                </div>
                
                <div className="p-6 space-y-4">
                  {/* Course Info */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">Course</div>
                    <div className="font-semibold text-gray-900">{selectedCourseData?.courseName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-white px-2 py-0.5 rounded text-gray-700 border border-gray-200">
                        {selectedCourseData?.courseCode}
                      </code>
                      <Badge variant="secondary" className="text-xs">
                        {selectedCourseData?.credits} credits
                      </Badge>
                    </div>
                  </div>

                  {/* Instructor Info */}
                  <div className="border-t border-blue-200 pt-4">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">Instructor(s)</div>
                    {selectedCourseData?.teacherNames && selectedCourseData.teacherNames.length > 0 ? (
                      <div className="space-y-1">
                        {selectedCourseData.teacherNames.map((name, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-900">
                            <GraduationCap className="w-4 h-4 text-gray-400" />
                            <span>{name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Not assigned</div>
                    )}
                  </div>

                  <div className="border-t border-blue-200 pt-4">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">Period</div>
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Semester {selectedCourseData?.semester}, {currentYear}</span>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-4">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-2">Enrollment Status</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Enrolled:</span>
                        <span className="font-semibold text-gray-900">{enrollments.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Active:</span>
                        <span className="font-semibold text-green-600">{activeEnrollmentsCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-semibold text-blue-600">{availableStudents.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-blue-100">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="text-xs text-gray-500">Unlimited</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-4">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-2">Enrollment Window</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${availableStudents.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className={`text-sm font-medium ${availableStudents.length > 0 ? 'text-green-700' : 'text-gray-600'}`}>
                        {availableStudents.length > 0 ? 'Open for Enrollment' : 'Fully Enrolled'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {availableStudents.length > 0 
                        ? `${availableStudents.length} student${availableStudents.length !== 1 ? 's' : ''} can be enrolled`
                        : 'All students are currently enrolled'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Current Enrollments */}
        {selectedCourse && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                  3
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Current Enrollments</h2>
                <Badge variant="secondary" className="ml-2">
                  {enrollments.length} total
                </Badge>
              </div>
            </div>

            {enrollments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Enrollments Yet</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  No students are currently enrolled in this course for the selected semester. Use the form above to enroll students.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enrollments.map(enrollment => (
                      <tr key={enrollment.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">
                            {enrollment.studentName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                            S-{students.find(s => s.id === enrollment.studentId)?.studentId}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              enrollment.status === 'ACTIVE' ? 'default' :
                              enrollment.status === 'COMPLETED' ? 'secondary' :
                              'secondary'
                            }
                          >
                            {enrollment.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          Sem {enrollment.semester} / {enrollment.academicYear}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {enrollment.finalGrade ? (
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-yellow-500" />
                              <span className="font-medium text-gray-900">
                                {enrollment.finalGrade.toFixed(1)}%
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {enrollment.letterGrade}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not graded</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <DropdownMenu
                            trigger={
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            }
                          >
                            <DropdownMenuItem
                              icon={<Eye className="h-4 w-4" />}
                              onClick={() => toast('View details coming soon', { icon: '👀' })}
                            >
                              View Details
                            </DropdownMenuItem>
                            {enrollment.status === 'ACTIVE' && (
                              <>
                                <DropdownMenuItem
                                  icon={<CheckCircle className="h-4 w-4" />}
                                  onClick={() => {
                                    setCompletingEnrollment(enrollment)
                                    setFinalGrade('')
                                    setShowCompleteModal(true)
                                  }}
                                >
                                  Complete with Grade
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  icon={<Trash2 className="h-4 w-4" />}
                                  onClick={() => handleDropEnrollment(enrollment)}
                                  variant="danger"
                                >
                                  Remove Enrollment
                                </DropdownMenuItem>
                              </>
                            )}
                            {enrollment.status === 'COMPLETED' && enrollment.finalGrade && (
                              <DropdownMenuItem
                                icon={<Edit className="h-4 w-4" />}
                                onClick={() => {
                                  setCompletingEnrollment(enrollment)
                                  setFinalGrade(enrollment.finalGrade?.toString() || '')
                                  setShowCompleteModal(true)
                                }}
                              >
                                Edit Grade
                              </DropdownMenuItem>
                            )}
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Course Change Warning Modal */}
      <Modal
        isOpen={showCourseChangeWarning}
        onClose={() => setShowCourseChangeWarning(false)}
        title="Confirm Course Change"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-medium mb-2">
                You have {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Changing the course will clear your current student selections. Are you sure you want to continue?
              </p>
              <div className="bg-gray-50 rounded p-3 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Current course:</div>
                <div className="text-sm font-medium text-gray-900">
                  {selectedCourseData?.courseCode} - {selectedCourseData?.courseName}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCourseChangeWarning(false)
                setPendingCourseId(null)
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmCourseChange}
            >
              Change Course
            </Button>
          </div>
        </div>
      </Modal>

      {/* Enrollment Confirmation Modal - Enhanced */}
      <Modal
        isOpen={showConfirmEnrollModal}
        onClose={() => setShowConfirmEnrollModal(false)}
        title="Review & Confirm Enrollment"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-medium mb-3">
                You are about to enroll {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} in:
              </p>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 mb-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">COURSE</div>
                    <div className="font-semibold text-gray-900">{selectedCourseData?.courseName}</div>
                    <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200 mt-1 inline-block">
                      {selectedCourseData?.courseCode}
                    </code>
                  </div>
                  <Badge variant="secondary">{selectedCourseData?.credits} credits</Badge>
                </div>
                <div className="border-t border-blue-200 pt-2">
                  <div className="text-xs text-gray-500 mb-1">PERIOD</div>
                  <div className="text-sm font-medium text-gray-900">
                    Semester {selectedCourseData?.semester}, Academic Year {currentYear}
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <strong>{selectedStudents.length}</strong> enrollment record{selectedStudents.length !== 1 ? 's' : ''} will be created with <strong>ACTIVE</strong> status
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Students will be able to view this course in their dashboard. You can manage these enrollments in the table below.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmEnrollModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmEnrollment}
              size="lg"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Confirm Enrollment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Drop Enrollment Confirmation Modal */}
      <Modal
        isOpen={showDropConfirmModal}
        onClose={() => setShowDropConfirmModal(false)}
        title="Remove Enrollment"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-medium mb-2">
                Are you sure you want to remove this enrollment?
              </p>
              {enrollmentToDelete && (
                <div className="bg-gray-50 rounded p-3 mb-3 space-y-1">
                  <div className="text-sm">
                    <span className="text-gray-600">Student: </span>
                    <span className="font-medium text-gray-900">{enrollmentToDelete.studentName}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Course: </span>
                    <span className="text-gray-900">{enrollmentToDelete.courseName}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Status: </span>
                    <Badge variant="secondary" className="text-xs">{enrollmentToDelete.status}</Badge>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-600">
                This will permanently remove the enrollment record. Associated attendance and grades will be preserved but the student will no longer be enrolled in this course.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDropConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={confirmDropEnrollment}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Enrollment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Complete Enrollment Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false)
          setCompletingEnrollment(null)
          setFinalGrade('')
        }}
        title={completingEnrollment?.finalGrade ? 'Edit Final Grade' : 'Complete Enrollment with Grade'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Student: <span className="font-medium text-gray-900">{completingEnrollment?.studentName}</span>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Course: <span className="font-medium text-gray-900">{completingEnrollment?.courseName}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Final Grade (0-100) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={finalGrade}
              onChange={(e) => setFinalGrade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter percentage (e.g., 85.5)"
            />
            <p className="mt-1 text-xs text-gray-500">
              The letter grade will be automatically calculated based on the percentage.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCompleteEnrollment}
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {completingEnrollment?.finalGrade ? 'Update Grade' : 'Save Grade'}
            </Button>
            <Button
              onClick={() => {
                setShowCompleteModal(false)
                setCompletingEnrollment(null)
                setFinalGrade('')
              }}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
