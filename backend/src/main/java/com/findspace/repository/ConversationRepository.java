package com.findspace.repository;

import com.findspace.entity.Conversation;
import com.findspace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository for accessing conversations.  A conversation is uniquely identified
 * by the participants and optionally a listing.
 */
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @Query("select c from Conversation c where (c.initiator = :user1 and c.recipient = :user2) or (c.initiator = :user2 and c.recipient = :user1)")
    Optional<Conversation> findBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);

    @Query("select c from Conversation c where c.initiator = :user or c.recipient = :user")
    List<Conversation> findAllForUser(@Param("user") User user);
}