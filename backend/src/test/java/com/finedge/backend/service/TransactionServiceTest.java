package com.finedge.backend.service;

import com.finedge.backend.dto.transaction.*;
import com.finedge.backend.entity.*;
import com.finedge.backend.exception.ResourceNotFoundException;
import com.finedge.backend.repository.TransactionRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock TransactionRepository transactionRepository;
    @InjectMocks TransactionService transactionService;

    private User mockUser;
    private Transaction mockTx;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .email("test@example.com")
                .fullName("Test User")
                .password("encoded")
                .build();
        org.springframework.test.util.ReflectionTestUtils.setField(mockUser, "id", 1L);

        mockTx = Transaction.builder()
                .user(mockUser)
                .description("Salary Credit")
                .amount(new BigDecimal("85000.00"))
                .type(Transaction.TransactionType.INCOME)
                .category("Salary")
                .date(LocalDate.now())
                .paymentMethod("Bank Transfer")
                .account("HDFC Salary")
                .status(Transaction.TransactionStatus.COMPLETED)
                .build();
        org.springframework.test.util.ReflectionTestUtils.setField(mockTx, "id", 100L);
    }

    @Test
    @DisplayName("getById() returns DTO when transaction owned by user")
    void getById_success() {
        when(transactionRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(mockTx));

        TransactionResponse response = transactionService.getById(1L, 100L);

        assertThat(response.description()).isEqualTo("Salary Credit");
        assertThat(response.amount()).isEqualByComparingTo("85000.00");
        assertThat(response.type()).isEqualTo("INCOME");
    }

    @Test
    @DisplayName("getById() throws ResourceNotFoundException when not found")
    void getById_notFound() {
        when(transactionRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.getById(1L, 999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("create() persists transaction and returns DTO")
    void create_success() {
        var req = new TransactionRequest(
                "Netflix Subscription", new BigDecimal("649.00"),
                "EXPENSE", "Entertainment", "2026-10-20",
                "Credit Card", "HDFC Credit", null);

        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> {
            Transaction t = inv.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(t, "id", 200L);
            return t;
        });

        TransactionResponse response = transactionService.create(1L, req, mockUser);

        assertThat(response.id()).isEqualTo("200");
        assertThat(response.description()).isEqualTo("Netflix Subscription");
        assertThat(response.category()).isEqualTo("Entertainment");
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("create() throws on invalid type enum")
    void create_invalidType() {
        var req = new TransactionRequest(
                "Test", new BigDecimal("100.00"), "INVALID_TYPE",
                "Other", "2026-10-20", "Cash", "Cash", null);

        assertThatThrownBy(() -> transactionService.create(1L, req, mockUser))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("type");
    }

    @Test
    @DisplayName("delete() removes transaction owned by user")
    void delete_success() {
        when(transactionRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(mockTx));

        transactionService.delete(1L, 100L);

        verify(transactionRepository).delete(mockTx);
    }

    @Test
    @DisplayName("delete() throws when transaction not owned by user")
    void delete_notOwnedByUser() {
        when(transactionRepository.findByIdAndUserId(100L, 99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.delete(99L, 100L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
