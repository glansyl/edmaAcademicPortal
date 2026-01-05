package com.eadms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationDTO {
    private Long partnerId;
    private String partnerName;
    private String partnerEmail;
    private String lastMessage;
    private String lastMessageSenderName;
    private Boolean lastMessageFromMe;
    private LocalDateTime lastMessageTime;
    private Long unreadCount;
}
