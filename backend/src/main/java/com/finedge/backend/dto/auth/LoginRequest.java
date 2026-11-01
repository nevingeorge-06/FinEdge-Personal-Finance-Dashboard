package com.finedge.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Login request DTO. */
public record LoginRequest(
        @Email(message = "Valid email required")
        @NotBlank
        String email,

        @NotBlank
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password
) {}
