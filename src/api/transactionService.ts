import { Transaction, TransactionFilter, NewTransactionPayload } from '../types/transaction';
import { INITIAL_TRANSACTIONS } from './mockData';
import { API_CONFIG, apiFetch } from './client';

// Local in-memory state for mock mode
let mockTransactionsStore: Transaction[] = [...INITIAL_TRANSACTIONS];

export interface ITransactionService {
  getAllTransactions(filter?: TransactionFilter): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | undefined>;
  createTransaction(payload: NewTransactionPayload): Promise<Transaction>;
  deleteTransaction(id: string): Promise<boolean>;
  clearMockTransactions?(): void;
}

export const transactionService: ITransactionService = {
  clearMockTransactions(): void {
    mockTransactionsStore = [];
  },
  async getAllTransactions(filter?: TransactionFilter): Promise<Transaction[]> {
    if (!API_CONFIG.useMockData) {
      // Prepared for backend endpoint: GET /api/transactions
      const queryParams = new URLSearchParams();
      if (filter?.searchQuery) queryParams.set('q', filter.searchQuery);
      if (filter?.type && filter.type !== 'ALL') queryParams.set('type', filter.type);
      if (filter?.category && filter.category !== 'ALL') queryParams.set('category', filter.category);
      if (filter?.sortBy) queryParams.set('sortBy', filter.sortBy);
      if (filter?.sortOrder) queryParams.set('order', filter.sortOrder);

      const qs = queryParams.toString();
      return apiFetch<Transaction[]>(`/transactions${qs ? `?${qs}` : ''}`);
    }

    // Mock Mode Implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...mockTransactionsStore];

        if (filter) {
          if (filter.searchQuery) {
            const q = filter.searchQuery.toLowerCase();
            results = results.filter(
              (tx) =>
                tx.description.toLowerCase().includes(q) ||
                tx.category.toLowerCase().includes(q) ||
                tx.account.toLowerCase().includes(q)
            );
          }

          if (filter.type && filter.type !== 'ALL') {
            results = results.filter((tx) => tx.type === filter.type);
          }

          if (filter.category && filter.category !== 'ALL') {
            results = results.filter((tx) => tx.category === filter.category);
          }

          if (filter.startDate) {
            results = results.filter((tx) => tx.date >= filter.startDate!);
          }

          if (filter.endDate) {
            results = results.filter((tx) => tx.date <= filter.endDate!);
          }

          if (filter.sortBy === 'amount') {
            results.sort((a, b) =>
              filter.sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
            );
          } else {
            // Default sort by date desc
            results.sort((a, b) =>
              filter.sortOrder === 'asc'
                ? new Date(a.date).getTime() - new Date(b.date).getTime()
                : new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          }
        }

        resolve(results);
      }, 150);
    });
  },

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    if (!API_CONFIG.useMockData) {
      return apiFetch<Transaction>(`/transactions/${id}`);
    }
    return mockTransactionsStore.find((t) => t.id === id);
  },

  async createTransaction(payload: NewTransactionPayload): Promise<Transaction> {
    if (!API_CONFIG.useMockData) {
      // Backend endpoint: POST /api/transactions
      return apiFetch<Transaction>('/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    // Mock Mode Implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTx: Transaction = {
          ...payload,
          id: `tx-${Date.now()}`,
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
        };
        mockTransactionsStore = [newTx, ...mockTransactionsStore];
        resolve(newTx);
      }, 200);
    });
  },

  async deleteTransaction(id: string): Promise<boolean> {
    if (!API_CONFIG.useMockData) {
      await apiFetch<void>(`/transactions/${id}`, { method: 'DELETE' });
      return true;
    }

    return new Promise((resolve) => {
      mockTransactionsStore = mockTransactionsStore.filter((t) => t.id !== id);
      resolve(true);
    });
  },
};
