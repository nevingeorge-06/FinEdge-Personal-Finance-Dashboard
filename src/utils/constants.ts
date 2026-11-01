import { TransactionCategory, PaymentMethod } from '../types/transaction';

export const INCOME_CATEGORIES: TransactionCategory[] = [
  'Salary',
  'Freelance',
  'Investments',
];

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'Housing',
  'Food & Dining',
  'Groceries',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Shopping',
  'Personal Care',
  'Other',
];

export const CATEGORIES: TransactionCategory[] = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'Cash',
];

export const APP_METADATA = {
  name: 'FinEdge',
  tagline: 'Smarter Spending, Better Living',
  version: '2.4.0',
};
