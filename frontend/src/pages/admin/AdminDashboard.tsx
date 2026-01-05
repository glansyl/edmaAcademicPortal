import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { adminService } from '@/services/adminService'
import { DashboardStats } from '@/types'
import { Users, GraduationCap, BookOpen, UserCheck, TrendingUp, TrendingDown, Plus, UserPlus, BookPlus, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'
import { useNavigate } from 'react-router-dom'
import { SkeletonCard, SkeletonChart } from '@/components/SkeletonCard'

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [chartFilter, setChartFilter] = useState<'week' | 'month' | 'year'>('month')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats()
        setStats(data)
      } catch (error) {
        logger.error('Failed to fetch stats', error)
        toast.error('Failed to load dashboard stats')
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <div className="h-10 w-96 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
            <div className="h-5 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        </div>
      </div>
    )
  }

  const classData = Object.entries(stats?.studentsByClass || {}).map(([name, value]) => ({
    name,
    students: value,
  }))

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        {/* Welcome Section with Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Control Center</h1>
              <p className="text-base text-gray-600">Real-time insights and system management</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/admin/students')} 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 px-5 py-2.5"
              >
                <UserPlus className="w-4 h-4" />
                Add Student
              </Button>
              <Button 
                onClick={() => navigate('/admin/teachers')} 
                className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 px-5 py-2.5"
              >
                <Plus className="w-4 h-4" />
                Add Teacher
              </Button>
              <Button 
                onClick={() => navigate('/admin/courses')} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 px-5 py-2.5"
              >
                <BookPlus className="w-4 h-4" />
                Add Course
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Students Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 p-7 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Students</p>
                <p className="text-4xl font-bold text-gray-900 mb-3">{stats?.totalStudents || 0}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">12.5%</span>
                  </div>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Total Teachers Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 p-7 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Teachers</p>
                <p className="text-4xl font-bold text-gray-900 mb-3">{stats?.totalTeachers || 0}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">8.2%</span>
                  </div>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Total Courses Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 p-7 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Courses</p>
                <p className="text-4xl font-bold text-gray-900 mb-3">{stats?.totalCourses || 0}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">5.1%</span>
                  </div>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Users Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 p-7 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Active Users</p>
                <p className="text-4xl font-bold text-gray-900 mb-3">{stats?.activeUsers || 0}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">3.8%</span>
                  </div>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                  <UserCheck className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Students by Class Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 p-6 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Students by Class</h3>
                  <p className="text-sm text-gray-500 mt-1">Distribution across all classes</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                  <Filter className="w-3.5 h-3.5 text-gray-500" />
                  <select 
                    value={chartFilter}
                    onChange={(e) => setChartFilter(e.target.value as 'week' | 'month' | 'year')}
                    className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6">
              {classData.length > 0 ? (
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={classData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar 
                      dataKey="students" 
                      fill="#2563eb" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[340px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No class data available</p>
                    <p className="text-sm text-gray-400 mt-1">Add students to view distribution</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Teachers by Department Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 p-6 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Teachers by Department</h3>
                  <p className="text-sm text-gray-500 mt-1">Faculty distribution overview</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                  <Filter className="w-3.5 h-3.5 text-gray-500" />
                  <select 
                    className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                  >
                    <option value="all">All Depts</option>
                    <option value="active">Active Only</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6">
              {Object.keys(stats?.teachersByDepartment || {}).length > 0 ? (
                <ResponsiveContainer width="100%" height={340}>
                  <PieChart>
                    <Pie
                      data={Object.entries(stats?.teachersByDepartment || {}).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {Object.keys(stats?.teachersByDepartment || {}).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[340px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <GraduationCap className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No department data available</p>
                    <p className="text-sm text-gray-400 mt-1">Add teachers to view distribution</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
