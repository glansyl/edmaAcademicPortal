import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { NavigationHelper } from '@/lib/navigation'
import { 
  Home, 
  User, 
  MessageSquare, 
  BookOpen, 
  Calendar,
  LogOut,
  GraduationCap,
  Users,
  FileText,
  UserPlus,
  ClipboardCheck,
  BarChart3,
  Bell
} from 'lucide-react'

export function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const getNavItems = () => {
    if (user?.role === 'TEACHER') {
      return [
        { to: '/teacher', label: 'Dashboard', icon: Home },
        { to: '/teacher/profile', label: 'Profile', icon: User },
        { to: '/teacher/messages', label: 'Messages', icon: MessageSquare },
        { to: '/teacher/courses', label: 'Courses', icon: BookOpen },
        { to: '/teacher/schedule', label: 'Schedule', icon: Calendar },
        { to: '/teacher/attendance', label: 'Attendance', icon: ClipboardCheck },
        { to: '/teacher/marks', label: 'Marks', icon: BarChart3 },
      ]
    }
    if (user?.role === 'STUDENT') {
      return [
        { to: '/student', label: 'Dashboard', icon: Home },
        { to: '/student/profile', label: 'Profile', icon: User },
        { to: '/student/messages', label: 'Messages', icon: MessageSquare },
        { to: '/student/courses', label: 'My Courses', icon: BookOpen },
        { to: '/student/schedule', label: 'Schedule', icon: Calendar },
        { to: '/student/marks', label: 'My Marks', icon: GraduationCap },
        { to: '/student/attendance', label: 'My Attendance', icon: FileText },
      ]
    }
    if (user?.role === 'ADMIN') {
      return [
        { to: '/admin', label: 'Dashboard', icon: Home },
        { to: '/admin/students', label: 'Students', icon: Users },
        { to: '/admin/teachers', label: 'Teachers', icon: GraduationCap },
        { to: '/admin/courses', label: 'Courses', icon: FileText },
        { to: '/admin/enrollments', label: 'Enrollments', icon: UserPlus },
        { to: '/admin/notices', label: 'Notices', icon: Bell },
      ]
    }
    return []
  }

  const navItems = getNavItems()

  const getInitials = () => {
    if (!user?.email) return 'U'
    const name = user.email.split('@')[0]
    return name.substring(0, 2).toUpperCase()
  }

  const getUserName = () => {
    if (!user?.email) return 'User'
    const name = user.email.split('@')[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  const getRoleName = () => {
    if (user?.role === 'TEACHER') return 'Professor'
    if (user?.role === 'STUDENT') return 'Student'
    return user?.role || 'User'
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 border-b border-gray-100">
        <Link 
          to={NavigationHelper.getDashboardRoute(user?.role)}
          className="flex items-center gap-3 mb-2 group transition-all duration-200 hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">Academic</h1>
            <h1 className="text-lg font-bold text-blue-600 leading-tight">Portal</h1>
          </div>
        </Link>
        <p className="text-xs text-gray-500 tracking-wide uppercase font-semibold ml-13">Control System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                )}
                <Icon className={`h-5 w-5 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} />
                <span>{item.label}</span>
                {!isActive && (
                  <div className="absolute inset-0 bg-gray-100 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="px-4 pb-6 pt-4 border-t border-gray-100 mt-auto bg-gradient-to-t from-gray-50 to-white">
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white shadow-sm border border-gray-100">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm shadow-md">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user?.role === 'TEACHER' ? 'Dr. ' : ''}{getUserName()}
            </p>
            <p className="text-xs text-gray-500 font-medium">{getRoleName()}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all py-2.5 px-4 rounded-xl"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
