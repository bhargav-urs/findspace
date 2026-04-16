package com.findspace.controller;

import com.findspace.entity.Listing;
import com.findspace.entity.User;
import com.findspace.service.ListingService;
import com.findspace.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller for accessing and updating user profile information.
 *
 * IMPORTANT: We use HashMap instead of Map.of() throughout this controller.
 * Map.of() throws NullPointerException if ANY value is null.
 * New users have name, phone, and about all null — this was causing
 * every call to /api/users/me to crash with a 500 error.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final ListingService listingService;

    @Autowired
    public UserController(UserService userService, ListingService listingService) {
        this.userService = userService;
        this.listingService = listingService;
    }

    /**
     * Get any user's public profile by ID.
     * Returns read-only info — no sensitive data beyond what a tenant/landlord
     * would expect to share on a rental platform.
     * Requires authentication (must be logged in) but no ownership check.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPublicProfile(@PathVariable Long id) {
        User user = userService.findById(id).orElse(null);
        if (user == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "User not found");
            return ResponseEntity.status(404).body(err);
        }
        List<Listing> theirListings = listingService.findByOwner(user);
        List<Map<String, Object>> listingMaps = theirListings.stream().map(l -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id",          l.getId());
            m.put("title",       l.getTitle());
            m.put("description", l.getDescription());
            m.put("rent",        l.getRent());
            m.put("address",     l.getAddress() != null ? l.getAddress() : "");
            m.put("createdAt",   l.getCreatedAt());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("id",        user.getId());
        response.put("email",     user.getEmail());
        response.put("name",      user.getName()  != null ? user.getName()  : "");
        response.put("phone",     user.getPhone() != null ? user.getPhone() : "");
        response.put("about",     user.getAbout() != null ? user.getAbout() : "");
        response.put("createdAt", user.getCreatedAt());
        response.put("role",      user.getRole());
        response.put("listings",  listingMaps);
        return ResponseEntity.ok(response);
    }

    /** Get the current authenticated user's profile + their listings. */
    @GetMapping("/me")
    public ResponseEntity<?> getMe(Principal principal) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(buildUserResponse(user));
    }

    /** Update name, phone, about for the current user. */
    @PutMapping("/me")
    public ResponseEntity<?> updateMe(Principal principal,
                                      @RequestBody Map<String, String> payload) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        User updated = userService.updateProfile(
                user,
                payload.get("name"),
                payload.get("phone"),
                payload.get("about")
        );
        return ResponseEntity.ok(buildUserResponse(updated));
    }

    /** Change password — requires old password verification. */
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(Principal principal,
                                            @RequestBody Map<String, String> payload) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");

        if (oldPassword == null || newPassword == null || newPassword.isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Old and new password are required");
            return ResponseEntity.badRequest().body(err);
        }
        try {
            userService.changePassword(user, oldPassword, newPassword);
        } catch (IllegalArgumentException e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
        Map<String, Object> ok = new HashMap<>();
        ok.put("message", "Password changed successfully");
        return ResponseEntity.ok(ok);
    }

    // ── private helper ───────────────────────────────────────────────────────

    /**
     * Build a safe response map for a User.
     * Uses HashMap (NOT Map.of) so null fields don't cause NullPointerException.
     * Null profile fields are returned as empty strings so the frontend can
     * render them without crashing.
     */
    private Map<String, Object> buildUserResponse(User user) {
        List<Listing> myListings = listingService.findByOwner(user);

        List<Map<String, Object>> listingMaps = myListings.stream().map(l -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id",          l.getId());
            m.put("title",       l.getTitle());
            m.put("description", l.getDescription());
            m.put("rent",        l.getRent());
            m.put("address",     l.getAddress() != null ? l.getAddress() : "");
            m.put("createdAt",   l.getCreatedAt());
            return m;
        }).collect(Collectors.toList());

        // Use HashMap — allows null values unlike Map.of()
        Map<String, Object> response = new HashMap<>();
        response.put("id",        user.getId());
        response.put("email",     user.getEmail());
        response.put("role",      user.getRole());
        response.put("createdAt", user.getCreatedAt());
        // Null-safe: return empty string if profile fields not yet filled in
        response.put("name",      user.getName()  != null ? user.getName()  : "");
        response.put("phone",     user.getPhone() != null ? user.getPhone() : "");
        response.put("about",     user.getAbout() != null ? user.getAbout() : "");
        response.put("listings",  listingMaps);
        return response;
    }
}
