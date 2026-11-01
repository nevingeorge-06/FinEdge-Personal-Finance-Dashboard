package com.finedge.backend.dto.analytics;

import java.math.BigDecimal;

/** Per-category expense breakdown — matches frontend CategoryExpenseBreakdown. */
public record CategoryExpenseBreakdown(
        String category,
        BigDecimal amount,
        double percentage,
        String color,
        long transactionCount
) {}
