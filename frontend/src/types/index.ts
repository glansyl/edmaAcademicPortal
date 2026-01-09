export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT'

export interface User {
  id: number
  email: string
  role: Role
  firstName?: string
  lastName?: string
  name?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Student {
  id: number
  studentId: string
  firstName: string
  lastName: string
  className: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  contactNumber: string  // Fixed: backend uses contactNumber, not contact
  dateOfBirth: string
  userId: number
  user?: User
}

export interface Teacher {
  id: number
  teacherId: string
  firstName: string
  lastName: string
  department: string
  contactNumber: string  // Fixed: backend uses contactNumber, not contact
  email: string
  dateOfBirth: string
  userId: number
  user?: User
}

export interface Course {
  id: number
  courseCode: string
  courseName: string
  semester: number
  credits: number
  description: string
  teacherIds: number[]
  teacherNames: string[]
}

export interface Marks {
  id: number
  examType: 'MIDTERM' | 'FINAL' | 'ASSIGNMENT' | 'QUIZ'
  marksObtained: number
  maxMarks: number
  percentage?: number
  remarks: string
  examDate: string
  studentId: number
  studentName?: string
  courseId: number
  courseName?: string
  student?: Student
  course?: Course
}

export interface Attendance {
  id: number
  attendanceDate: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  studentId: number
  courseId: number
  student?: Student
  course?: Course
}

export interface DashboardStats {
  totalStudents?: number
  totalTeachers?: number
  totalCourses?: number
  activeUsers?: number
  studentsByClass?: Record<string, number>
  teachersByDepartment?: Record<string, number>
  coursesBySemester?: Record<number, number>
  myCourses?: Course[]
  studentsInMyCourses?: number
  averageAttendance?: number
  gpa?: number
  attendancePercentage?: number
  totalCredits?: number
  recentMarks?: Marks[]
  assignmentsDue?: number
}

export interface Assignment {
  id: number
  title: string
  description?: string
  dueDate: string
  status: 'PENDING' | 'SUBMITTED' | 'OVERDUE' | 'GRADED'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  courseId: number
  courseName?: string
  studentId?: number
  createdAt: string
  updatedAt: string
}

export interface Schedule {
  id: number
  courseId: number
  courseCode: string
  courseName: string
  teacherId?: number
  teacherName: string
  title: string
  description?: string
  startDateTime: string
  endDateTime: string
  recurrence: 'NONE' | 'WEEKLY'
  location?: string
  // Legacy fields for backward compatibility
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  startTime: string
  endTime: string
  roomNumber: string
  classType: string
}

export interface Enrollment {
  id: number
  studentId: number
  studentName?: string
  courseId: number
  courseName: string
  courseCode: string
  credits: number
  semester: number
  academicYear: number
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'WITHDRAWN' | 'FAILED'
  enrollmentDate: string
  completionDate?: string
  finalGrade?: number
  letterGrade?: string
  gradePoints?: number
  remarks?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  email: string
  role: Role
  userId: number
  message?: string
}

export interface UserUpdateRequest {
  email?: string
  password?: string
}
