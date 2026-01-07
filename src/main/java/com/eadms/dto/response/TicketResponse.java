package com.eadms.dto.response;

import com.eadms.entity.Ticket;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {
    private Long id;
    private String subject;
    private String description;
    private Ticket.Category category;
    private Ticket.Status status;
    private Long userId;
    private String userEmail;
    private String userRole;
    private String adminResponse;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
