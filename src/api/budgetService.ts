import { Budget, BudgetSummary, NewBudgetPayload } from '../types/budget';
import { INITIAL_BUDGETS } from './mockData';
import { API_CONFIG, apiFetch } from './client';
import { getCategoryColor } from '../utils/formatters';

let mockBudgetsStore: Budget[] = [...INITIAL_BUDGETS];

export interface IBudgetService {
  getBudgets(): Promise<Budget[]>;
  getBudgetSummary(): Promise<BudgetSummary>;
  createBudget(payload: NewBudgetPayload): Promise<Budget>;
  deleteBudget(id: string): Promise<boolean>;
  updateSpentAmount(categoryId: string, deltaAmount: number): Promise<void>;
  clearMockBudgets?(): void;
}

export const budgetService: IBudgetService = {
  clearMockBudgets(): void {
    mockBudgetsStore = [];
  },
  async getBudgets(): Promise<Budget[]> {
    if (!API_CONFIG.useMockData) {
      return apiFetch<Budget[]>('/budgets');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockBudgetsStore]);
      }, 150);
    });
  },

  async getBudgetSummary(): Promise<BudgetSummary> {
    const budgets = await this.getBudgets();
    const totalBudgeted = budgets.reduce((acc, b) => acc + b.allocatedAmount, 0);
    const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);
    const remainingBudget = Math.max(0, totalBudgeted - totalSpent);
    const percentSpent = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
    const overBudgetCategoriesCount = budgets.filter((b) => b.spentAmount > b.allocatedAmount).length;

    return {
      totalBudgeted,
      totalSpent,
      remainingBudget,
      percentSpent,
      overBudgetCategoriesCount,
    };
  },

  async createBudget(payload: NewBudgetPayload): Promise<Budget> {
    if (!API_CONFIG.useMockData) {
      return apiFetch<Budget>('/budgets', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const newBudget: Budget = {
          id: `b-${Date.now()}`,
          category: payload.category,
          allocatedAmount: payload.allocatedAmount,
          spentAmount: 0,
          period: payload.period || 'MONTHLY',
          month: '2026-10',
          color: payload.color || getCategoryColor(payload.category),
          isAlertEnabled: true,
          alertThresholdPercent: payload.alertThresholdPercent || 80,
        };

        mockBudgetsStore = [...mockBudgetsStore, newBudget];
        resolve(newBudget);
      }, 200);
    });
  },

  async deleteBudget(id: string): Promise<boolean> {
    if (!API_CONFIG.useMockData) {
      await apiFetch<void>(`/budgets/${id}`, { method: 'DELETE' });
      return true;
    }

    return new Promise((resolve) => {
      mockBudgetsStore = mockBudgetsStore.filter((b) => b.id !== id);
      resolve(true);
    });
  },

  async updateSpentAmount(category: string, deltaAmount: number): Promise<void> {
    const budget = mockBudgetsStore.find((b) => b.category === category);
    if (budget) {
      budget.spentAmount = Math.max(0, budget.spentAmount + deltaAmount);
    }
  },
};
