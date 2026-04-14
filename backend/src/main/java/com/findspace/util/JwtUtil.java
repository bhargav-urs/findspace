package com.findspace.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expirationMs}")
    private long jwtExpirationMs;

    /**
     * Parsed SecretKey used for signing and verifying JWTs. The key is derived from the
     * configured {@code jwt.secret} property. This allows us to work with the JJWT
     * 0.12+ API that requires a {@link Key} instance for signing and verification.
     */
    private SecretKey signingKey;

    /**
     * Initialize the signing key once the bean is constructed. We use
     * {@link io.jsonwebtoken.security.Keys#hmacShaKeyFor(byte[])} to generate a
     * proper HMAC key from the configured secret string. This ensures compatibility
     * with the new JJWT builder and parser APIs.
     */
    @PostConstruct
    public void init() {
        // It's important to use the raw bytes of the secret rather than the String itself.
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        this.signingKey = io.jsonwebtoken.security.Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String subject) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiry)
                // Sign using the precomputed SecretKey. When using JJWT >= 0.10, you
                // should not specify the algorithm when providing a key; the library
                // will infer it from the key type.
                .signWith(signingKey)
                .compact();
    }

    /**
     * Retrieve username from JWT token.
     */
    public String getUsernameFromToken(String token) {
        try {
            /*
             * JJWT 0.12 removed the old parseClaimsJws method from the builder.  The new
             * approach is to call parser().verifyWith(key).build().parseSignedClaims(),
             * which returns a Jws<Claims> instance.  We then call getPayload() on the
             * returned Jws to obtain the Claims.  See the official JJWT migration
             * guide for details【522115969881539†L93-L116】.
             */
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return claims.getSubject();
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

    /**
     * Validate token and ensure it belongs to the given user and is not expired.
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            /*
             * Validate the token by parsing it using the new parseSignedClaims method.
             * This verifies the signature using the supplied signingKey.  We then
             * extract the subject and expiration from the payload.  See the code
             * snippet on parsing signed JWTs【522115969881539†L93-L116】.  If any exception
             * occurs, the token is considered invalid.
             */
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            String username = claims.getSubject();
            Date expiration = claims.getExpiration();
            return (username.equals(userDetails.getUsername()) && !expiration.before(new Date()));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}