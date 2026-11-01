package com.finedge.backend.dto.auth;

/** Authentication response returned after login or register. */
public record AuthResponse(
        String token,
        String tokenType,
        Long expiresIn,
        String email,
        String fullName
) {
    public AuthResponse(String token, Long expiresIn, String email, String fullName) {
        this(token, "Bearer", expiresIn, email, fullName);
    }
}
