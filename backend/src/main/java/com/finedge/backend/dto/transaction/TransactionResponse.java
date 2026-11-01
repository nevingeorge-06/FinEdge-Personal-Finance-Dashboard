package com.finedge.backend.dto.transaction;

import com.finedge.backend.entity.Transaction.TransactionType;
import com.finedge.backend.entity.Transaction.TransactionStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Transaction response DTO — matches the frontend Transaction interface exactly.
 * Field names use camelCase to match TypeScript types.
 */
public record TransactionResponse(
        String id,
        String description,
        BigDecimal amount,
        String type,
        String category,
        String date,
        String paymentMethod,
        String account,
        String notes,
        String status,
        String createdAt
) {
    /** Factory method — converts entity to DTO cleanly. */
    public static TransactionResponse from(com.finedge.backend.entity.Transaction tx) {
        return new TransactionResponse(
                tx.getId().toString(),
                tx.getDescription(),
                tx.getAmount(),
                tx.getType().name(),
                tx.getCategory(),
                tx.getDate().toString(),
                tx.getPaymentMethod(),
                tx.getAccount(),
                tx.getNotes(),
                tx.getStatus().name(),
                tx.getCreatedAt() != null ? tx.getCreatedAt().toString() : null
        );
    }
}
