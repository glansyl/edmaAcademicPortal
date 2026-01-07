import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/DropdownMenu'
import { teacherService } from '@/services/teacherService'
import { adminService } from '@/services/adminService'
import { Teacher } from '@/types'
import { Plus, Search, Filter, MoreVertical, Eye, Pencil, Trash2, UserPlus, BookOpen, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const DEPARTMENTS = ['CSE', 'ECE', 'ISE', 'MECH', 'RA', 'AIML']

export function TeachersList() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'recent'>('name')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    teacherId: '',
    department: '',
    contactNumber: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers()
      setTeachers(data)
    } catch (error: any) {
      // Differentiate errors: 401 handled by interceptor, 403 = forbidden, 500 = server error
      const status = error?.response?.status
      if (status === 403) {
        toast.error('Access denied: Admin privileges required')
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.')
      } else {
        toast.error('Failed to fetch teachers')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchNextTeacherId = async (department: string) => {
    try {
      const data = await adminService.getNextTeacherId(department)
      setFormData(prev => ({ ...prev, teacherId: data.teacherId }))
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 400) {
        toast.error('Invalid department selected')
      } else {
        toast.error('Failed to generate teacher ID')
      }
    }
  }
  
  const handleDepartmentChange = (department: string) => {
    setFormData(prev => ({ ...prev, department }))
    if (!editingTeacher && department) {
      fetchNextTeacherId(department)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate contact number
    if (formData.contactNumber && formData.contactNumber.length !== 10) {
      toast.error('Contact number must be exactly 10 digits')
      return
    }
    
    try {
      if (editingTeacher) {
        await teacherService.updateTeacher(editingTeacher.id, formData)
        toast.success('Teacher updated successfully')
      } else {
        await teacherService.createTeacher(formData)
        toast.success('Teacher created successfully')
      }
      setIsModalOpen(false)
      fetchTeachers()
      resetForm()
    } catch (error: any) {
      const status = error?.response?.status
      const message = error?.response?.data?.message
      
      // 400 = validation error, 409 = duplicate (email/teacherId exists), 403 = forbidden
      if (status === 400) {
        toast.error(message || 'Invalid data. Please check all fields.')
      } else if (status === 409) {
        toast.error(message || 'Teacher ID or email already exists')
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action')
      } else {
        toast.error('Failed to save teacher')
      }
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await teacherService.deleteTeacher(id)
      toast.success('Teacher deleted successfully')
      setIsDeleteModalOpen(false)
      setTeacherToDelete(null)
      fetchTeachers()
    } catch (error: any) {
      const status = error?.response?.status
      const message = error?.response?.data?.message
      
      // 409 = conflict (teacher has assigned courses), 404 = not found, 403 = forbidden
      if (status === 409) {
        toast.error(message || 'Cannot delete: Teacher has assigned courses or active data')
      } else if (status === 404) {
        toast.error('Teacher not found')
        fetchTeachers() // Refresh to remove stale data
      } else if (status === 403) {
        toast.error('You do not have permission to delete teachers')
      } else {
        toast.error('Failed to delete teacher')
      }
    }
  }

  const openDeleteModal = (teacher: Teacher) => {
    setTeacherToDelete(teacher)
    setIsDeleteModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      teacherId: '',
      department: '',
      contactNumber: '',
      email: '',
      password: ''
    })
    setEditingTeacher(null)
  }

  // Filter and search logic
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = searchQuery === '' || 
      teacher.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.teacherId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDepartment = selectedDepartment === 'all' || teacher.department === selectedDepartment
    
    return matchesSearch && matchesDepartment
  })

  // Sort logic
  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
      return nameA.localeCompare(nameB)
    } else if (sortBy === 'department') {
      return a.department.localeCompare(b.department)
    } else if (sortBy === 'recent') {
      return b.id - a.id // Assuming higher ID = more recent
    }
    return 0
  })

  // Pagination logic
  const totalPages = Math.ceil(sortedTeachers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTeachers = sortedTeachers.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedDepartment, sortBy])

  const handleViewProfile = (teacher: Teacher) => {
    toast('Profile view coming soon', { icon: '👀' })
  }

  const handleAssignCourses = (teacher: Teacher) => {
    toast('Course assignment coming soon', { icon: '📚' })
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
              <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
              <p className="text-gray-600 mt-1">Manage faculty members and their profiles</p>
            </div>
            <Button size="lg" onClick={() => { resetForm(); setIsModalOpen(true) }}>
              <Plus className="mr-2 h-5 w-5" />
              Add Teacher
            </Button>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, ID, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Department Filter */}
              <div className="w-full sm:w-48">
                <Select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full"
                >
                  <option value="all">All Departments</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Select>
              </div>

              {/* Sort */}
              <div className="w-full sm:w-48">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full"
                >
                  <option value="name">Name A-Z</option>
                  <option value="department">Department</option>
                  <option value="recent">Recently Added</option>
                </Select>
              </div>
            </div>

            {/* Active Filters Indicator */}
            {(searchQuery || selectedDepartment !== 'all') && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    Search: "{searchQuery}"
                  </Badge>
                )}
                {selectedDepartment !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Department: {selectedDepartment}
                  </Badge>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedDepartment('all')
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {teachers.length === 0 ? (
              // Empty State - No Teachers at All
              <div className="text-center py-16 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                  <UserPlus className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Teachers Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Get started by adding your first faculty member to the system.
                </p>
                <Button size="lg" onClick={() => { resetForm(); setIsModalOpen(true) }}>
                  <Plus className="mr-2 h-5 w-5" />
                  Add First Teacher
                </Button>
              </div>
            ) : paginatedTeachers.length === 0 ? (
              // Empty State - No Results from Filters
              <div className="text-center py-16 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                  <Filter className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Teachers Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No teachers match your current filters. Try adjusting your search criteria.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedDepartment('all')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Teacher ID</TableHead>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="w-32">Department</TableHead>
                      <TableHead className="w-64">Email</TableHead>
                      <TableHead className="w-40">Contact</TableHead>
                      <TableHead className="w-20 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTeachers.map((teacher) => (
                      <TableRow key={teacher.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <code className="px-2 py-1 bg-green-50 text-green-700 rounded text-sm font-mono border border-green-200">
                            T-{teacher.teacherId}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-gray-900">
                            {teacher.firstName} {teacher.lastName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {teacher.department}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{teacher.email}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-700">{teacher.contactNumber || '—'}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu
                            trigger={
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            }
                          >
                            <DropdownMenuItem
                              icon={<Eye className="h-4 w-4" />}
                              onClick={() => handleViewProfile(teacher)}
                            >
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              icon={<Pencil className="h-4 w-4" />}
                              onClick={() => {
                                setEditingTeacher(teacher)
                                setFormData({
                                  firstName: teacher.firstName,
                                  lastName: teacher.lastName,
                                  teacherId: teacher.teacherId,
                                  department: teacher.department,
                                  contactNumber: teacher.contactNumber || '',
                                  email: teacher.email,
                                  password: ''
                                })
                                setIsModalOpen(true)
                              }}
                            >
                              Edit Teacher
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              icon={<BookOpen className="h-4 w-4" />}
                              onClick={() => handleAssignCourses(teacher)}
                            >
                              Assign Courses
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              icon={<Trash2 className="h-4 w-4" />}
                              onClick={() => openDeleteModal(teacher)}
                              variant="danger"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                  <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(endIndex, sortedTeachers.length)}</span> of{' '}
                      <span className="font-medium">{sortedTeachers.length}</span> teachers
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                                className={`min-w-[2rem] h-8 px-3 text-sm rounded ${
                                  currentPage === page
                                    ? 'bg-blue-600 text-white font-medium'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {page}
                              </button>
                            )
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="px-1 text-gray-400">...</span>
                          }
                          return null
                        })}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Create/Edit Modal */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTeacher ? 'Edit Teacher' : 'Add Teacher'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Select 
                    value={formData.department} 
                    onChange={(e) => handleDepartmentChange(e.target.value)} 
                    required
                    disabled={!!editingTeacher}
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Teacher ID</Label>
                  <Input 
                    value={formData.teacherId} 
                    readOnly 
                    className="bg-gray-50 cursor-not-allowed font-mono"
                    placeholder="Select department first"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={!!editingTeacher} />
                </div>
                <div>
                  <Label>Contact</Label>
                  <Input 
                    type="tel"
                    value={formData.contactNumber} 
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/\D/g, '')
                      setFormData({ ...formData, contactNumber: value })
                    }}
                    onKeyPress={(e) => {
                      // Prevent non-numeric characters from being typed
                      if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                        e.preventDefault()
                      }
                    }}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    className={formData.contactNumber.length > 0 && formData.contactNumber.length !== 10 ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                    required
                  />
                  {formData.contactNumber.length > 0 && formData.contactNumber.length !== 10 && (
                    <p className="text-xs text-red-600 mt-1">
                      Contact number must be exactly 10 digits ({formData.contactNumber.length}/10)
                    </p>
                  )}
                  {formData.contactNumber.length === 10 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Valid contact number
                    </p>
                  )}
                </div>
              </div>
              {!editingTeacher && (
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">{editingTeacher ? 'Update Teacher' : 'Create Teacher'}</Button>
              </div>
            </form>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal 
            isOpen={isDeleteModalOpen} 
            onClose={() => setIsDeleteModalOpen(false)} 
            title="Delete Teacher"
            size="md"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium mb-2">
                    Are you sure you want to delete this teacher?
                  </p>
                  {teacherToDelete && (
                    <div className="bg-gray-50 rounded p-3 mb-3 space-y-1">
                      <div className="text-sm">
                        <span className="text-gray-600">Name: </span>
                        <span className="font-medium text-gray-900">
                          {teacherToDelete.firstName} {teacherToDelete.lastName}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">ID: </span>
                        <code className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                          {teacherToDelete.teacherId}
                        </code>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Department: </span>
                        <span className="text-gray-900">{teacherToDelete.department}</span>
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-600">
                    This action cannot be undone. All associated data will be permanently removed.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="danger"
                  onClick={() => teacherToDelete && handleDelete(teacherToDelete.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Teacher
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  )
}
