export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export type TransactionCategory =
  | 'Salary'
  | 'Freelance'
  | 'Investments'
  | 'Housing'
  | 'Food & Dining'
  | 'Groceries'
  | 'Transportation'
  | 'Utilities'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Shopping'
  | 'Personal Care'
  | 'Other';

export type PaymentMethod = 'Bank Transfer' | 'Credit Card' | 'Debit Card' | 'Cash' | 'UPI' | 'Crypto';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // ISO date string (YYYY-MM-DD)
  paymentMethod: PaymentMethod;
  account: string;
  notes?: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt?: string;
}

export interface TransactionFilter {
  searchQuery?: string;
  type?: TransactionType | 'ALL';
  category?: TransactionCategory | 'ALL';
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface NewTransactionPayload {
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  paymentMethod: PaymentMethod;
  account: string;
  notes?: string;
}
