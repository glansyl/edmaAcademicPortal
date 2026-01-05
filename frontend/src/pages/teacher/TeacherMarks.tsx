import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { teacherService } from '@/services/teacherService'
import { marksService } from '@/services/marksService'
import { Course, Student, Marks } from '@/types'
import { BarChart, Save, Eye, Plus, Edit2, Trash2 } from 'lucide-react'
import { logger } from '@/lib/logger'
import toast from 'react-hot-toast'

export function TeacherMarks() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [examType, setExamType] = useState<'MIDTERM' | 'FINAL' | 'ASSIGNMENT' | 'QUIZ'>('MIDTERM')
  const [examDate, setExamDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [maxMarks, setMaxMarks] = useState<number>(100)
  const [marksData, setMarksData] = useState<Map<number, { marks: number; remarks: string }>>(new Map())
  const [existingMarks, setExistingMarks] = useState<Marks[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [viewMode, setViewMode] = useState<'enter' | 'view'>('enter')
  const [editingMark, setEditingMark] = useState<Marks | null>(null)

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      loadStudents()
      if (viewMode === 'view') {
        loadExistingMarks()
      }
    }
  }, [selectedCourse, viewMode])

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

  const loadStudents = async () => {
    if (!selectedCourse) return
    setIsLoading(true)
    try {
      const data = await teacherService.getStudentsByCourse(selectedCourse.id)
      setStudents(data)
      // Initialize marks data
      const initialData = new Map<number, { marks: number; remarks: string }>()
      data.forEach(student => initialData.set(student.id, { marks: 0, remarks: '' }))
      setMarksData(initialData)
    } catch (error) {
      toast.error('Failed to load students')
    } finally {
      setIsLoading(false)
    }
  }

  const loadExistingMarks = async () => {
    if (!selectedCourse) return
    setIsLoading(true)
    try {
      const data = await marksService.getMarksByCourse(selectedCourse.id)
      setExistingMarks(data.sort((a, b) => 
        new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
      ))
    } catch (error) {
      toast.error('Failed to load marks')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarksChange = (studentId: number, marks: number) => {
    const current = marksData.get(studentId) || { marks: 0, remarks: '' }
    setMarksData(prev => new Map(prev.set(studentId, { ...current, marks })))
  }

  const handleRemarksChange = (studentId: number, remarks: string) => {
    const current = marksData.get(studentId) || { marks: 0, remarks: '' }
    setMarksData(prev => new Map(prev.set(studentId, { ...current, remarks })))
  }

  const handleSaveMarks = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course')
      return
    }

    // Validate marks
    const invalidMarks = Array.from(marksData.entries()).filter(
      ([_, data]) => data.marks < 0 || data.marks > maxMarks
    )
    
    if (invalidMarks.length > 0) {
      toast.error(`Marks must be between 0 and ${maxMarks}`)
      return
    }

    setIsSaving(true)
    try {
      const promises = Array.from(marksData.entries()).map(([studentId, data]) =>
        marksService.enterMarks({
          studentId,
          courseId: selectedCourse.id,
          examType,
          marksObtained: data.marks,
          maxMarks,
          remarks: data.remarks,
          examDate,
        })
      )

      await Promise.all(promises)
      toast.success('Marks saved successfully')
      
      // Reset form
      const resetData = new Map<number, { marks: number; remarks: string }>()
      students.forEach(student => resetData.set(student.id, { marks: 0, remarks: '' }))
      setMarksData(resetData)
    } catch (error) {
      toast.error('Failed to save marks')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteMark = async (id: number) => {
    if (!confirm('Are you sure you want to delete this mark?')) return

    try {
      await marksService.deleteMarks(id)
      toast.success('Mark deleted successfully')
      loadExistingMarks()
    } catch (error) {
      toast.error('Failed to delete mark')
    }
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const calculatePercentage = (obtained: number, max: number) => {
    return ((obtained / max) * 100).toFixed(2)
  }

  const getExamTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'MIDTERM':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'FINAL':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'ASSIGNMENT':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'QUIZ':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Marks</h1>
          <p className="text-gray-600">Enter and track student marks for your courses</p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-6 flex gap-2">
          <Button
            onClick={() => setViewMode('enter')}
            variant={viewMode === 'enter' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Enter Marks
          </Button>
          <Button
            onClick={() => setViewMode('view')}
            variant={viewMode === 'view' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
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

        {viewMode === 'enter' && selectedCourse && (
          <>
            {/* Exam Configuration */}
            <Card className="p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Type
                  </label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="MIDTERM">Midterm</option>
                    <option value="FINAL">Final</option>
                    <option value="ASSIGNMENT">Assignment</option>
                    <option value="QUIZ">Quiz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Marks
                  </label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </Card>

            {/* Student Marks Entry */}
            {isLoading ? (
              <Card className="p-12 text-center">
                <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
                <p className="mt-4 text-gray-500">Loading students...</p>
              </Card>
            ) : students.length === 0 ? (
              <Card className="p-12 text-center">
                <BarChart className="mx-auto h-12 w-12 text-gray-400" />
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
                          Marks Obtained
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map(student => {
                        const data = marksData.get(student.id) || { marks: 0, remarks: '' }
                        const percentage = calculatePercentage(data.marks, maxMarks)
                        return (
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
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={data.marks}
                                  onChange={(e) => handleMarksChange(student.id, Number(e.target.value))}
                                  min="0"
                                  max={maxMarks}
                                  className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <span className="text-sm text-gray-500">/ {maxMarks}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-semibold ${getGradeColor(Number(percentage))}`}>
                                {percentage}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={data.remarks}
                                onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                placeholder="Optional remarks..."
                                className="w-48 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                  <Button
                    onClick={handleSaveMarks}
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
                        <Save className="h-4 w-4" />
                        Save Marks
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
            ) : existingMarks.length === 0 ? (
              <div className="p-12 text-center">
                <BarChart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Records Found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  No marks have been entered for this course yet
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
                        Exam Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {existingMarks.map(mark => {
                      const percentage = calculatePercentage(mark.marksObtained, mark.maxMarks)
                      return (
                        <tr key={mark.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(mark.examDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getExamTypeBadgeColor(mark.examType)}`}>
                              {mark.examType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {mark.student?.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {mark.student?.firstName} {mark.student?.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {mark.marksObtained} / {mark.maxMarks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-semibold ${getGradeColor(Number(percentage))}`}>
                              {percentage}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {mark.remarks || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDeleteMark(mark.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
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
