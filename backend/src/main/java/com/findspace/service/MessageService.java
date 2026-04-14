package com.findspace.service;

import com.findspace.entity.Conversation;
import com.findspace.entity.Message;
import com.findspace.entity.User;
import com.findspace.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {
    private final MessageRepository messageRepository;
    private final NotificationService notificationService;

    @Autowired
    public MessageService(MessageRepository messageRepository, NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.notificationService = notificationService;
    }

    public Message sendMessage(Conversation conversation, User sender, User recipient, String content) {
        Message message = new Message(conversation, sender, content);
        message = messageRepository.save(message);
        // create a notification for the recipient
        String preview = content.length() > 50 ? content.substring(0, 50) + "..." : content;
        notificationService.createNotification(recipient, "New message from " + sender.getEmail() + ": " + preview);
        return message;
    }

    public List<Message> getMessagesForConversation(Conversation conversation) {
        return messageRepository.findByConversationOrderBySentAtAsc(conversation);
    }
}