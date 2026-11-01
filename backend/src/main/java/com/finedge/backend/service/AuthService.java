package com.finedge.backend.service;

import com.finedge.backend.dto.auth.*;
import com.finedge.backend.entity.User;
import com.finedge.backend.repository.UserRepository;
import com.finedge.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication service — handles registration and login.
 * OOP Principle: Encapsulation — auth logic isolated from controllers.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    @Value("${finedge.jwt.expiration-ms}")
    private long expirationMs;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email is already registered: " + req.email());
        }

        User user = User.builder()
                .fullName(req.fullName())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .role(User.Role.USER)
                .build();

        userRepository.save(user);
        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, expirationMs / 1000, user.getEmail(), user.getFullName());
    }

    public AuthResponse login(LoginRequest req) {
        // Throws BadCredentialsException if invalid — caught by GlobalExceptionHandler
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));

        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalStateException("User disappeared after authentication"));
        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, expirationMs / 1000, user.getEmail(), user.getFullName());
    }
}
