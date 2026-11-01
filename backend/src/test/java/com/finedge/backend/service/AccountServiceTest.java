package com.finedge.backend.service;

import com.finedge.backend.dto.account.*;
import com.finedge.backend.entity.*;
import com.finedge.backend.exception.ResourceNotFoundException;
import com.finedge.backend.repository.AccountRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private AccountService accountService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .email("test@example.com")
                .fullName("Test User")
                .password("encoded")
                .build();
        org.springframework.test.util.ReflectionTestUtils.setField(mockUser, "id", 1L);
    }

    @Test
    @DisplayName("create() persists INVESTMENT account with opening balance")
    void create_investmentAccount_withBalance() {
        var req = new AccountRequest(
                "Zerodha Portfolio",
                "INVESTMENT",
                new BigDecimal("50000.00"),
                "INR",
                "•••• 9931",
                "Zerodha Broking",
                false
        );

        when(accountRepository.save(any(Account.class))).thenAnswer(inv -> {
            Account a = inv.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(a, "id", 10L);
            return a;
        });

        AccountResponse res = accountService.create(1L, req, mockUser);

        assertThat(res.id()).isEqualTo("10");
        assertThat(res.name()).isEqualTo("Zerodha Portfolio");
        assertThat(res.type()).isEqualTo("INVESTMENT");
        assertThat(res.balance()).isEqualByComparingTo("50000.00");
        assertThat(res.institution()).isEqualTo("Zerodha Broking");

        verify(accountRepository).save(argThat(a ->
                a.getType() == Account.AccountType.INVESTMENT &&
                a.getBalance().compareTo(new BigDecimal("50000.00")) == 0
        ));
    }

    @Test
    @DisplayName("create() persists CHECKING account with zero or specified balance")
    void create_checkingAccount_success() {
        var req = new AccountRequest(
                "HDFC Checking",
                "CHECKING",
                new BigDecimal("25000.00"),
                "INR",
                "•••• 4892",
                "HDFC Bank",
                true
        );

        when(accountRepository.save(any(Account.class))).thenAnswer(inv -> {
            Account a = inv.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(a, "id", 11L);
            return a;
        });

        AccountResponse res = accountService.create(1L, req, mockUser);

        assertThat(res.id()).isEqualTo("11");
        assertThat(res.type()).isEqualTo("CHECKING");
        assertThat(res.balance()).isEqualByComparingTo("25000.00");
        assertThat(res.isPrimary()).isTrue();
    }

    @Test
    @DisplayName("getAccounts() returns list ordered by primary desc, name asc")
    void getAccounts_success() {
        Account a1 = Account.builder()
                .id(1L)
                .user(mockUser)
                .name("Zerodha")
                .type(Account.AccountType.INVESTMENT)
                .balance(new BigDecimal("75000.00"))
                .currency("INR")
                .isPrimary(false)
                .build();

        when(accountRepository.findByUserIdOrderByIsPrimaryDescNameAsc(1L)).thenReturn(List.of(a1));

        List<AccountResponse> accounts = accountService.getAccounts(1L);

        assertThat(accounts).hasSize(1);
        assertThat(accounts.get(0).balance()).isEqualByComparingTo("75000.00");
    }
}
