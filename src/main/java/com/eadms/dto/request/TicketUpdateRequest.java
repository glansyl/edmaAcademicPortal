package com.eadms.dto.request;

import com.eadms.entity.Ticket;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketUpdateRequest {
    
    @NotNull(message = "Status is required")
    private Ticket.Status status;
    
    private String adminResponse;
}
