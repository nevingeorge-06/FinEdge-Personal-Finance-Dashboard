package com.finedge.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Transaction entity — represents a single financial transaction.
 * OOP Principle: Encapsulation with Lombok-generated accessors.
 */
@Entity
@Table(name = "transactions", indexes = {
        @Index(name = "idx_tx_user_date", columnList = "user_id, date DESC"),
        @Index(name = "idx_tx_type",      columnList = "type"),
        @Index(name = "idx_tx_category",  columnList = "category")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String description;

    @NotNull
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @NotBlank
    @Column(nullable = false, length = 60)
    private String category;

    @NotNull
    @Column(nullable = false)
    private LocalDate date;

    @Column(length = 40)
    private String paymentMethod;

    @Column(length = 120)
    private String account;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.COMPLETED;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TransactionType  { INCOME, EXPENSE, TRANSFER }
    public enum TransactionStatus { COMPLETED, PENDING, FAILED }
}
