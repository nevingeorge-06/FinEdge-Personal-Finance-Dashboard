package com.finedge.backend.dto.budget;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

/**
 * Budget creation/update request.
 * Matches the frontend NewBudgetPayload interface.
 */
public record BudgetRequest(
        @NotBlank(message = "Category is required")
        @Size(max = 60)
        String category,

        @NotNull(message = "Allocated amount is required")
        @DecimalMin(value = "1.00", message = "Budget must be at least ₹1")
        BigDecimal allocatedAmount,

        @NotBlank(message = "Period is required")
        String period,        // MONTHLY | WEEKLY | YEARLY

        /** Optional month override (defaults to current YYYY-MM). */
        String month,

        @Size(max = 20)
        String color,

        @Min(1) @Max(100)
        Integer alertThresholdPercent
) {}
