package com.findspace.service;

import com.findspace.entity.Conversation;
import com.findspace.entity.Listing;
import com.findspace.entity.User;
import com.findspace.repository.ConversationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ConversationService {
    private final ConversationRepository conversationRepository;

    @Autowired
    public ConversationService(ConversationRepository conversationRepository) {
        this.conversationRepository = conversationRepository;
    }

    public Conversation findOrCreateConversation(User initiator, User recipient, Listing listing) {
        Optional<Conversation> existing = conversationRepository.findBetweenUsers(initiator, recipient);
        if (existing.isPresent()) {
            // If the conversation exists but listing is not set and we now have a listing, update it
            Conversation conv = existing.get();
            if (conv.getListing() == null && listing != null) {
                conv.setListing(listing);
                conversationRepository.save(conv);
            }
            return conv;
        }
        Conversation conversation = new Conversation(initiator, recipient, listing);
        return conversationRepository.save(conversation);
    }

    public List<Conversation> getAllForUser(User user) {
        return conversationRepository.findAllForUser(user);
    }
}