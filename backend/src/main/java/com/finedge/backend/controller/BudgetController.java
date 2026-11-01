package com.finedge.backend.controller;

import com.finedge.backend.dto.budget.*;
import com.finedge.backend.entity.User;
import com.finedge.backend.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Budget REST controller — CRUD + summary endpoint.
 */
@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    /** GET /api/budgets */
    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(budgetService.getBudgets(user.getId()));
    }

    /** GET /api/budgets/summary */
    @GetMapping("/summary")
    public ResponseEntity<BudgetSummaryResponse> getSummary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(budgetService.getSummary(user.getId()));
    }

    /** POST /api/budgets */
    @PostMapping
    public ResponseEntity<BudgetResponse> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BudgetRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(budgetService.create(user.getId(), request, user));
    }

    /** PUT /api/budgets/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> update(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request
    ) {
        return ResponseEntity.ok(budgetService.update(user.getId(), id, request));
    }

    /** DELETE /api/budgets/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        budgetService.delete(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
