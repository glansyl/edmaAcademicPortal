import { useEffect, useState, useMemo } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/DropdownMenu'
import { studentService } from '@/services/studentService'
import { adminService } from '@/services/adminService'
import { Student } from '@/types'
import { Plus, Pencil, Trash2, Users, MoreVertical, Eye, Search, Filter, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

const ITEMS_PER_PAGE = 10
const DEPARTMENTS = ['TECH', 'IT']

export function StudentsList() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [filterGender, setFilterGender] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'recent'>('name')
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    department: '',
    gender: 'MALE',
    contact: '',
    dateOfBirth: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  // Compute filtered and sorted students
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students]
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(student => 
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.studentId.toLowerCase().includes(query)
      )
    }
    
    // Apply department filter
    if (filterDepartment !== 'all') {
      result = result.filter(student => student.className === filterDepartment)
    }
    
    // Apply gender filter
    if (filterGender !== 'all') {
      result = result.filter(student => student.gender === filterGender)
    }
    
    // Apply sorting
    if (sortBy === 'name') {
      result.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
        return nameA.localeCompare(nameB)
      })
    } else if (sortBy === 'recent') {
      result.sort((a, b) => b.id - a.id)
    }
    
    return result
  }, [students, searchQuery, filterDepartment, filterGender, sortBy])

  // Get unique departments for filter dropdown
  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(students.map(s => s.className))).sort()
  }, [students])

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedStudents.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentStudents = filteredAndSortedStudents.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterDepartment, filterGender, sortBy])

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents()
      setStudents(data)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to fetch students'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchNextStudentId = async (department: string) => {
    try {
      const data = await adminService.getNextStudentId(department)
      setFormData(prev => ({ ...prev, studentId: data.studentId }))
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to generate student ID'
      toast.error(errorMessage)
    }
  }
  
  const handleDepartmentChange = (department: string) => {
    setFormData(prev => ({ ...prev, department }))
    if (!editingStudent && department) {
      fetchNextStudentId(department)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate contact number
    if (formData.contact.length !== 10) {
      toast.error('Contact number must be exactly 10 digits')
      return
    }
    
    try {
      // Cast gender to proper type and map fields for API
      const { department, contact, ...restFormData } = formData
      const payload = {
        ...restFormData,
        className: department, // Backend expects className
        contactNumber: contact, // Backend expects contactNumber
        gender: formData.gender as 'MALE' | 'FEMALE' | 'OTHER'
      }
      
      if (editingStudent) {
        await studentService.updateStudent(editingStudent.id, payload)
        toast.success('Student updated successfully')
      } else {
        await studentService.createStudent(payload)
        toast.success('Student created successfully')
      }
      setIsModalOpen(false)
      fetchStudents()
      resetForm()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to save student'
      toast.error(errorMessage)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await studentService.deleteStudent(id)
      toast.success('Student deleted successfully')
      setIsDeleteModalOpen(false)
      setStudentToDelete(null)
      fetchStudents()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to delete student'
      toast.error(errorMessage)
    }
  }

  const openDeleteModal = (student: Student) => {
    setStudentToDelete(student)
    setIsDeleteModalOpen(true)
  }

  const openCreateModal = () => {
    resetForm()
    setEditingStudent(null)
    setIsModalOpen(true)
  }

  const openEditModal = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      studentId: student.studentId,
      department: student.className, // Map className to department
      gender: student.gender,
      contact: student.contactNumber || '',  // Backend uses contactNumber, ensure string
      dateOfBirth: student.dateOfBirth.split('T')[0],
      email: student.user?.email || '',
      password: ''
    })
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      studentId: '',
      department: '',
      gender: 'MALE',
      contact: '',
      dateOfBirth: '',
      email: '',
      password: ''
    })
  }

  const resetFilters = () => {
    setSearchQuery('')
    setFilterDepartment('all')
    setFilterGender('all')
    setSortBy('name')
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
              <p className="text-gray-600 mt-1">
                {students.length === 0 
                  ? 'No students in the system'
                  : `Manage all students · ${students.length} total`
                }
              </p>
            </div>
            <Button onClick={openCreateModal} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>

          {students.length === 0 ? (
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title="No students found"
              description="Get started by adding your first student to the system"
              action={
                <Button onClick={openCreateModal} size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Student
                </Button>
              }
            />
          ) : (
            <>
              {/* Table Controls */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Search */}
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search by name or student ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>
                    
                    <Select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="w-40"
                    >
                      <option value="all">All Departments</option>
                      {uniqueDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </Select>

                    <Select
                      value={filterGender}
                      onChange={(e) => setFilterGender(e.target.value)}
                      className="w-36"
                    >
                      <option value="all">All Genders</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </Select>

                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'name' | 'recent')}
                      className="w-40"
                    >
                      <option value="name">Name A–Z</option>
                      <option value="recent">Recently Added</option>
                    </Select>

                    {(searchQuery || filterDepartment !== 'all' || filterGender !== 'all') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Results Info or Empty State */}
              {filteredAndSortedStudents.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                  <div className="text-center">
                    <Search className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">No matching students</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Try adjusting your search or filters to find what you're looking for.
                    </p>
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="mt-4"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[140px]">Student ID</TableHead>
                            <TableHead className="w-[240px]">Student Name</TableHead>
                          <TableHead className="w-[180px]">Department</TableHead>
                          <TableHead className="w-[120px]">Gender</TableHead>
                          <TableHead className="w-[160px]">Contact</TableHead>
                          <TableHead className="w-[140px]">Date of Birth</TableHead>
                          <TableHead className="w-[80px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentStudents.map((student) => (
                          <TableRow 
                            key={student.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <TableCell>
                              <code className="px-2 py-1 text-xs font-mono bg-blue-50 text-blue-700 rounded border border-blue-200">
                                S-{student.studentId}
                              </code>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-gray-900">
                                {student.firstName} {student.lastName}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="info" className="font-medium">
                                {student.className}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  student.gender === 'MALE' ? 'default' : 
                                  student.gender === 'FEMALE' ? 'success' : 
                                  'secondary'
                                }
                                className="font-normal"
                              >
                                {student.gender === 'MALE' ? 'Male' : 
                                 student.gender === 'FEMALE' ? 'Female' : 
                                 'Other'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-700">
                              {student.contactNumber || '—'}
                            </TableCell>
                            <TableCell className="text-gray-700">
                              {formatDate(student.dateOfBirth)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu
                                trigger={
                                  <button className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 transition-colors">
                                    <MoreVertical className="h-4 w-4 text-gray-600" />
                                  </button>
                                }
                              >
                                <DropdownMenuItem
                                  icon={<Eye className="h-4 w-4" />}
                                  onClick={() => toast('View profile feature coming soon', { icon: 'ℹ️' })}
                                >
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  icon={<Pencil className="h-4 w-4" />}
                                  onClick={() => openEditModal(student)}
                                >
                                  Edit Student
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="danger"
                                  icon={<Trash2 className="h-4 w-4" />}
                                  onClick={() => openDeleteModal(student)}
                                >
                                  Delete Student
                                </DropdownMenuItem>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
                      <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(endIndex, filteredAndSortedStudents.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredAndSortedStudents.length}</span> students
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                            // Show first page, last page, current page, and pages around current
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`
                                    h-8 w-8 rounded text-sm font-medium transition-colors
                                    ${currentPage === page
                                      ? 'bg-blue-600 text-white'
                                      : 'text-gray-700 hover:bg-gray-100'
                                    }
                                  `}
                                >
                                  {page}
                                </button>
                              )
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return <span key={page} className="px-1 text-gray-400">...</span>
                            }
                            return null
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

        {/* Create/Edit Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={editingStudent ? 'Edit Student' : 'Add Student'} 
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  required
                  disabled={!!editingStudent}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed font-mono"
                  placeholder="Select department first"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 30)).toISOString().split('T')[0]}
                  className="cursor-pointer"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Age must be between 16-30 years
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                type="tel"
                value={formData.contact}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, contact: value })
                }}
                onKeyPress={(e) => {
                  // Prevent non-numeric characters from being typed
                  if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                    e.preventDefault()
                  }
                }}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className={formData.contact.length > 0 && formData.contact.length !== 10 ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                required
              />
              {formData.contact.length > 0 && formData.contact.length !== 10 && (
                <p className="text-xs text-red-600 mt-1">
                  Contact number must be exactly 10 digits ({formData.contact.length}/10)
                </p>
              )}
              {formData.contact.length === 10 && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Valid contact number
                </p>
              )}
            </div>

            {!editingStudent && (
              <>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingStudent ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setStudentToDelete(null)
          }}
          title="Delete Student"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Are you absolutely sure?
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  You are about to permanently delete{' '}
                  <span className="font-semibold text-gray-900">
                    {studentToDelete?.firstName} {studentToDelete?.lastName}
                  </span>{' '}
                  (ID: <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">
                    {studentToDelete?.studentId}
                  </code>). This action cannot be undone.
                </p>
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-800">
                    <strong>Warning:</strong> This will also remove all associated data including enrollments, attendance records, and marks.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setStudentToDelete(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => studentToDelete && handleDelete(studentToDelete.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Student
              </Button>
            </div>
          </div>
        </Modal>
        </div>
      </div>
    </div>
  )
}
