package com.findspace.service;

import com.findspace.entity.Notification;
import com.findspace.entity.User;
import com.findspace.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(User user, String content) {
        Notification notification = new Notification(user, content);
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * Mark the given notification as read.  If the notification does not exist an
     * {@link java.util.NoSuchElementException} will be thrown.  The updated
     * notification is returned for convenience.
     *
     * @param notificationId the ID of the notification to mark as read
     * @return the updated notification with the read flag set to true
     */
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow();
        if (!notification.isRead()) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
        return notification;
    }

    /**
     * Count the unread notifications for the given user.  Unread notifications are
     * those where the {@code read} flag has not been set to true.
     *
     * @param user the user whose unread notifications should be counted
     * @return the number of unread notifications
     */
    public long countUnreadForUser(User user) {
        return notificationRepository.countByUserAndReadFalse(user);
    }

    /**
     * Mark all notifications for the given user as read.  This method loops
     * through each notification associated with the user and sets the
     * {@code read} flag to {@code true} if it has not already been marked.
     * Persisting the updated entities in bulk improves efficiency compared to
     * saving each one individually.  If the user has no notifications this
     * method simply returns without performing any operation.
     *
     * @param user the user whose notifications should be marked as read
     */
    public void markAllAsReadForUser(User user) {
        java.util.List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        boolean updated = false;
        for (Notification n : notifications) {
            if (!n.isRead()) {
                n.setRead(true);
                updated = true;
            }
        }
        // Persist only if any notifications were changed
        if (updated) {
            notificationRepository.saveAll(notifications);
        }
    }
}