package com.findspace.controller;

import com.findspace.entity.Listing;
import com.findspace.entity.User;
import com.findspace.service.ListingService;
import com.findspace.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    private final ListingService listingService;
    private final UserService userService;

    @Autowired
    public ListingController(ListingService listingService, UserService userService) {
        this.listingService = listingService;
        this.userService = userService;
    }

    /** Public — returns ONLY active listings, supports search/price filters. */
    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Double minRent,
            @RequestParam(required = false) Double maxRent) {

        Stream<Listing> stream = listingService.findAll().stream()
                .filter(Listing::isActive); // public list never shows inactive

        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            stream = stream.filter(l ->
                    (l.getTitle()       != null && l.getTitle().toLowerCase().contains(q)) ||
                    (l.getAddress()     != null && l.getAddress().toLowerCase().contains(q)) ||
                    (l.getDescription() != null && l.getDescription().toLowerCase().contains(q)));
        }
        if (minRent != null) stream = stream.filter(l -> l.getRent().doubleValue() >= minRent);
        if (maxRent != null) stream = stream.filter(l -> l.getRent().doubleValue() <= maxRent);

        return ResponseEntity.ok(stream.map(this::toMap).collect(Collectors.toList()));
    }

    /** Public — returns listing by ID regardless of active status (owner can still see it). */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(toMap(listingService.getById(id)));
        } catch (IllegalArgumentException e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Listing not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }
    }

    /** Authenticated — create a new listing. */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload, Principal principal) {
        String title       = payload.get("title")       != null ? payload.get("title").toString()       : null;
        String description = payload.get("description") != null ? payload.get("description").toString() : null;
        String address     = payload.get("address")     != null ? payload.get("address").toString()     : null;
        BigDecimal rent    = parseBigDecimal(payload.get("rent"));

        if (title == null || title.isBlank() || description == null || description.isBlank() || rent == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Title, description, and rent are required");
            return ResponseEntity.badRequest().body(err);
        }
        User owner = principal != null ? userService.findByEmail(principal.getName()).orElse(null) : null;
        Listing created = listingService.createListing(title, description, rent, address, owner);
        return new ResponseEntity<>(toMap(created), HttpStatus.CREATED);
    }

    /** Authenticated — edit own listing. Editing a deactivated listing reactivates it. */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestBody Map<String, Object> payload,
                                    Principal principal) {
        if (principal == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        String title       = payload.get("title")       != null ? payload.get("title").toString()       : null;
        String description = payload.get("description") != null ? payload.get("description").toString() : null;
        String address     = payload.get("address")     != null ? payload.get("address").toString()     : null;
        BigDecimal rent    = parseBigDecimal(payload.get("rent"));

        try {
            Listing updated = listingService.updateListing(id, user, title, description, rent, address);
            return ResponseEntity.ok(toMap(updated));
        } catch (IllegalArgumentException e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
        }
    }

    /**
     * Authenticated — delete own listing.
     * If listing has conversations → soft-delete (active=false).
     * If no conversations → hard-delete.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        try {
            boolean hardDeleted = listingService.deleteListing(id, user);
            Map<String, Object> result = new HashMap<>();
            if (hardDeleted) {
                result.put("message", "Listing deleted");
                result.put("deleted", true);
            } else {
                result.put("message", "Listing deactivated");
                result.put("deleted", false);
                result.put("deactivated", true);
            }
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
        }
    }

    // ── helpers ─────────────────────────────────────────────────────────────
    private Map<String, Object> toMap(Listing l) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",          l.getId());
        m.put("title",       l.getTitle());
        m.put("description", l.getDescription());
        m.put("rent",        l.getRent());
        m.put("address",     l.getAddress() != null ? l.getAddress() : "");
        m.put("createdAt",   l.getCreatedAt());
        m.put("active",      l.isActive());
        if (l.getOwner() != null) {
            m.put("ownerId",    l.getOwner().getId());
            m.put("ownerEmail", l.getOwner().getEmail());
            m.put("ownerName",  l.getOwner().getName() != null && !l.getOwner().getName().isBlank()
                    ? l.getOwner().getName() : l.getOwner().getEmail().split("@")[0]);
        }
        return m;
    }

    private BigDecimal parseBigDecimal(Object val) {
        if (val == null) return null;
        try { return new BigDecimal(val instanceof Number ? ((Number) val).toString() : val.toString()); }
        catch (NumberFormatException e) { return null; }
    }
}
