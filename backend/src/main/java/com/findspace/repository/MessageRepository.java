package com.findspace.repository;

import com.findspace.entity.Conversation;
import com.findspace.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Repository for accessing chat messages.
 */
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationOrderBySentAtAsc(Conversation conversation);
}