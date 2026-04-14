package com.findspace.controller;

import com.findspace.entity.User;
import com.findspace.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

/**
 * Controller for accessing and updating user profile information.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final com.findspace.service.ListingService listingService;

    @Autowired
    public UserController(UserService userService, com.findspace.service.ListingService listingService) {
        this.userService = userService;
        this.listingService = listingService;
    }

    /**
     * Get the current authenticated user's profile.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMe(Principal principal) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        // Fetch the user's own listings
        java.util.List<com.findspace.entity.Listing> myListings = listingService.findByOwner(user);
        java.util.List<java.util.Map<String, Object>> listingMaps = myListings.stream().map(listing -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", listing.getId());
            map.put("title", listing.getTitle());
            map.put("description", listing.getDescription());
            map.put("rent", listing.getRent());
            map.put("address", listing.getAddress());
            map.put("createdAt", listing.getCreatedAt());
            return map;
        }).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(java.util.Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "createdAt", user.getCreatedAt(),
                "name", user.getName(),
                "phone", user.getPhone(),
                "about", user.getAbout(),
                "listings", listingMaps
        ));
    }

    /**
     * Update the current authenticated user's profile.  Accepts any combination of
     * name, phone, or about fields.
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateMe(Principal principal, @RequestBody java.util.Map<String, String> payload) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        String name = payload.get("name");
        String phone = payload.get("phone");
        String about = payload.get("about");
        User updated = userService.updateProfile(user, name, phone, about);
        // include listings in response as well
        java.util.List<com.findspace.entity.Listing> myListings = listingService.findByOwner(updated);
        java.util.List<java.util.Map<String, Object>> listingMaps = myListings.stream().map(listing -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", listing.getId());
            map.put("title", listing.getTitle());
            map.put("description", listing.getDescription());
            map.put("rent", listing.getRent());
            map.put("address", listing.getAddress());
            map.put("createdAt", listing.getCreatedAt());
            return map;
        }).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(java.util.Map.of(
                "id", updated.getId(),
                "email", updated.getEmail(),
                "role", updated.getRole(),
                "createdAt", updated.getCreatedAt(),
                "name", updated.getName(),
                "phone", updated.getPhone(),
                "about", updated.getAbout(),
                "listings", listingMaps
        ));
    }

    /**
     * Change the current user's password.  The request body should include
     * "oldPassword" and "newPassword".  If the old password does not match
     * the current password, a 400 Bad Request is returned.
     */
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(Principal principal, @RequestBody java.util.Map<String, String> payload) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");
        if (oldPassword == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Old and new password are required"));
        }
        try {
            userService.changePassword(user, oldPassword, newPassword);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST).body(java.util.Map.of("error", e.getMessage()));
        }
        return ResponseEntity.ok(java.util.Map.of("message", "Password changed successfully"));
    }
}