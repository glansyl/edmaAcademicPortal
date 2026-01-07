import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { noticeService, Notice, NoticeRequest } from '@/services/noticeService'
import { Plus, Edit2, Trash2, AlertCircle, Bell, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

export function NoticeManagement() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [formData, setFormData] = useState<NoticeRequest>({
    title: '',
    content: '',
    priority: 'MEDIUM',
    targetAudience: 'ALL',
    isActive: true,
  })

  useEffect(() => {
    loadNotices()
  }, [])

  const loadNotices = async () => {
    try {
      const data = await noticeService.getAllNotices()
      setNotices(data)
    } catch (error) {
      logger.error('Failed to load notices:', error)
      toast.error('Failed to load notices')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingNotice) {
        await noticeService.updateNotice(editingNotice.id, formData)
        toast.success('Notice updated successfully')
      } else {
        await noticeService.createNotice(formData)
        toast.success('Notice created successfully')
      }
      
      setShowModal(false)
      resetForm()
      loadNotices()
    } catch (error) {
      logger.error('Failed to save notice:', error)
      toast.error('Failed to save notice')
    }
  }

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice)
    setFormData({
      title: notice.title,
      content: notice.content,
      priority: notice.priority,
      targetAudience: notice.targetAudience,
      expiresAt: notice.expiresAt,
      isActive: notice.isActive,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notice?')) return
    
    try {
      await noticeService.deleteNotice(id)
      toast.success('Notice deleted successfully')
      loadNotices()
    } catch (error) {
      logger.error('Failed to delete notice:', error)
      toast.error('Failed to delete notice')
    }
  }

  const resetForm = () => {
    setEditingNotice(null)
    setFormData({
      title: '',
      content: '',
      priority: 'MEDIUM',
      targetAudience: 'ALL',
      isActive: true,
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <Loading />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notice Management</h1>
            <p className="text-gray-600 mt-1">Create and manage system announcements</p>
          </div>
          <Button onClick={() => { resetForm(); setShowModal(true) }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Notice
          </Button>
        </div>

        <div className="grid gap-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notice.priority)}`}>
                      {notice.priority}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {notice.targetAudience}
                    </span>
                    {!notice.isActive && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                    {notice.isExpired && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Expired
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3">{notice.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>By: {notice.createdByName}</span>
                    <span>•</span>
                    <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                    {notice.expiresAt && (
                      <>
                        <span>•</span>
                        <span>Expires: {new Date(notice.expiresAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(notice)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(notice.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {notices.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No notices found. Create your first notice!</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingNotice ? 'Edit Notice' : 'Create Notice'}
                </h2>
                <button onClick={() => { setShowModal(false); resetForm() }}>
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All</option>
                      <option value="STUDENTS">Students</option>
                      <option value="TEACHERS">Teachers</option>
                      <option value="ADMINS">Admins</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt || ''}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingNotice ? 'Update Notice' : 'Create Notice'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowModal(false); resetForm() }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
