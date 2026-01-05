import { useEffect, useState } from 'react'
import { studentService } from '@/services/studentService'
import { Attendance } from '@/types'
import { Sidebar } from '@/components/Sidebar'
import { Users, AlertTriangle, TrendingDown, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { AttendanceHeatmap } from '@/components/AttendanceHeatmap'

export function StudentAttendance() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAttendance()
  }, [])

  const loadAttendance = async () => {
    try {
      const data = await studentService.getMyAttendance()
      setAttendance(data)
    } catch (error) {
      toast.error('Failed to load attendance')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateAttendancePercentage = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(r => r.status === 'PRESENT').length;
    return (present / attendance.length) * 100;
  };

  const attendancePercentage = calculateAttendancePercentage();
  const isAtRisk = attendancePercentage < 75;

  const getStatusBadge = (status: string) => {
    const colors = {
      PRESENT: 'bg-green-100 text-green-800',
      ABSENT: 'bg-red-100 text-red-800',
      LATE: 'bg-yellow-100 text-yellow-800',
      EXCUSED: 'bg-blue-100 text-blue-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getDateRange = () => {
    if (attendance.length === 0) return { start: new Date(), end: new Date() };
    
    const dates = attendance.map(r => new Date(r.attendanceDate));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    return { start: minDate, end: maxDate };
  };

  const { start: startDate, end: endDate } = getDateRange();

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Attendance</h1>

        {/* At-Risk Alert */}
        {isAtRisk && attendance.length > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800">
                  Attendance Below Required Minimum
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  Your attendance is at {attendancePercentage}%, which is below the required 75%. 
                  You need to attend more classes to avoid academic penalties.
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs text-red-600">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    {attendance.filter(r => r.status === 'ABSENT').length} absences
                  </span>
                  <span>•</span>
                  <span>
                    Need {Math.ceil((0.75 * attendance.length - attendance.filter(r => r.status === 'PRESENT').length) / 0.25)} more classes to reach 75%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {attendance.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Attendance</p>
                  <p className={`text-3xl font-bold mt-2 ${isAtRisk ? 'text-red-600' : 'text-green-600'}`}>
                    {attendancePercentage}%
                  </p>
                </div>
                <Calendar className={`w-12 h-12 ${isAtRisk ? 'text-red-500' : 'text-green-500'}`} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Classes Attended</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {attendance.filter(r => r.status === 'PRESENT').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">out of {attendance.length}</p>
                </div>
                <Users className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Classes Missed</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {attendance.filter(r => r.status === 'ABSENT').length}
                  </p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Attendance Heatmap */}
        {attendance.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <AttendanceHeatmap 
              attendanceRecords={attendance}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        )}

        {attendance.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No attendance records</h3>
            <p className="mt-2 text-sm text-gray-500">
              You don't have any attendance records yet.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Attendance Records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.course?.courseName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(record.attendanceDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
