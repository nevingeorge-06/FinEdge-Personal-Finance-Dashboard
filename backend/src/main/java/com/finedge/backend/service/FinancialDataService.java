package com.finedge.backend.service;

import com.finedge.backend.repository.AccountRepository;
import com.finedge.backend.repository.BudgetRepository;
import com.finedge.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service to orchestrate user financial data purge operations.
 * OOP Principle: Single Responsibility — coordinates cascade cleanup while preserving user accounts.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FinancialDataService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final AccountRepository accountRepository;

    /**
     * Safely purges all financial records for the given user in correct dependency order:
     * 1. Transactions (inflows, outflows)
     * 2. Budgets (category allocations, spending targets)
     * 3. Accounts (checking, savings, investment holdings)
     *
     * The User authentication entity and credentials are fully preserved.
     */
    @Transactional
    public void clearUserFinancialData(Long userId) {
        log.info("Starting financial data purge for user ID: {}", userId);

        // 1. Delete all transactions
        transactionRepository.deleteByUserId(userId);

        // 2. Delete all category budget targets
        budgetRepository.deleteByUserId(userId);

        // 3. Delete all financial accounts
        accountRepository.deleteByUserId(userId);

        log.info("Successfully completed financial data purge for user ID: {}", userId);
    }
}
