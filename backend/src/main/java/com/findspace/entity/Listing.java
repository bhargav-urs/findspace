package com.findspace.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "listings")
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private BigDecimal rent;

    @Column
    private String address;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    /**
     * Whether this listing is publicly visible.
     *
     * Uses nullable Boolean (wrapper class, NOT primitive boolean) so that
     * Hibernate's ddl-auto=update can safely ADD this column to an existing
     * populated table.  A primitive 'boolean' with nullable=false makes
     * Hibernate generate:  ALTER TABLE listings ADD COLUMN active boolean NOT NULL
     * which PostgreSQL rejects because existing rows have no value.
     *
     * A nullable column allows existing rows to get NULL, which isActive()
     * treats as true (active).  New listings are set to Boolean.TRUE explicitly.
     */
    @Column(name = "active")
    private Boolean active = Boolean.TRUE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    public Listing() {}

    public Listing(String title, String description, BigDecimal rent, String address, User owner) {
        this.title = title;
        this.description = description;
        this.rent = rent;
        this.address = address;
        this.owner = owner;
        this.active = Boolean.TRUE;
    }

    public Long getId()                     { return id; }
    public void setId(Long id)              { this.id = id; }
    public String getTitle()                { return title; }
    public void setTitle(String t)          { this.title = t; }
    public String getDescription()          { return description; }
    public void setDescription(String d)    { this.description = d; }
    public BigDecimal getRent()             { return rent; }
    public void setRent(BigDecimal r)       { this.rent = r; }
    public String getAddress()              { return address; }
    public void setAddress(String a)        { this.address = a; }
    public Instant getCreatedAt()           { return createdAt; }
    public void setCreatedAt(Instant c)     { this.createdAt = c; }

    /** Null-safe — existing rows without a value are treated as active (true). */
    public boolean isActive()               { return active == null || active; }
    public void setActive(boolean active)   { this.active = active; }

    public User getOwner()                  { return owner; }
    public void setOwner(User owner)        { this.owner = owner; }
}
