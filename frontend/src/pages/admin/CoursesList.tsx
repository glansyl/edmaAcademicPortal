import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { courseService } from '@/services/courseService'
import { teacherService } from '@/services/teacherService'
import { Course, Teacher } from '@/types'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'
export function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    semester: 1,
    credits: 3,
    description: '',
    teacherId: 0
  })
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([])
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [coursesData, teachersData] = await Promise.all([
        courseService.getAllCourses(),
        teacherService.getAllTeachers()
      ])
      logger.log('Loaded courses:', coursesData)
      logger.log('Loaded teachers:', teachersData)
      setCourses(coursesData)
      setTeachers(teachersData)
    } catch (error: any) {
      logger.error('Failed to fetch data:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to fetch data. Please try refreshing the page.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    logger.log('Submitting form with data:', formData)
    logger.log('Selected teachers:', selectedTeachers)
    try {
      let courseId: number
      if (editingCourse) {
        await courseService.updateCourse(editingCourse.id, formData)
        courseId = editingCourse.id
        toast.success('Course updated successfully')
      } else {
        const newCourse = await courseService.createCourse(formData)
        courseId = newCourse.id
        toast.success('Course created successfully')
      }
      
      // Assign multiple teachers if any selected
      if (selectedTeachers.length > 0) {
        logger.log('Assigning teachers:', selectedTeachers, 'to course:', courseId)
        try {
          const result = await courseService.assignTeachers(courseId, selectedTeachers)
          logger.log('Teachers assignment result:', result)
          toast.success(`${selectedTeachers.length} teacher(s) assigned successfully`)
        } catch (error: any) {
          logger.error('Failed to assign teachers:', error)
          toast.error('Course saved but failed to assign teachers')
        }
      } else {
        logger.log('No teachers selected')
      }
      
      setIsModalOpen(false)
      await fetchData()
      resetForm()
    } catch (error: any) {
      logger.error('Failed to save course:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to save course'
      toast.error(errorMessage)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      try {
        await courseService.deleteCourse(id)
        toast.success('Course deleted')
        fetchData()
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 'Failed to delete course'
        toast.error(errorMessage)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      courseCode: '',
      courseName: '',
      semester: 1,
      credits: 3,
      description: '',
      teacherId: 0
    })
    setSelectedTeachers([])
    setIsTeacherDropdownOpen(false)
    setEditingCourse(null)
  }
  
  const toggleTeacher = (teacherId: number) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    )
  }
  
  const getSelectedTeacherNames = () => {
    if (selectedTeachers.length === 0) return 'Select Teachers'
    return selectedTeachers
      .map(id => {
        const teacher = teachers.find(t => t.id === id)
        return teacher ? `${teacher.firstName} ${teacher.lastName}` : ''
      })
      .filter(Boolean)
      .join(', ')
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
              <p className="text-gray-600 mt-1">Manage all courses</p>
            </div>
            <Button onClick={() => { resetForm(); setIsModalOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <code className="px-2 py-1 text-xs font-mono bg-purple-50 text-purple-700 rounded border border-purple-200">
                      {course.courseCode}
                    </code>
                  </TableCell>
                  <TableCell>{course.courseName}</TableCell>
                  <TableCell>{course.semester}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>
                    {course.teacherNames && course.teacherNames.length > 0 
                      ? course.teacherNames.join(', ') 
                      : 'Not assigned'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        logger.log('Editing course:', course)
                        setEditingCourse(course)
                        const teacherIds = course.teacherIds || []
                        logger.log('Setting selected teachers to:', teacherIds)
                        setSelectedTeachers(teacherIds)
                        setFormData({
                          courseCode: course.courseCode,
                          courseName: course.courseName,
                          semester: course.semester,
                          credits: course.credits,
                          description: course.description,
                          teacherId: 0
                        })
                        setIsModalOpen(true)
                      }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(course.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCourse ? 'Edit Course' : 'Add Course'} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Course Code</Label>
                <Input value={formData.courseCode} onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })} required disabled={!!editingCourse} />
              </div>
              <div>
                <Label>Course Name</Label>
                <Input value={formData.courseName} onChange={(e) => setFormData({ ...formData, courseName: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Semester</Label>
                <Input type="number" min="1" max="8" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })} required />
              </div>
              <div>
                <Label>Credits</Label>
                <Input type="number" min="1" max="6" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })} required />
              </div>
            </div>
            <div>
              <Label>Assign Teachers</Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <span className="text-gray-700">{getSelectedTeacherNames()}</span>
                  <span className="ml-2 text-gray-400">▼</span>
                </button>
                
                {isTeacherDropdownOpen && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                    {teachers.map((teacher) => (
                      <label
                        key={teacher.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTeachers.includes(teacher.id)}
                          onChange={() => toggleTeacher(teacher.id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">
                          {teacher.firstName} {teacher.lastName} ({teacher.department})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {selectedTeachers.length} teacher(s) selected | Available teachers: {teachers.length}
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingCourse ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Modal>
        </div>
      </div>
    </div>
  )
}
