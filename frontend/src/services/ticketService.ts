import api from './api'
import { Ticket, TicketCreateRequest, TicketUpdateRequest, TicketStatus } from '@/types/ticket'

export const ticketService = {
  async createTicket(request: TicketCreateRequest): Promise<Ticket> {
    const response = await api.post<Ticket>('/tickets', request)
    return response.data
  },

  async getMyTickets(): Promise<Ticket[]> {
    const response = await api.get<Ticket[]>('/tickets/my-tickets')
    return response.data
  },

  async getTicketById(id: number): Promise<Ticket> {
    const response = await api.get<Ticket>(`/tickets/${id}`)
    return response.data
  },

  async getAllTickets(): Promise<Ticket[]> {
    const response = await api.get<Ticket[]>('/tickets/admin/all')
    return response.data
  },

  async getTicketsByStatus(status: TicketStatus): Promise<Ticket[]> {
    const response = await api.get<Ticket[]>(`/tickets/admin/status/${status}`)
    return response.data
  },

  async updateTicketStatus(id: number, request: TicketUpdateRequest): Promise<Ticket> {
    const response = await api.put<Ticket>(`/tickets/admin/${id}`, request)
    return response.data
  },
}
