import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { LogOut, Home, Users, BookOpen, GraduationCap, BarChart } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const getNavItems = () => {
    if (user?.role === 'ADMIN') {
      return [
        { to: '/admin', label: 'Dashboard', icon: Home },
        { to: '/admin/students', label: 'Students', icon: Users },
        { to: '/admin/teachers', label: 'Teachers', icon: GraduationCap },
        { to: '/admin/courses', label: 'Courses', icon: BookOpen },
      ]
    }
    if (user?.role === 'TEACHER') {
      return [
        { to: '/teacher', label: 'Dashboard', icon: Home },
        { to: '/teacher/courses', label: 'My Courses', icon: BookOpen },
        { to: '/teacher/marks', label: 'Marks', icon: BarChart },
        { to: '/teacher/attendance', label: 'Attendance', icon: Users },
      ]
    }
    if (user?.role === 'STUDENT') {
      return [
        { to: '/student', label: 'Dashboard', icon: Home },
        { to: '/student/marks', label: 'My Marks', icon: BarChart },
        { to: '/student/attendance', label: 'My Attendance', icon: Users },
      ]
    }
    return []
  }

  const navItems = getNavItems()

  return (
    <nav className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EADMS</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.to
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                      isActive
                        ? 'border-primary-600 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
