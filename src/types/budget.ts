import { TransactionCategory } from './transaction';

export interface Budget {
  id: string;
  category: TransactionCategory;
  allocatedAmount: number;
  spentAmount: number;
  period: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  month: string; // e.g., '2026-10'
  color: string;
  isAlertEnabled: boolean;
  alertThresholdPercent: number; // e.g. 80 (warn at 80% spending)
}

export interface BudgetSummary {
  totalBudgeted: number;
  totalSpent: number;
  remainingBudget: number;
  percentSpent: number;
  overBudgetCategoriesCount: number;
}

export interface NewBudgetPayload {
  category: TransactionCategory;
  allocatedAmount: number;
  period: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  color?: string;
  alertThresholdPercent?: number;
}
