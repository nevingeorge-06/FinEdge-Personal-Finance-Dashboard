package com.finedge.backend.dto.budget;

import java.math.BigDecimal;

/** Budget summary DTO — matches frontend BudgetSummary interface. */
public record BudgetSummaryResponse(
        BigDecimal totalBudgeted,
        BigDecimal totalSpent,
        BigDecimal remainingBudget,
        double percentSpent,
        long overBudgetCategoriesCount
) {}
