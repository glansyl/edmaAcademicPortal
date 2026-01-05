package com.eadms.repository;

import com.eadms.entity.Message;
import com.eadms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderOrReceiverOrderBySentAtDesc(User sender, User receiver);
    
    List<Message> findByReceiverAndIsReadFalse(User receiver);
    
    @Query("SELECT m FROM Message m JOIN FETCH m.sender JOIN FETCH m.receiver WHERE (m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1) ORDER BY m.sentAt ASC")
    List<Message> findConversationBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
    
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.student LEFT JOIN FETCH u.teacher WHERE u.id IN " +
           "(SELECT m.sender.id FROM Message m WHERE m.receiver.id = :userId) OR " +
           "u.id IN (SELECT m.receiver.id FROM Message m WHERE m.sender.id = :userId)")
    List<User> findConversationPartners(@Param("userId") Long userId);
    
    Long countByReceiverAndIsReadFalse(User receiver);
}
