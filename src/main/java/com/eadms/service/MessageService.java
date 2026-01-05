package com.eadms.service;

import com.eadms.dto.ConversationDTO;
import com.eadms.dto.MessageDTO;
import com.eadms.dto.SendMessageRequest;

import java.util.List;

public interface MessageService {
    MessageDTO sendMessage(Long senderId, SendMessageRequest request);
    List<ConversationDTO> getConversations(Long userId);
    List<MessageDTO> getConversationMessages(Long userId, Long partnerId);
    MessageDTO markAsRead(Long messageId, Long userId);
    Long getUnreadCount(Long userId);
    void deleteMessage(Long messageId, Long userId);
}
