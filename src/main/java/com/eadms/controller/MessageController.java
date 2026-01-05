package com.eadms.controller;

import com.eadms.dto.response.ApiResponse;
import com.eadms.dto.ConversationDTO;
import com.eadms.dto.MessageDTO;
import com.eadms.dto.SendMessageRequest;
import com.eadms.entity.User;
import com.eadms.repository.UserRepository;
import com.eadms.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
    
    private final MessageService messageService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<MessageDTO>> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SendMessageRequest request) {
        
        Long senderId = getUserIdFromUserDetails(userDetails);
        
        MessageDTO message = messageService.sendMessage(senderId, request);
        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", message));
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationDTO>>> getConversations(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        List<ConversationDTO> conversations = messageService.getConversations(userId);
        return ResponseEntity.ok(ApiResponse.success("Conversations retrieved successfully", conversations));
    }

    @GetMapping("/conversation/{partnerId}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getConversationMessages(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long partnerId) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        List<MessageDTO> messages = messageService.getConversationMessages(userId, partnerId);
        return ResponseEntity.ok(ApiResponse.success("Messages retrieved successfully", messages));
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<ApiResponse<MessageDTO>> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long messageId) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        MessageDTO message = messageService.markAsRead(messageId, userId);
        return ResponseEntity.ok(ApiResponse.success("Message marked as read", message));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        Long count = messageService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved successfully", count));
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long messageId) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        messageService.deleteMessage(messageId, userId);
        return ResponseEntity.ok(ApiResponse.success("Message deleted successfully", null));
    }

    private Long getUserIdFromUserDetails(UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
