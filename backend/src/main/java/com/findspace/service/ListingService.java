package com.findspace.service;

import com.findspace.entity.Listing;
import com.findspace.entity.User;
import com.findspace.repository.ListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ListingService {

    private final ListingRepository listingRepository;

    @Autowired
    public ListingService(ListingRepository listingRepository) {
        this.listingRepository = listingRepository;
    }

    public Listing createListing(String title, String description, BigDecimal rent, String address, User owner) {
        Listing listing = new Listing(title, description, rent, address, owner);
        return listingRepository.save(listing);
    }

    public List<Listing> findAll() {
        return listingRepository.findAll();
    }

    public Listing getById(Long id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
    }

    /**
     * Retrieve all listings owned by the specified user.  This is useful
     * when displaying a user's own listings on their profile page.
     *
     * @param owner the user who created the listings
     * @return list of listings owned by the given user
     */
    public List<Listing> findByOwner(User owner) {
        return listingRepository.findByOwner(owner);
    }

    /**
     * Delete a listing with the given id if the requesting user is the
     * owner of that listing.  If the listing does not exist or is not
     * owned by the user, an IllegalArgumentException will be thrown.
     *
     * @param id the listing ID
     * @param owner the user requesting deletion
     */
    public void deleteListing(Long id, User owner) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        // Only allow deletion if there is an owner and the ids match
        if (listing.getOwner() != null && listing.getOwner().getId().equals(owner.getId())) {
            listingRepository.delete(listing);
        } else {
            throw new IllegalArgumentException("You are not authorized to delete this listing");
        }
    }
}