package com.finedge.backend.service;

import com.finedge.backend.dto.account.*;
import com.finedge.backend.entity.*;
import com.finedge.backend.exception.ResourceNotFoundException;
import com.finedge.backend.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    @Transactional(readOnly = true)
    public List<AccountResponse> getAccounts(Long userId) {
        return accountRepository.findByUserIdOrderByIsPrimaryDescNameAsc(userId)
                .stream().map(AccountResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public AccountResponse create(Long userId, AccountRequest req, User user) {
        String masked = req.accountNumberMasked();
        if (masked == null || masked.isBlank()) {
            masked = "•••• " + (1000 + (int) (Math.random() * 9000));
        }

        Account account = Account.builder()
                .user(user)
                .name(req.name())
                .type(parseEnum(Account.AccountType.class, req.type(), "type"))
                .balance(req.balance() != null ? req.balance() : BigDecimal.ZERO)
                .currency(req.currency() != null && !req.currency().isBlank() ? req.currency() : "INR")
                .accountNumberMasked(masked)
                .institution(req.institution() != null && !req.institution().isBlank() ? req.institution() : "Direct Holding")
                .isPrimary(req.isPrimary())
                .build();
        return AccountResponse.from(accountRepository.save(account));
    }

    @Transactional
    public AccountResponse update(Long userId, Long accountId, AccountRequest req) {
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountId));

        account.setName(req.name());
        account.setType(parseEnum(Account.AccountType.class, req.type(), "type"));
        if (req.balance() != null) account.setBalance(req.balance());
        if (req.currency() != null) account.setCurrency(req.currency());
        account.setAccountNumberMasked(req.accountNumberMasked());
        account.setInstitution(req.institution());
        account.setPrimary(req.isPrimary());

        return AccountResponse.from(accountRepository.save(account));
    }

    @Transactional
    public void delete(Long userId, Long accountId) {
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountId));
        accountRepository.delete(account);
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value, String field) {
        try {
            return Enum.valueOf(enumClass, value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid " + field + " value: " + value);
        }
    }
}
