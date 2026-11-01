package com.finedge.backend.controller;

import com.finedge.backend.dto.transaction.*;
import com.finedge.backend.entity.User;
import com.finedge.backend.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Transaction REST controller.
 * All endpoints require a valid JWT (enforced by SecurityConfig).
 */
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    /** GET /api/transactions?q=&type=&category=&sortBy=&order=&startDate=&endDate= */
    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getAll(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String order,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        return ResponseEntity.ok(
                transactionService.getAll(user.getId(), q, type, category, sortBy, order, startDate, endDate));
    }

    /** GET /api/transactions/recent — last 5 transactions (used by dashboard) */
    @GetMapping("/recent")
    public ResponseEntity<List<TransactionResponse>> getRecent(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transactionService.getRecent(user.getId()));
    }

    /** GET /api/transactions/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getById(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(transactionService.getById(user.getId(), id));
    }

    /** POST /api/transactions */
    @PostMapping
    public ResponseEntity<TransactionResponse> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TransactionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.create(user.getId(), request, user));
    }

    /** DELETE /api/transactions/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        transactionService.delete(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
