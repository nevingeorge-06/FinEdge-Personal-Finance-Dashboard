package com.finedge.backend.dto.transaction;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

/**
 * Transaction creation/update request DTO.
 * Matches the frontend NewTransactionPayload interface.
 */
public record TransactionRequest(
        @NotBlank(message = "Description is required")
        @Size(max = 255)
        String description,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        BigDecimal amount,

        @NotBlank(message = "Type is required (INCOME, EXPENSE, TRANSFER)")
        String type,

        @NotBlank(message = "Category is required")
        @Size(max = 60)
        String category,

        @NotNull(message = "Date is required")
        String date,          // YYYY-MM-DD

        @Size(max = 40)
        String paymentMethod,

        @Size(max = 120)
        String account,

        String notes
) {}
