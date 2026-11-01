package com.finedge.backend.dto.budget;

import com.finedge.backend.entity.Budget;
import java.math.BigDecimal;

/** Budget response DTO — matches frontend Budget interface. */
public record BudgetResponse(
        String id,
        String category,
        BigDecimal allocatedAmount,
        BigDecimal spentAmount,
        String period,
        String month,
        String color,
        boolean isAlertEnabled,
        int alertThresholdPercent
) {
    public static BudgetResponse from(Budget b) {
        return new BudgetResponse(
                b.getId().toString(),
                b.getCategory(),
                b.getAllocatedAmount(),
                b.getSpentAmount(),
                b.getPeriod().name(),
                b.getMonth(),
                b.getColor(),
                b.isAlertEnabled(),
                b.getAlertThresholdPercent()
        );
    }
}
