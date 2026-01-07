import { useEffect, useState } from 'react'
import { noticeService, Notice } from '@/services/noticeService'
import { Bell, AlertCircle, X } from 'lucide-react'
import { logger } from '@/lib/logger'

export function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dismissedNotices, setDismissedNotices] = useState<number[]>([])

  useEffect(() => {
    loadNotices()
    // Load dismissed notices from localStorage
    const dismissed = localStorage.getItem('dismissedNotices')
    if (dismissed) {
      setDismissedNotices(JSON.parse(dismissed))
    }
  }, [])

  const loadNotices = async () => {
    try {
      const data = await noticeService.getNoticesForCurrentUser()
      setNotices(data.slice(0, 5)) // Show only top 5 notices
    } catch (error) {
      logger.error('Failed to load notices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = (noticeId: number) => {
    const newDismissed = [...dismissedNotices, noticeId]
    setDismissedNotices(newDismissed)
    localStorage.setItem('dismissedNotices', JSON.stringify(newDismissed))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'border-l-red-500 bg-red-50'
      case 'HIGH': return 'border-l-orange-500 bg-orange-50'
      case 'MEDIUM': return 'border-l-yellow-500 bg-yellow-50'
      case 'LOW': return 'border-l-green-500 bg-green-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
      case 'HIGH':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Bell className="w-5 h-5 text-blue-600" />
    }
  }

  const visibleNotices = notices.filter(notice => !dismissedNotices.includes(notice.id))

  if (isLoading || visibleNotices.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center mb-4">
        <Bell className="w-5 h-5 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
      </div>

      <div className="space-y-3">
        {visibleNotices.map((notice) => (
          <div
            key={notice.id}
            className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(notice.priority)} relative`}
          >
            <button
              onClick={() => handleDismiss(notice.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-start gap-3 pr-6">
              {getPriorityIcon(notice.priority)}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{notice.title}</h3>
                <p className="text-sm text-gray-700 mb-2">{notice.content}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="px-2 py-0.5 bg-white rounded-full">
                    {notice.priority}
                  </span>
                  <span>•</span>
                  <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
