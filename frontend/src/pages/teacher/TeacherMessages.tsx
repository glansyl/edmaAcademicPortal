import { useEffect, useState } from 'react'
import { Sidebar } from '../../components/Sidebar'
import { MessageSquare, Send, Search, Plus, X } from 'lucide-react'
import { messageService, Conversation, Message } from '@/services/messageService'
import { teacherService } from '@/services/teacherService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { webSocketService } from '@/services/websocketService'
import { logger } from '@/lib/logger'

export function TeacherMessages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedPartner, setSelectedPartner] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [composeMessage, setComposeMessage] = useState('')

  useEffect(() => {
    loadConversations()
    loadStudents()
    
    // Connect to WebSocket
    const token = localStorage.getItem('token')
    if (token && user?.id) {
      webSocketService.connect(
        token,
        () => {
          logger.log('WebSocket connected successfully')
          // Subscribe to personal message queue
          webSocketService.subscribe(`/user/${user.id}/queue/messages`, (message: Message) => {
            logger.log('Received message via WebSocket:', message)
            
            // Update conversations list
            loadConversations()
            
            // If the message is part of current conversation, update messages
            setMessages(prev => {
              // Only add if from current conversation partner
              const isCurrentConversation = selectedPartner && 
                (message.senderId === selectedPartner.partnerId || message.receiverId === selectedPartner.partnerId)
              return isCurrentConversation ? [...prev, message] : prev
            })
            
            // Show notification if message is from someone else
            if (message.senderId !== user.id) {
              toast.success(`New message from ${message.senderName}`)
            }
          })
          
          // Subscribe to message read notifications
          webSocketService.subscribe(`/user/${user.id}/queue/message-read`, (messageId: number) => {
            logger.log('Message marked as read:', messageId)
            // Update message status in current conversation
            setMessages(prev => prev.map(msg => 
              msg.id === messageId ? { ...msg, isRead: true } : msg
            ))
          })
        },
        (error) => {
          logger.error('WebSocket connection error:', error)
        }
      )
    }

    // Cleanup on unmount - properly disconnect regardless of dependencies
    return () => {
      webSocketService.disconnect()
    }
  }, [user?.id]) // Only re-run if user ID changes

  // Reload messages when selected partner changes
  useEffect(() => {
    if (selectedPartner) {
      loadMessages(selectedPartner.partnerId)
    }
  }, [selectedPartner?.partnerId])

  const loadStudents = async () => {
    try {
      const data = await teacherService.getStudents()
      setStudents(data)
    } catch (error) {
      logger.error('Failed to load students:', error)
      toast.error('Failed to load students')
    }
  }

  const loadConversations = async () => {
    try {
      const data = await messageService.getConversations()
      setConversations(data)
    } catch (error) {
      toast.error('Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (partnerId: number) => {
    try {
      const data = await messageService.getConversationMessages(partnerId)
      setMessages(data)
      
      // Mark unread messages as read (only messages where current user is the receiver)
      // We need to get current user ID from the conversations or assume teacher role
      const unreadMessages = data.filter(m => !m.isRead && m.senderId === partnerId)
      for (const msg of unreadMessages) {
        await messageService.markAsRead(msg.id)
      }
      
      // Reload conversations to update unread counts
      if (unreadMessages.length > 0) {
        loadConversations()
      }
    } catch (error) {
      toast.error('Failed to load messages')
    }
  }

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedPartner(conv)
    loadMessages(conv.partnerId)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedPartner) return

    try {
      await messageService.sendMessage({
        receiverId: selectedPartner.partnerId,
        subject: 'Message',
        content: newMessage
      })
      setNewMessage('')
      loadMessages(selectedPartner.partnerId)
      loadConversations()
      toast.success('Message sent')
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const handleComposeMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!composeMessage.trim() || !selectedStudentId) return

    try {
      await messageService.sendMessage({
        receiverId: selectedStudentId,
        subject: 'New Message',
        content: composeMessage
      })
      setComposeMessage('')
      setSelectedStudentId(null)
      setShowNewMessageModal(false)
      loadConversations()
      toast.success('Message sent successfully!')
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    }
    return date.toLocaleDateString()
  }

  const filteredConversations = conversations.filter(conv =>
    conv.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <button
            onClick={() => setShowNewMessageModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Message
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-12rem)] flex">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No conversations yet</div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 hover:bg-gray-50 border-b border-gray-100 text-left transition-colors ${
                      selectedPartner?.partnerId === conv.partnerId ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-semibold text-gray-900">{conv.partnerName}</span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      <span className="font-medium">{conv.lastMessageFromMe ? 'You' : conv.lastMessageSenderName}:</span> {conv.lastMessage}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(conv.lastMessageTime)}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-1 flex flex-col">
            {!selectedPartner ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            ) : (
              <>
                {/* Messages Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">{selectedPartner.partnerName}</h3>
                  <p className="text-sm text-gray-500">{selectedPartner.partnerEmail}</p>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const isSender = msg.senderId !== selectedPartner.partnerId
                    return (
                      <div key={msg.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          isSender ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isSender ? 'text-blue-100' : 'text-gray-500'}`}>
                            {formatTime(msg.sentAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* New Message Modal */}
        {showNewMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">New Message</h2>
                <button
                  onClick={() => {
                    setShowNewMessageModal(false)
                    setSelectedStudentId(null)
                    setComposeMessage('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleComposeMessage} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student
                  </label>
                  <select
                    value={selectedStudentId || ''}
                    onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a student...</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.userId}>
                        {student.firstName} {student.lastName} - {student.studentId}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={composeMessage}
                    onChange={(e) => setComposeMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewMessageModal(false)
                      setSelectedStudentId(null)
                      setComposeMessage('')
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedStudentId || !composeMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
