package com.eadms.controller;

import com.eadms.dto.request.TicketCreateRequest;
import com.eadms.dto.request.TicketUpdateRequest;
import com.eadms.dto.response.ApiResponse;
import com.eadms.dto.response.TicketResponse;
import com.eadms.entity.Ticket;
import com.eadms.entity.User;
import com.eadms.service.AuthService;
import com.eadms.service.TicketService;
import com.eadms.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    
    private final TicketService ticketService;
    private final AuthService authService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER')")
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(@Valid @RequestBody TicketCreateRequest request) {
        User user = authService.getCurrentUser();
        TicketResponse response = ticketService.createTicket(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseUtil.success("Ticket created successfully", response));
    }
    
    @GetMapping("/my-tickets")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getMyTickets() {
        User user = authService.getCurrentUser();
        List<TicketResponse> tickets = ticketService.getMyTickets(user.getId());
        return ResponseEntity.ok(ResponseUtil.success("Tickets retrieved", tickets));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'TEACHER')")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketById(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        TicketResponse ticket = ticketService.getTicketById(id, user.getId(), user.getRole().name());
        return ResponseEntity.ok(ResponseUtil.success("Ticket retrieved", ticket));
    }
    
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getAllTickets() {
        List<TicketResponse> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(ResponseUtil.success("All tickets retrieved", tickets));
    }
    
    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTicketsByStatus(@PathVariable Ticket.Status status) {
        List<TicketResponse> tickets = ticketService.getTicketsByStatus(status);
        return ResponseEntity.ok(ResponseUtil.success("Tickets retrieved", tickets));
    }
    
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponse>> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody TicketUpdateRequest request) {
        TicketResponse response = ticketService.updateTicketStatus(id, request);
        return ResponseEntity.ok(ResponseUtil.success("Ticket updated successfully", response));
    }
}
