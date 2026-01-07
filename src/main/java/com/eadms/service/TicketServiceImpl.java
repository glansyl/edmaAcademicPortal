package com.eadms.service;

import com.eadms.dto.request.TicketCreateRequest;
import com.eadms.dto.request.TicketUpdateRequest;
import com.eadms.dto.response.TicketResponse;
import com.eadms.entity.Ticket;
import com.eadms.entity.User;
import com.eadms.exception.ResourceNotFoundException;
import com.eadms.exception.UnauthorizedException;
import com.eadms.repository.TicketRepository;
import com.eadms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {
    
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    
    @Override
    @Transactional
    public TicketResponse createTicket(TicketCreateRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Ticket ticket = Ticket.builder()
                .subject(request.getSubject())
                .description(request.getDescription())
                .category(request.getCategory())
                .status(Ticket.Status.OPEN)
                .user(user)
                .build();
        
        Ticket savedTicket = ticketRepository.save(ticket);
        return mapToResponse(savedTicket);
    }
    
    @Override
    public TicketResponse getTicketById(Long id, Long userId, String role) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        
        // Only admin or ticket owner can view
        if (!"ADMIN".equals(role) && !ticket.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to view this ticket");
        }
        
        return mapToResponse(ticket);
    }
    
    @Override
    public List<TicketResponse> getMyTickets(Long userId) {
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<TicketResponse> getTicketsByStatus(Ticket.Status status) {
        return ticketRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public TicketResponse updateTicketStatus(Long id, TicketUpdateRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        
        ticket.setStatus(request.getStatus());
        if (request.getAdminResponse() != null) {
            ticket.setAdminResponse(request.getAdminResponse());
        }
        
        Ticket updatedTicket = ticketRepository.save(ticket);
        return mapToResponse(updatedTicket);
    }
    
    private TicketResponse mapToResponse(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .status(ticket.getStatus())
                .userId(ticket.getUser().getId())
                .userEmail(ticket.getUser().getEmail())
                .userRole(ticket.getUser().getRole().name())
                .adminResponse(ticket.getAdminResponse())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}
