package com.findspace.service;

import com.findspace.entity.User;
import com.findspace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }
        String hashed = passwordEncoder.encode(password);
        User user = new User(email, hashed, "USER");
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Update profile fields for the given user.  Only non-null values will be updated.
     *
     * @param user the user to update
     * @param name optional new name
     * @param phone optional new phone
     * @param about optional new about section
     * @return the updated user
     */
    public User updateProfile(User user, String name, String phone, String about) {
        if (name != null) {
            user.setName(name);
        }
        if (phone != null) {
            user.setPhone(phone);
        }
        if (about != null) {
            user.setAbout(about);
        }
        return userRepository.save(user);
    }

    /**
     * Change the password for the given user after verifying the old password.
     * This method will throw IllegalArgumentException if the old password
     * does not match the user's current hashed password.
     *
     * @param user the user whose password is to be changed
     * @param oldPassword the current password provided by the user
     * @param newPassword the new password to set
     */
    public void changePassword(User user, String oldPassword, String newPassword) {
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Old password does not match");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}