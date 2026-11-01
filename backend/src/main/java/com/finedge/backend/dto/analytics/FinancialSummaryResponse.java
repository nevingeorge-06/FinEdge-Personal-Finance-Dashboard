package com.finedge.backend.dto.analytics;

import java.math.BigDecimal;

/** Financial summary — matches frontend FinancialSummary interface. */
public record FinancialSummaryResponse(
        BigDecimal totalNetWorth,
        BigDecimal totalLiquidBalance,
        BigDecimal totalMonthlyIncome,
        BigDecimal totalMonthlyExpenses,
        BigDecimal monthlySavings,
        double savingsRatePercentage,
        double monthlyIncomeChangePercent,
        double monthlyExpenseChangePercent,
        double netWorthChangePercent
) {}
