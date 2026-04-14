package com.findspace.repository;

import com.findspace.entity.Notification;
import com.findspace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository for accessing notifications.
 */
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Count the number of unread notifications for the given user.  Unread notifications
     * are those where the {@code read} flag is false.
     *
     * @param user the user whose unread notifications should be counted
     * @return the number of unread notifications
     */
    long countByUserAndReadFalse(User user);
}