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

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Double minRent,
            @RequestParam(required = false) Double maxRent
    ) {
        List<Listing> listings = listingService.findAll();
        Stream<Listing> stream = listings.stream();

        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            stream = stream.filter(l ->
                    (l.getTitle() != null && l.getTitle().toLowerCase().contains(q)) ||
                    (l.getAddress() != null && l.getAddress().toLowerCase().contains(q)) ||
                    (l.getDescription() != null && l.getDescription().toLowerCase().contains(q))
            );
        }
        if (minRent != null) {
            stream = stream.filter(l -> l.getRent().doubleValue() >= minRent);
        }
        if (maxRent != null) {
            stream = stream.filter(l -> l.getRent().doubleValue() <= maxRent);
        }

        List<Map<String, Object>> result = stream.map(this::toMap).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            Listing listing = listingService.getById(id);
            return ResponseEntity.ok(toMap(listing));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Listing not found"));
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload, Principal principal) {
        String title = payload.get("title") != null ? payload.get("title").toString() : null;
        String description = payload.get("description") != null ? payload.get("description").toString() : null;
        Object rentObj = payload.get("rent");
        java.math.BigDecimal rent = null;
        if (rentObj instanceof Number) {
            rent = new java.math.BigDecimal(((Number) rentObj).toString());
        } else if (rentObj != null) {
            try { rent = new java.math.BigDecimal(rentObj.toString()); } catch (NumberFormatException ignored) {}
        }
        String address = payload.get("address") != null ? payload.get("address").toString() : null;

        if (title == null || title.isBlank() || description == null || description.isBlank() || rent == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title, description, and rent are required"));
        }
        User owner = null;
        if (principal != null) {
            owner = userService.findByEmail(principal.getName()).orElse(null);
        }
        Listing created = listingService.createListing(title, description, rent, address, owner);
        return new ResponseEntity<>(toMap(created), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        try {
            listingService.deleteListing(id, user);
            return ResponseEntity.ok(Map.of("message", "Listing deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    // ── Helper to build a consistent response map ────────────────────────────
    private Map<String, Object> toMap(Listing listing) {
        Map<String, Object> map = new HashMap<>();
        map.put("id",          listing.getId());
        map.put("title",       listing.getTitle());
        map.put("description", listing.getDescription());
        map.put("rent",        listing.getRent());
        map.put("address",     listing.getAddress());
        map.put("createdAt",   listing.getCreatedAt());
        if (listing.getOwner() != null) {
            User o = listing.getOwner();
            map.put("ownerId",    o.getId());
            map.put("ownerEmail", o.getEmail());
            // Include the owner's display name (falls back to email prefix)
            map.put("ownerName",  o.getName() != null && !o.getName().isBlank()
                    ? o.getName()
                    : o.getEmail().split("@")[0]);
        }
        return map;
    }
}
