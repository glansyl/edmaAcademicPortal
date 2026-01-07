import { Role } from '@/types'

/**
 * Centralized navigation helper for role-aware routing
 */
export class NavigationHelper {
  /**
   * Get the dashboard route for a specific role
   */
  static getDashboardRoute(role: Role | undefined): string {
    switch (role) {
      case 'ADMIN':
        return '/admin'
      case 'TEACHER':
        return '/teacher'
      case 'STUDENT':
        return '/student'
      default:
        return '/login'
    }
  }

  /**
   * Get the default route after login based on role
   */
  static getDefaultRoute(role: Role): string {
    return this.getDashboardRoute(role)
  }

  /**
   * Check if current path matches the user's dashboard
   */
  static isOnDashboard(currentPath: string, role: Role | undefined): boolean {
    const dashboardRoute = this.getDashboardRoute(role)
    return currentPath === dashboardRoute
  }

  /**
   * Get role-specific navigation items
   */
  static getNavItems(role: Role | undefined) {
    switch (role) {
      case 'ADMIN':
        return [
          { to: '/admin', label: 'Dashboard', icon: 'Home' },
          { to: '/admin/students', label: 'Students', icon: 'Users' },
          { to: '/admin/teachers', label: 'Teachers', icon: 'GraduationCap' },
          { to: '/admin/courses', label: 'Courses', icon: 'FileText' },
          { to: '/admin/enrollments', label: 'Enrollments', icon: 'UserPlus' },
        ]
      case 'TEACHER':
        return [
          { to: '/teacher', label: 'Dashboard', icon: 'Home' },
          { to: '/teacher/profile', label: 'Profile', icon: 'User' },
          { to: '/teacher/messages', label: 'Messages', icon: 'MessageSquare' },
          { to: '/teacher/courses', label: 'Courses', icon: 'BookOpen' },
          { to: '/teacher/schedule', label: 'Schedule', icon: 'Calendar' },
          { to: '/teacher/attendance', label: 'Attendance', icon: 'ClipboardCheck' },
          { to: '/teacher/marks', label: 'Marks', icon: 'BarChart3' },
        ]
      case 'STUDENT':
        return [
          { to: '/student', label: 'Dashboard', icon: 'Home' },
          { to: '/student/profile', label: 'Profile', icon: 'User' },
          { to: '/student/messages', label: 'Messages', icon: 'MessageSquare' },
          { to: '/student/courses', label: 'My Courses', icon: 'BookOpen' },
          { to: '/student/schedule', label: 'Schedule', icon: 'Calendar' },
          { to: '/student/marks', label: 'My Marks', icon: 'GraduationCap' },
          { to: '/student/attendance', label: 'My Attendance', icon: 'FileText' },
        ]
      default:
        return []
    }
  }
}