import { API_CONFIG, apiFetch } from './client';
import { transactionService } from './transactionService';
import { budgetService } from './budgetService';
import { accountService } from './accountService';

export interface IFinancialDataService {
  clearAllFinancialData(): Promise<void>;
}

export const financialDataService: IFinancialDataService = {
  async clearAllFinancialData(): Promise<void> {
    if (!API_CONFIG.useMockData) {
      await apiFetch<void>('/financial-data/clear', {
        method: 'DELETE',
      });
      return;
    }

    // In mock mode, reset all local in-memory stores
    transactionService.clearMockTransactions?.();
    budgetService.clearMockBudgets?.();
    accountService.clearMockAccounts?.();

    return new Promise((resolve) => setTimeout(resolve, 200));
  },
};
