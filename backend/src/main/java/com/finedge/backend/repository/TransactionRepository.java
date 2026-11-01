package com.finedge.backend.repository;

import com.finedge.backend.entity.Transaction;
import com.finedge.backend.entity.Transaction.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Transaction repository with analytics queries.
 * OOP Principle: Abstraction — business queries expressed as named methods.
 */
@Repository
public interface TransactionRepository
        extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    /** Find all transactions for a user, newest first. */
    List<Transaction> findByUserIdOrderByDateDescCreatedAtDesc(Long userId);

    /** Find a transaction by id, scoped to the user (security guard). */
    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    /** Sum of all income transactions in a given month (YYYY-MM). */
    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = 'INCOME'
              AND FUNCTION('DATE_FORMAT', t.date, '%Y-%m') = :month
            """)
    BigDecimal sumIncomeByUserAndMonth(@Param("userId") Long userId, @Param("month") String month);

    /** Sum of all expense transactions in a given month. */
    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = 'EXPENSE'
              AND FUNCTION('DATE_FORMAT', t.date, '%Y-%m') = :month
            """)
    BigDecimal sumExpensesByUserAndMonth(@Param("userId") Long userId, @Param("month") String month);

    /** Sum of expense transactions for a specific category and month (used to calculate budget spending). */
    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = 'EXPENSE'
              AND t.category = :category
              AND FUNCTION('DATE_FORMAT', t.date, '%Y-%m') = :month
            """)
    BigDecimal sumExpensesByUserCategoryAndMonth(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("month") String month
    );

    /** Monthly income/expense aggregates for cash-flow chart (last N months). */
    @Query("""
            SELECT FUNCTION('DATE_FORMAT', t.date, '%Y-%m') AS month,
                   t.type AS type,
                   SUM(t.amount) AS total
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.date >= :since
            GROUP BY FUNCTION('DATE_FORMAT', t.date, '%Y-%m'), t.type
            ORDER BY month ASC
            """)
    List<Object[]> aggregateCashFlowSince(@Param("userId") Long userId, @Param("since") LocalDate since);

    /** Per-category expense breakdown for the given month. */
    @Query("""
            SELECT t.category, SUM(t.amount), COUNT(t)
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = 'EXPENSE'
              AND FUNCTION('DATE_FORMAT', t.date, '%Y-%m') = :month
            GROUP BY t.category
            ORDER BY SUM(t.amount) DESC
            """)
    List<Object[]> categoryExpenseBreakdown(@Param("userId") Long userId, @Param("month") String month);

    /** 5 most recent transactions. */
    List<Transaction> findTop5ByUserIdOrderByDateDescCreatedAtDesc(Long userId);

    /** Sum of a specific type in a date range (used for analytics). */
    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = :type
              AND t.date BETWEEN :from AND :to
            """)
    BigDecimal sumByUserTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    /** Purge all transactions owned by a specific user. */
    @Modifying
    @Query("DELETE FROM Transaction t WHERE t.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
