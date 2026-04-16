package com.findspace.repository;

import com.findspace.entity.Conversation;
import com.findspace.entity.Listing;
import com.findspace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("select c from Conversation c where (c.initiator = :u1 and c.recipient = :u2) or (c.initiator = :u2 and c.recipient = :u1)")
    Optional<Conversation> findBetweenUsers(@Param("u1") User u1, @Param("u2") User u2);

    @Query("select c from Conversation c where c.initiator = :user or c.recipient = :user")
    List<Conversation> findAllForUser(@Param("user") User user);

    /** Used to check if a listing has conversations before attempting hard delete. */
    boolean existsByListing(Listing listing);
}
