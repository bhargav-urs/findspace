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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller to handle conversations and messaging between users.
 *
 * IMPORTANT: All response maps use HashMap — NOT Map.of().
 * Map.of() throws NullPointerException when any value is null.
 * listingId and lastMessage are both nullable, which was crashing
 * the conversations list endpoint entirely.
 */
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final UserService userService;
    private final ListingService listingService;
    private final ConversationService conversationService;
    private final MessageService messageService;

    @Autowired
    public MessageController(UserService userService, ListingService listingService,
                             ConversationService conversationService, MessageService messageService) {
        this.userService = userService;
        this.listingService = listingService;
        this.conversationService = conversationService;
        this.messageService = messageService;
    }

    /**
     * Start or continue a conversation and send a message.
     * Body: { receiverId, receiverEmail, listingId (optional), content }
     */
    @PostMapping("/start")
    public ResponseEntity<?> startConversationAndSend(
            @RequestBody Map<String, String> payload, Principal principal) {

        User sender = userService.findByEmail(principal.getName()).orElseThrow();
        String receiverIdStr  = payload.get("receiverId");
        String receiverEmail  = payload.get("receiverEmail");
        String content        = payload.get("content");
        String listingIdStr   = payload.get("listingId");

        if (content == null || content.isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Message content is required");
            return ResponseEntity.badRequest().body(err);
        }

        // Resolve receiver by ID or email
        User receiver = null;
        if (receiverIdStr != null && !receiverIdStr.isBlank()) {
            try { receiver = userService.findById(Long.parseLong(receiverIdStr)).orElse(null); }
            catch (NumberFormatException ignored) {}
        }
        if (receiver == null && receiverEmail != null && !receiverEmail.isBlank()) {
            receiver = userService.findByEmail(receiverEmail).orElse(null);
        }
        if (receiver == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Receiver not found");
            return ResponseEntity.badRequest().body(err);
        }
        if (receiver.getId().equals(sender.getId())) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Cannot message yourself");
            return ResponseEntity.badRequest().body(err);
        }

        // Resolve optional listing
        Listing listing = null;
        if (listingIdStr != null && !listingIdStr.isBlank()) {
            try { listing = listingService.getById(Long.parseLong(listingIdStr)); }
            catch (Exception ignored) {}
        }

        Conversation conversation = conversationService.findOrCreateConversation(sender, receiver, listing);
        Message message = messageService.sendMessage(conversation, sender, receiver, content);

        Map<String, Object> result = new HashMap<>();
        result.put("conversationId", conversation.getId());
        result.put("messageId", message.getId());
        return ResponseEntity.ok(result);
    }

    /**
     * List all conversations for the current user with last message preview.
     */
    @GetMapping("/conversations")
    public ResponseEntity<?> listConversations(Principal principal) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        List<Conversation> conversations = conversationService.getAllForUser(user);

        List<Map<String, Object>> result = conversations.stream().map(conv -> {
            User other = conv.getInitiator().equals(user) ? conv.getRecipient() : conv.getInitiator();
            List<Message> messages = messageService.getMessagesForConversation(conv);
            Message last = messages.isEmpty() ? null : messages.get(messages.size() - 1);

            // Use HashMap — allows null values unlike Map.of()
            Map<String, Object> m = new HashMap<>();
            m.put("id",             conv.getId());
            m.put("otherUserId",    other.getId());
            m.put("otherUserEmail", other.getEmail());
            // listingId is nullable — HashMap handles this safely
            m.put("listingId",      conv.getListing() != null ? conv.getListing().getId() : null);
            // lastMessage is nullable — build a sub-map only when it exists
            if (last != null) {
                Map<String, Object> lastMap = new HashMap<>();
                lastMap.put("content",  last.getContent());
                lastMap.put("senderId", last.getSender().getId());
                lastMap.put("sentAt",   last.getSentAt());
                m.put("lastMessage", lastMap);
            } else {
                m.put("lastMessage", null);
            }
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Get all messages in a specific conversation.
     */
    @GetMapping("/conversations/{id}")
    public ResponseEntity<?> getConversationMessages(
            @PathVariable Long id, Principal principal) {

        User user = userService.findByEmail(principal.getName()).orElseThrow();
        Conversation conversation = conversationService.getAllForUser(user).stream()
                .filter(c -> c.getId().equals(id)).findFirst()
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        List<Map<String, Object>> messages = messageService
                .getMessagesForConversation(conversation).stream()
                .map(msg -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",          msg.getId());
                    m.put("senderId",    msg.getSender().getId());
                    m.put("senderEmail", msg.getSender().getEmail());
                    m.put("content",     msg.getContent());
                    m.put("sentAt",      msg.getSentAt());
                    return m;
                }).collect(Collectors.toList());

        return ResponseEntity.ok(messages);
    }
}
