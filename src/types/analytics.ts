export interface CashFlowDataPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface CategoryExpenseBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  transactionCount: number;
}

export interface DailySpendingDataPoint {
  date: string;
  amount: number;
}

export interface FinancialHealthScore {
  score: number; // 0 - 100
  rating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_ATTENTION';
  insights: string[];
}
