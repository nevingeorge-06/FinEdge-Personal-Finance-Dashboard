package com.finedge.backend.controller;

import com.finedge.backend.dto.account.*;
import com.finedge.backend.entity.User;
import com.finedge.backend.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Account REST controller — manages user's financial accounts.
 */
@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    /** GET /api/accounts */
    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(accountService.getAccounts(user.getId()));
    }

    /** POST /api/accounts */
    @PostMapping
    public ResponseEntity<AccountResponse> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AccountRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(accountService.create(user.getId(), request, user));
    }

    /** PUT /api/accounts/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> update(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody AccountRequest request
    ) {
        return ResponseEntity.ok(accountService.update(user.getId(), id, request));
    }

    /** DELETE /api/accounts/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        accountService.delete(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
