package com.finedge.backend.repository;

import com.finedge.backend.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserIdOrderByCategoryAsc(Long userId);

    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    Optional<Budget> findByUserIdAndCategoryAndMonth(Long userId, String category, String month);

    /** Sum of all allocated amounts for a user in a given month. */
    @Query("""
            SELECT COALESCE(SUM(b.allocatedAmount), 0)
            FROM Budget b
            WHERE b.user.id = :userId AND b.month = :month
            """)
    BigDecimal sumAllocatedByUserAndMonth(@Param("userId") Long userId, @Param("month") String month);

    /** Count budgets over-spent in the given month. */
    @Query("""
            SELECT COUNT(b)
            FROM Budget b
            WHERE b.user.id = :userId
              AND b.month = :month
              AND b.spentAmount > b.allocatedAmount
            """)
    long countOverBudgetByUserAndMonth(@Param("userId") Long userId, @Param("month") String month);

    /** Purge all category budgets owned by a specific user. */
    @Modifying
    @Query("DELETE FROM Budget b WHERE b.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
