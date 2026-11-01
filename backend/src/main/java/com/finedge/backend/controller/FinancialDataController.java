package com.finedge.backend.controller;

import com.finedge.backend.entity.User;
import com.finedge.backend.service.FinancialDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for managing user financial data lifecycle.
 */
@RestController
@RequestMapping("/api/financial-data")
@RequiredArgsConstructor
public class FinancialDataController {

    private final FinancialDataService financialDataService;

    /**
     * DELETE /api/financial-data/clear
     * Permanently purges all financial records (transactions, budgets, accounts) for the authenticated user.
     */
    @DeleteMapping({"", "/clear"})
    public ResponseEntity<Map<String, Object>> clearAll(@AuthenticationPrincipal User user) {
        financialDataService.clearUserFinancialData(user.getId());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "All financial records have been successfully purged."
        ));
    }
}
