package com.findspace.controller;

import com.findspace.entity.User;
import com.findspace.entity.Notification;
import com.findspace.service.NotificationService;
import com.findspace.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Controller for fetching notifications for the current user.
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    private final UserService userService;

    @Autowired
    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(Principal principal) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        List<Notification> notifications = notificationService.getNotificationsForUser(user);
        return ResponseEntity.ok(
                notifications.stream().map(n -> Map.of(
                        "id", n.getId(),
                        "content", n.getContent(),
                        "read", n.isRead(),
                        "createdAt", n.getCreatedAt()
                )).toList()
        );
    }

    /**
     * Get the number of unread notifications for the current user.  This endpoint
     * allows the frontend to display an unread count badge without fetching the
     * entire list of notifications.  Only authenticated users may access this
     * endpoint.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Principal principal) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        long count = notificationService.countUnreadForUser(user);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Mark a notification as read for the current user.  The notification ID is
     * provided as a path variable.  If the notification does not belong to the
     * current user, this operation is ignored to avoid leaking information.  A
     * successful response does not include the notification data.
     *
     * @param id the ID of the notification to mark as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable("id") Long id, Principal principal) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        // Find the notification among the current user's notifications
        List<Notification> notifications = notificationService.getNotificationsForUser(user);
        Notification notification = notifications.stream()
                .filter(n -> n.getId().equals(id))
                .findFirst()
                .orElse(null);
        if (notification == null) {
            // Do not reveal existence of notifications belonging to other users
            return ResponseEntity.notFound().build();
        }
        // Mark as read if not already
        if (!notification.isRead()) {
            notification.setRead(true);
            // Persist the change
            notificationService.markAsRead(notification.getId());
        }
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    /**
     * Mark all notifications for the current user as read.  This endpoint
     * provides a convenient way for clients to clear the notification badge
     * after reviewing the list.  All unread notifications belonging to the
     * current user will have their {@code read} flag set to {@code true}.
     *
     * @return a success message indicating that notifications were marked
     */
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllNotificationsAsRead(Principal principal) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        notificationService.markAllAsReadForUser(user);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}