export type AccountType = 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CREDIT_CARD' | 'CASH';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  accountNumberMasked: string;
  institution: string;
  isPrimary: boolean;
}

export interface NewAccountPayload {
  name: string;
  type: AccountType;
  balance?: number;
  openingBalance?: number;
  currency?: string;
  accountNumberMasked?: string;
  institution?: string;
  isPrimary?: boolean;
}

export interface FinancialSummary {
  totalNetWorth: number;
  totalLiquidBalance: number;
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  monthlySavings: number;
  savingsRatePercentage: number;
  monthlyIncomeChangePercent: number;
  monthlyExpenseChangePercent: number;
  netWorthChangePercent: number;
}
