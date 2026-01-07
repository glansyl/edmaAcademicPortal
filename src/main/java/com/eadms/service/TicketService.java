package com.eadms.service;

import com.eadms.dto.request.TicketCreateRequest;
import com.eadms.dto.request.TicketUpdateRequest;
import com.eadms.dto.response.TicketResponse;
import com.eadms.entity.Ticket;

import java.util.List;

public interface TicketService {
    TicketResponse createTicket(TicketCreateRequest request, Long userId);
    TicketResponse getTicketById(Long id, Long userId, String role);
    List<TicketResponse> getMyTickets(Long userId);
    List<TicketResponse> getAllTickets();
    List<TicketResponse> getTicketsByStatus(Ticket.Status status);
    TicketResponse updateTicketStatus(Long id, TicketUpdateRequest request);
}
