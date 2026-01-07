import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { NavigationHelper } from './lib/navigation'
import { LoginPage } from './pages/Login'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { StudentsList } from './pages/admin/StudentsList'
import { TeachersList } from './pages/admin/TeachersList'
import { CoursesList } from './pages/admin/CoursesList'
import { EnrollmentManagement } from './pages/admin/EnrollmentManagement'
import { NoticeManagement } from './pages/admin/NoticeManagement'
import { TeacherDashboard } from './pages/teacher/TeacherDashboard'
import { TeacherProfile } from './pages/teacher/TeacherProfile'
import { TeacherMessages } from './pages/teacher/TeacherMessages'
import TeacherSchedule from './pages/teacher/TeacherSchedule'
import { MyCourses } from './pages/teacher/MyCourses'
import { TeacherMarks } from './pages/teacher/TeacherMarks'
import { TeacherAttendance } from './pages/teacher/TeacherAttendance'
import { StudentDashboard } from './pages/student/StudentDashboard'
import { StudentProfile } from './pages/student/StudentProfile'
import { StudentMessages } from './pages/student/StudentMessages'
import { StudentMarks } from './pages/student/StudentMarks'
import { StudentAttendance } from './pages/student/StudentAttendance'
import { StudentCourses } from './pages/student/StudentCourses'
import StudentSchedule from './pages/student/StudentSchedule'

function AppRoutes() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      
      <Route path="/" element={
        user ? (
          <Navigate to={NavigationHelper.getDashboardRoute(user.role)} replace />
        ) : <Navigate to="/login" />
      } />

      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['ADMIN']}><StudentsList /></ProtectedRoute>} />
      <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['ADMIN']}><TeachersList /></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['ADMIN']}><CoursesList /></ProtectedRoute>} />
      <Route path="/admin/enrollments" element={<ProtectedRoute allowedRoles={['ADMIN']}><EnrollmentManagement /></ProtectedRoute>} />
      <Route path="/admin/notices" element={<ProtectedRoute allowedRoles={['ADMIN']}><NoticeManagement /></ProtectedRoute>} />

      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/profile" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherProfile /></ProtectedRoute>} />
      <Route path="/teacher/messages" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherMessages /></ProtectedRoute>} />
      <Route path="/teacher/courses" element={<ProtectedRoute allowedRoles={['TEACHER']}><MyCourses /></ProtectedRoute>} />
      <Route path="/teacher/schedule" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherSchedule /></ProtectedRoute>} />
      <Route path="/teacher/marks" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherMarks /></ProtectedRoute>} />
      <Route path="/teacher/attendance" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherAttendance /></ProtectedRoute>} />

      <Route path="/student" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentProfile /></ProtectedRoute>} />
      <Route path="/student/messages" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentMessages /></ProtectedRoute>} />
      <Route path="/student/courses" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentCourses /></ProtectedRoute>} />
      <Route path="/student/schedule" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentSchedule /></ProtectedRoute>} />
      <Route path="/student/marks" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentMarks /></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentAttendance /></ProtectedRoute>} />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
