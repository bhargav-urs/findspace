package com.findspace.repository;

import com.findspace.entity.Listing;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingRepository extends JpaRepository<Listing, Long> {

    /**
     * Find all listings owned by the given user.  This allows us to
     * efficiently fetch a user's own listings for display on their profile
     * page and for permission checks when editing or deleting.
     *
     * @param owner the user who created the listings
     * @return list of listings owned by the given user
     */
    java.util.List<Listing> findByOwner(com.findspace.entity.User owner);
}