package com.finedge.backend.repository;

import com.finedge.backend.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByUserIdOrderByIsPrimaryDescNameAsc(Long userId);

    Optional<Account> findByIdAndUserId(Long id, Long userId);

    /** Total net balance across all accounts for a user. */
    @Query("""
            SELECT COALESCE(SUM(a.balance), 0)
            FROM Account a
            WHERE a.user.id = :userId
            """)
    BigDecimal sumBalanceByUserId(@Param("userId") Long userId);

    /** Liquid balance (checking + savings + cash only). */
    @Query("""
            SELECT COALESCE(SUM(a.balance), 0)
            FROM Account a
            WHERE a.user.id = :userId
              AND a.type IN ('CHECKING', 'SAVINGS', 'CASH')
            """)
    BigDecimal sumLiquidBalanceByUserId(@Param("userId") Long userId);

    /** Purge all financial accounts owned by a specific user. */
    @Modifying
    @Query("DELETE FROM Account a WHERE a.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
