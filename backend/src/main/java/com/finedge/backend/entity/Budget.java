package com.finedge.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Budget entity — a per-category spending limit for a given period.
 */
@Entity
@Table(name = "budgets", indexes = {
        @Index(name = "idx_budget_user", columnList = "user_id"),
        @Index(name = "idx_budget_category", columnList = "category, month")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(nullable = false, length = 60)
    private String category;

    @NotNull
    @DecimalMin(value = "1.00", message = "Budget must be at least ₹1")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal allocatedAmount;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal spentAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BudgetPeriod period = BudgetPeriod.MONTHLY;

    /** Format: YYYY-MM, e.g. "2026-10" */
    @NotBlank
    @Pattern(regexp = "\\d{4}-\\d{2}", message = "Month must be in YYYY-MM format")
    @Column(nullable = false, length = 7)
    private String month;

    @Column(length = 20)
    @Builder.Default
    private String color = "#14B8A6";

    @Column(nullable = false)
    @Builder.Default
    private boolean isAlertEnabled = true;

    @Min(1) @Max(100)
    @Column(nullable = false)
    @Builder.Default
    private int alertThresholdPercent = 80;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum BudgetPeriod { MONTHLY, WEEKLY, YEARLY }
}
