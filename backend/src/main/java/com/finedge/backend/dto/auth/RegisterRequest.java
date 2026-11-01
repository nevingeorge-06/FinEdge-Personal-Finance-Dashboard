package com.finedge.backend.dto.auth;

import jakarta.validation.constraints.*;

/** Registration request DTO. */
public record RegisterRequest(
        @NotBlank
        @Size(min = 2, max = 80, message = "Full name must be 2–80 characters")
        String fullName,

        @Email(message = "Valid email required")
        @NotBlank
        String email,

        @NotBlank
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password
) {}
