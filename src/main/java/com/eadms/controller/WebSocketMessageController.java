package com.eadms.controller;

import com.eadms.dto.MessageDTO;
import com.eadms.dto.SendMessageRequest;
import com.eadms.entity.User;
import com.eadms.repository.UserRepository;
import com.eadms.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketMessageController {
    
    private final MessageService messageService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Handle messages sent from client via WebSocket
     * Client sends to: /app/chat.send
     */
    @MessageMapping("/chat.send")
    public void sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @Payload SendMessageRequest request) {
        
        try {
            Long senderId = getUserIdFromUserDetails(userDetails);
            
            // Save message to database
            MessageDTO message = messageService.sendMessage(senderId, request);
            
            // Send to receiver via WebSocket
            // Receiver subscribes to: /user/{userId}/queue/messages
            messagingTemplate.convertAndSendToUser(
                    request.getReceiverId().toString(),
                    "/queue/messages",
                    message
            );
            
            // Also send back to sender for confirmation
            messagingTemplate.convertAndSendToUser(
                    senderId.toString(),
                    "/queue/messages",
                    message
            );
            
            log.info("Message sent via WebSocket from user {} to user {}", senderId, request.getReceiverId());
            
        } catch (Exception e) {
            log.error("Error sending message via WebSocket", e);
        }
    }

    /**
     * Notify user when their message is read
     */
    public void notifyMessageRead(Long senderId, Long messageId) {
        messagingTemplate.convertAndSendToUser(
                senderId.toString(),
                "/queue/message-read",
                messageId
        );
    }

    private Long getUserIdFromUserDetails(UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
