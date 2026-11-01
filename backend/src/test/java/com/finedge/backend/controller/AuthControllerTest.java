package com.finedge.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finedge.backend.dto.auth.*;
import com.finedge.backend.service.AuthService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean AuthService authService;
    @MockBean com.finedge.backend.security.JwtUtil jwtUtil;
    @MockBean com.finedge.backend.security.UserDetailsServiceImpl userDetailsService;
    @MockBean AuthenticationManager authenticationManager;

    @Test
    @DisplayName("POST /api/auth/register — 201 Created with token")
    void register_returns201() throws Exception {
        var req  = new RegisterRequest("Ravi Kumar", "ravi@example.com", "password123");
        var resp = new AuthResponse("mock-jwt", "Bearer", 86400L, "ravi@example.com", "Ravi Kumar");

        when(authService.register(any())).thenReturn(resp);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("mock-jwt"))
                .andExpect(jsonPath("$.email").value("ravi@example.com"));
    }

    @Test
    @DisplayName("POST /api/auth/register — 400 on missing email")
    void register_validationFails() throws Exception {
        var req = new RegisterRequest("Ravi Kumar", "not-an-email", "password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    @DisplayName("POST /api/auth/login — 200 OK with token")
    void login_returns200() throws Exception {
        var req  = new LoginRequest("ravi@example.com", "password123");
        var resp = new AuthResponse("mock-jwt", "Bearer", 86400L, "ravi@example.com", "Ravi Kumar");

        when(authService.login(any())).thenReturn(resp);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt"));
    }
}
