import { CashFlowDataPoint, CategoryExpenseBreakdown, FinancialHealthScore } from '../types/analytics';
import { FinancialSummary, Account } from '../types/account';
import {
  CASH_FLOW_HISTORY,
  CATEGORY_EXPENSE_BREAKDOWN,
  FINANCIAL_HEALTH,
  MOCK_FINANCIAL_SUMMARY,
  MOCK_ACCOUNTS,
} from './mockData';
import { API_CONFIG, apiFetch } from './client';

export interface IAnalyticsService {
  getFinancialSummary(): Promise<FinancialSummary>;
  getAccounts(): Promise<Account[]>;
  getCashFlowHistory(): Promise<CashFlowDataPoint[]>;
  getCategoryExpenses(): Promise<CategoryExpenseBreakdown[]>;
  getFinancialHealth(): Promise<FinancialHealthScore>;
}

export const analyticsService: IAnalyticsService = {
  async getFinancialSummary(): Promise<FinancialSummary> {
    if (!API_CONFIG.useMockData) {
      return apiFetch<FinancialSummary>('/analytics/summary');
    }
    return new Promise((resolve) => setTimeout(() => resolve({ ...MOCK_FINANCIAL_SUMMARY }), 150));
  },

  async getAccounts(): Promise<Account[]> {
    if (!API_CONFIG.useMockData) {
      return apiFetch<Account[]>('/accounts');
    }
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_ACCOUNTS]), 150));
  },

  async getCashFlowHistory(): Promise<CashFlowDataPoint[]> {
    if (!API_CONFIG.useMockData) {
      return apiFetch<CashFlowDataPoint[]>('/analytics/cash-flow');
    }
    return new Promise((resolve) => setTimeout(() => resolve([...CASH_FLOW_HISTORY]), 150));
  },

  async getCategoryExpenses(): Promise<CategoryExpenseBreakdown[]> {
    if (!API_CONFIG.useMockData) {
      return apiFetch<CategoryExpenseBreakdown[]>('/analytics/category-expenses');
    }
    return new Promise((resolve) => setTimeout(() => resolve([...CATEGORY_EXPENSE_BREAKDOWN]), 150));
  },

  async getFinancialHealth(): Promise<FinancialHealthScore> {
    if (!API_CONFIG.useMockData) {
      return apiFetch<FinancialHealthScore>('/analytics/health-score');
    }
    return new Promise((resolve) => setTimeout(() => resolve({ ...FINANCIAL_HEALTH }), 150));
  },
};
