package com.finedge.backend.service;

import com.finedge.backend.repository.AccountRepository;
import com.finedge.backend.repository.BudgetRepository;
import com.finedge.backend.repository.TransactionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinancialDataServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private FinancialDataService financialDataService;

    @Test
    @DisplayName("clearUserFinancialData() deletes transactions, budgets, and accounts in correct order")
    void clearUserFinancialData_success() {
        Long userId = 42L;

        financialDataService.clearUserFinancialData(userId);

        InOrder inOrder = inOrder(transactionRepository, budgetRepository, accountRepository);
        inOrder.verify(transactionRepository).deleteByUserId(userId);
        inOrder.verify(budgetRepository).deleteByUserId(userId);
        inOrder.verify(accountRepository).deleteByUserId(userId);

        verifyNoMoreInteractions(transactionRepository, budgetRepository, accountRepository);
    }
}
