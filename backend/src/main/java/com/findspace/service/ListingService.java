package com.findspace.service;

import com.findspace.entity.Listing;
import com.findspace.entity.User;
import com.findspace.repository.ConversationRepository;
import com.findspace.repository.ListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ListingService {

    private final ListingRepository listingRepository;
    private final ConversationRepository conversationRepository;

    @Autowired
    public ListingService(ListingRepository listingRepository,
                          ConversationRepository conversationRepository) {
        this.listingRepository = listingRepository;
        this.conversationRepository = conversationRepository;
    }

    public Listing createListing(String title, String description,
                                 BigDecimal rent, String address, User owner) {
        return listingRepository.save(new Listing(title, description, rent, address, owner));
    }

    /** Returns ALL listings (active and inactive) — controllers filter as needed. */
    public List<Listing> findAll() {
        return listingRepository.findAll();
    }

    public Listing getById(Long id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
    }

    public List<Listing> findByOwner(User owner) {
        return listingRepository.findByOwner(owner);
    }

    /**
     * Delete a listing if the requesting user is the owner.
     * - No conversations → hard delete (listing gone)
     * - Has conversations → soft delete (active = false, listing stays for history)
     *
     * @return true if hard-deleted, false if soft-deleted (deactivated)
     */
    public boolean deleteListing(Long id, User owner) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        if (listing.getOwner() == null || !listing.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("You are not authorized to delete this listing");
        }
        if (conversationRepository.existsByListing(listing)) {
            // Has conversations — soft delete to preserve message history
            listing.setActive(false);
            listingRepository.save(listing);
            return false; // deactivated
        } else {
            listingRepository.delete(listing);
            return true; // hard deleted
        }
    }

    /**
     * Update a listing's fields. Only the owner can edit.
     */
    public Listing updateListing(Long id, User owner, String title,
                                  String description, BigDecimal rent, String address) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        if (listing.getOwner() == null || !listing.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("You are not authorized to edit this listing");
        }
        if (title != null && !title.isBlank())           listing.setTitle(title);
        if (description != null && !description.isBlank()) listing.setDescription(description);
        if (rent != null)                                 listing.setRent(rent);
        if (address != null)                              listing.setAddress(address);
        // Reactivate if editing an inactive listing
        listing.setActive(true);
        return listingRepository.save(listing);
    }
}
