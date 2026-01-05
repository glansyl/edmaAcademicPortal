package com.eadms.service.impl;

import com.eadms.dto.ConversationDTO;
import com.eadms.dto.MessageDTO;
import com.eadms.dto.SendMessageRequest;
import com.eadms.entity.Message;
import com.eadms.entity.User;
import com.eadms.exception.ResourceNotFoundException;
import com.eadms.exception.UnauthorizedException;
import com.eadms.repository.MessageRepository;
import com.eadms.repository.UserRepository;
import com.eadms.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageServiceImpl implements MessageService {
    
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public MessageDTO sendMessage(Long senderId, SendMessageRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .subject(request.getSubject())
                .content(request.getContent())
                .isRead(false)
                .build();

        message = messageRepository.save(message);
        MessageDTO messageDTO = convertToDTO(message);
        
        // Broadcast message via WebSocket to both sender and receiver
        try {
            messagingTemplate.convertAndSendToUser(
                    request.getReceiverId().toString(),
                    "/queue/messages",
                    messageDTO
            );
            
            messagingTemplate.convertAndSendToUser(
                    senderId.toString(),
                    "/queue/messages",
                    messageDTO
            );
            
            log.info("Message broadcasted via WebSocket from user {} to user {}", senderId, request.getReceiverId());
        } catch (Exception e) {
            log.error("Error broadcasting message via WebSocket", e);
        }
        
        return messageDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationDTO> getConversations(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<User> partners = messageRepository.findConversationPartners(userId);
        
        return partners.stream()
                .map(partner -> {
                    List<Message> conversation = messageRepository.findConversationBetweenUsers(user, partner);
                    Message lastMessage = conversation.isEmpty() ? null : conversation.get(conversation.size() - 1);
                    
                    long unreadCount = conversation.stream()
                            .filter(m -> m.getReceiver().equals(user) && !m.getIsRead())
                            .count();

                    return ConversationDTO.builder()
                            .partnerId(partner.getId())
                            .partnerName(partner.getFullName())
                            .partnerEmail(partner.getEmail())
                            .lastMessage(lastMessage != null ? lastMessage.getContent() : "")
                            .lastMessageSenderName(lastMessage != null ? lastMessage.getSender().getFullName() : "")
                            .lastMessageFromMe(lastMessage != null && lastMessage.getSender().equals(user))
                            .lastMessageTime(lastMessage != null ? lastMessage.getSentAt() : null)
                            .unreadCount(unreadCount)
                            .build();
                })
                .sorted(Comparator.comparing(ConversationDTO::getLastMessageTime, 
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageDTO> getConversationMessages(Long userId, Long partnerId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        User partner = userRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));

        List<Message> messages = messageRepository.findConversationBetweenUsers(user, partner);
        
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageDTO markAsRead(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getReceiver().getId().equals(userId)) {
            throw new UnauthorizedException("You can only mark your own received messages as read");
        }

        if (!message.getIsRead()) {
            message.setIsRead(true);
            message.setReadAt(LocalDateTime.now());
            message = messageRepository.save(message);
            
            // Notify sender via WebSocket that their message was read
            try {
                messagingTemplate.convertAndSendToUser(
                        message.getSender().getId().toString(),
                        "/queue/message-read",
                        messageId
                );
                log.info("Notified user {} that message {} was read", message.getSender().getId(), messageId);
            } catch (Exception e) {
                log.error("Error notifying message read via WebSocket", e);
            }
        }

        return convertToDTO(message);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return messageRepository.countByReceiverAndIsReadFalse(user);
    }

    @Override
    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getSender().getId().equals(userId) && !message.getReceiver().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own messages");
        }

        messageRepository.delete(message);
    }

    private MessageDTO convertToDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFullName())
                .senderEmail(message.getSender().getEmail())
                .receiverId(message.getReceiver().getId())
                .receiverName(message.getReceiver().getFullName())
                .receiverEmail(message.getReceiver().getEmail())
                .subject(message.getSubject())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .sentAt(message.getSentAt())
                .readAt(message.getReadAt())
                .build();
    }
}
