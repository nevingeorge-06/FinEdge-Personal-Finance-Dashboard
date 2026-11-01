package com.finedge.backend.service;

import com.finedge.backend.dto.auth.*;
import com.finedge.backend.entity.User;
import com.finedge.backend.repository.UserRepository;
import com.finedge.backend.security.JwtUtil;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock JwtUtil jwtUtil;
    @Mock AuthenticationManager authManager;

    @InjectMocks AuthService authService;

    private final PasswordEncoder encoder = new BCryptPasswordEncoder(4);

    @BeforeEach
    void setUp() {
        // Inject password encoder via reflection (it's @Value injected field workaround)
        org.springframework.test.util.ReflectionTestUtils.setField(authService, "passwordEncoder", encoder);
        org.springframework.test.util.ReflectionTestUtils.setField(authService, "expirationMs", 86400000L);
    }

    @Test
    @DisplayName("register() creates user and returns JWT")
    void register_success() {
        var req = new RegisterRequest("Ravi Kumar", "ravi@example.com", "password123");
        when(userRepository.existsByEmail("ravi@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(u, "id", 1L);
            return u;
        });
        when(jwtUtil.generateToken(any(User.class))).thenReturn("mock-jwt-token");

        AuthResponse response = authService.register(req);

        assertThat(response.token()).isEqualTo("mock-jwt-token");
        assertThat(response.email()).isEqualTo("ravi@example.com");
        assertThat(response.fullName()).isEqualTo("Ravi Kumar");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("register() throws when email already exists")
    void register_duplicateEmail() {
        var req = new RegisterRequest("Priya S", "priya@example.com", "password123");
        when(userRepository.existsByEmail("priya@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already registered");
    }

    @Test
    @DisplayName("login() returns JWT on valid credentials")
    void login_success() {
        var req = new LoginRequest("ravi@example.com", "password123");
        User user = User.builder().email("ravi@example.com").fullName("Ravi Kumar")
                .password(encoder.encode("password123")).build();

        when(userRepository.findByEmail("ravi@example.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(user)).thenReturn("mock-jwt-token");

        AuthResponse response = authService.login(req);

        assertThat(response.token()).isEqualTo("mock-jwt-token");
        verify(authManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
}
