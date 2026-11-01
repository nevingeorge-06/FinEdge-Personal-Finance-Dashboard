package com.finedge.backend.controller;

import com.finedge.backend.dto.analytics.*;
import com.finedge.backend.entity.User;
import com.finedge.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Analytics controller — derived insights from transaction data.
 */
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /** GET /api/analytics/summary */
    @GetMapping("/summary")
    public ResponseEntity<FinancialSummaryResponse> getSummary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(analyticsService.getFinancialSummary(user.getId()));
    }

    /** GET /api/analytics/cash-flow */
    @GetMapping("/cash-flow")
    public ResponseEntity<List<CashFlowDataPoint>> getCashFlow(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(analyticsService.getCashFlowHistory(user.getId()));
    }

    /** GET /api/analytics/category-expenses */
    @GetMapping("/category-expenses")
    public ResponseEntity<List<CategoryExpenseBreakdown>> getCategoryExpenses(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(analyticsService.getCategoryExpenses(user.getId()));
    }

    /** GET /api/analytics/health-score */
    @GetMapping("/health-score")
    public ResponseEntity<FinancialHealthScore> getHealthScore(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(analyticsService.getHealthScore(user.getId()));
    }
}
