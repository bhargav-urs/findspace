package com.findspace.config;

import com.findspace.entity.User;
import com.findspace.service.ListingService;
import com.findspace.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

/**
 * Seeds some sample listings into the database on application startup.  This makes it
 * easier to verify that the frontend is correctly fetching data immediately after
 * registration/login.
 */
@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(ListingService listingService, UserService userService) {
        return args -> {
            // Only add sample data if there are no listings already stored.
            if (listingService.findAll().isEmpty()) {
                User owner = userService.findByEmail("admin@example.com").orElse(null);
                listingService.createListing(
                        "Sunny Room in Downtown", 
                        "A bright and spacious room in downtown area near the university.", 
                        new BigDecimal("750"), 
                        "123 Main St, Arlington, TX", 
                        owner);
                listingService.createListing(
                        "Cozy Room Close to Campus", 
                        "Affordable room within walking distance to campus and local amenities.", 
                        new BigDecimal("600"), 
                        "456 College Ave, Arlington, TX", 
                        owner);
                listingService.createListing(
                        "Modern Apartment Share", 
                        "Modern two-bedroom apartment with fully furnished kitchen and living room.", 
                        new BigDecimal("900"), 
                        "789 Maple Lane, Arlington, TX", 
                        owner);
                // Additional sample listings to make the marketplace look vibrant
                listingService.createListing(
                        "Spacious Master Bedroom",
                        "Large master bedroom in a 4-bedroom house with private bathroom and walk-in closet.",
                        new BigDecimal("950"),
                        "1010 Walnut St, Arlington, TX",
                        owner);
                listingService.createListing(
                        "Affordable Shared Room",
                        "Shared room in a friendly household, utilities included. Perfect for students.",
                        new BigDecimal("450"),
                        "2020 Oak Dr, Arlington, TX",
                        owner);
                listingService.createListing(
                        "Studio Apartment with Balcony",
                        "Cozy studio apartment with a balcony overlooking the city skyline.",
                        new BigDecimal("850"),
                        "3030 Pine St, Arlington, TX",
                        owner);
                listingService.createListing(
                        "Luxury Condo Downtown",
                        "High-end condo with modern amenities, gym access, and concierge service.",
                        new BigDecimal("1200"),
                        "4040 Elm St, Arlington, TX",
                        owner);

                // Even more sample listings to showcase variety
                listingService.createListing(
                        "Charming Townhouse Room",
                        "Private room in a charming townhouse with a shared garden.",
                        new BigDecimal("700"),
                        "5050 Birch Rd, Arlington, TX",
                        owner);
                listingService.createListing(
                        "Downtown Loft",
                        "Open-concept loft with high ceilings and lots of natural light.",
                        new BigDecimal("1100"),
                        "6060 Cedar Ln, Arlington, TX",
                        owner);
                listingService.createListing(
                        "Garden Level Studio",
                        "Studio apartment with private entrance and backyard access.",
                        new BigDecimal("650"),
                        "7070 Spruce Ave, Arlington, TX",
                        owner);
            }
        };
    }
}