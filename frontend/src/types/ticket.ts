export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
export type TicketCategory = 'LOGIN_ISSUE' | 'PROFILE_UPDATE' | 'ACCOUNT_CORRECTION' | 'GENERAL_COMPLAINT' | 'OTHER'

export interface Ticket {
  id: number
  subject: string
  description: string
  category: TicketCategory
  status: TicketStatus
  userId: number
  userEmail: string
  userRole: string
  adminResponse?: string
  createdAt: string
  updatedAt: string
}

export interface TicketCreateRequest {
  subject: string
  description: string
  category: TicketCategory
}

export interface TicketUpdateRequest {
  status: TicketStatus
  adminResponse?: string
}
