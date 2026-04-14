package com.findspace.controller;

import com.findspace.entity.Conversation;
import com.findspace.entity.Listing;
import com.findspace.entity.Message;
import com.findspace.entity.User;
import com.findspace.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller to handle conversations and messaging between users.
 */
@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final UserService userService;
    private final ListingService listingService;
    private final ConversationService conversationService;
    private final MessageService messageService;

    @Autowired
    public MessageController(UserService userService, ListingService listingService, ConversationService conversationService, MessageService messageService) {
        this.userService = userService;
        this.listingService = listingService;
        this.conversationService = conversationService;
        this.messageService = messageService;
    }

    /**
     * Start or retrieve a conversation with another user, optionally associated with a listing, and send a message.
     * Body: {"receiverId": number, "listingId": number|null, "content": string}
     */
    @PostMapping("/start")
    public ResponseEntity<?> startConversationAndSend(@RequestBody Map<String, String> payload, Principal principal) {
        User sender = userService.findByEmail(principal.getName()).orElseThrow();
        String receiverIdStr = payload.get("receiverId");
        String receiverEmail = payload.get("receiverEmail");
        String content = payload.get("content");
        String listingIdStr = payload.get("listingId");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message content is required"));
        }
        User receiver = null;
        if (receiverIdStr != null && !receiverIdStr.isBlank()) {
            try {
                Long receiverId = Long.parseLong(receiverIdStr);
                receiver = userService.findById(receiverId).orElse(null);
            } catch (NumberFormatException ignore) {}
        }
        if (receiver == null && receiverEmail != null && !receiverEmail.isBlank()) {
            receiver = userService.findByEmail(receiverEmail).orElse(null);
        }
        if (receiver == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Receiver not found"));
        }
        Listing listing = null;
        if (listingIdStr != null && !listingIdStr.isBlank()) {
            try {
                Long listingId = Long.parseLong(listingIdStr);
                listing = listingService.getById(listingId);
            } catch (NumberFormatException ignore) {}
        }
        // Prevent users from sending messages to themselves.  A user should not be able to
        // start a conversation where the sender and receiver are identical, as this rarely
        // makes sense in a roommate‑matching context and could confuse the UI.  If a client
        // attempts to send a message to the same user, return a Bad Request with an
        // appropriate error message.
        if (receiver.getId().equals(sender.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot message yourself"));
        }
        Conversation conversation = conversationService.findOrCreateConversation(sender, receiver, listing);
        Message message = messageService.sendMessage(conversation, sender, receiver, content);
        return ResponseEntity.ok(Map.of("conversationId", conversation.getId(), "messageId", message.getId()));
    }

    /**
     * Get list of conversations for the current user.  Each conversation includes the other participant's id and email and the last message.
     */
    @GetMapping("/conversations")
    public ResponseEntity<?> listConversations(Principal principal) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        List<Conversation> conversations = conversationService.getAllForUser(user);
        return ResponseEntity.ok(conversations.stream().map(conv -> {
            // determine the other participant
            User other = conv.getInitiator().equals(user) ? conv.getRecipient() : conv.getInitiator();
            // fetch last message
            List<Message> messages = messageService.getMessagesForConversation(conv);
            Message lastMessage = messages.isEmpty() ? null : messages.get(messages.size() - 1);
            return Map.of(
                    "id", conv.getId(),
                    "otherUserId", other.getId(),
                    "otherUserEmail", other.getEmail(),
                    "listingId", conv.getListing() != null ? conv.getListing().getId() : null,
                    "lastMessage", lastMessage != null ? Map.of(
                            "content", lastMessage.getContent(),
                            "senderId", lastMessage.getSender().getId(),
                            "sentAt", lastMessage.getSentAt()
                    ) : null
            );
        }).collect(Collectors.toList()));
    }

    /**
     * Get all messages for a given conversation.
     */
    @GetMapping("/conversations/{id}")
    public ResponseEntity<?> getConversationMessages(@PathVariable Long id, Principal principal) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        Conversation conversation = conversationService.getAllForUser(user).stream()
                .filter(c -> c.getId().equals(id)).findFirst()
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        List<Message> messages = messageService.getMessagesForConversation(conversation);
        return ResponseEntity.ok(messages.stream().map(m -> Map.of(
                "id", m.getId(),
                "senderId", m.getSender().getId(),
                "senderEmail", m.getSender().getEmail(),
                "content", m.getContent(),
                "sentAt", m.getSentAt()
        )).collect(Collectors.toList()));
    }
}