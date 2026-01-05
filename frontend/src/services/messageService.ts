import api from './api'

export interface Message {
  id: number
  senderId: number
  senderName: string
  senderEmail: string
  receiverId: number
  receiverName: string
  receiverEmail: string
  subject: string
  content: string
  isRead: boolean
  sentAt: string
  readAt?: string
}

export interface Conversation {
  partnerId: number
  partnerName: string
  partnerEmail: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export interface SendMessageRequest {
  receiverId: number
  subject: string
  content: string
}

export const messageService = {
  async sendMessage(request: SendMessageRequest): Promise<Message> {
    const response = await api.post('/messages', request)
    return response.data
  },

  async getConversations(): Promise<Conversation[]> {
    const response = await api.get('/messages/conversations')
    return response.data
  },

  async getConversationMessages(partnerId: number): Promise<Message[]> {
    const response = await api.get(`/messages/conversation/${partnerId}`)
    return response.data
  },

  async markAsRead(messageId: number): Promise<Message> {
    const response = await api.put(`/messages/${messageId}/read`)
    return response.data
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get('/messages/unread-count')
    return response.data
  },

  async deleteMessage(messageId: number): Promise<void> {
    await api.delete(`/messages/${messageId}`)
  }
}
