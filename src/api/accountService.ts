import { Account, NewAccountPayload } from '../types/account';
import { MOCK_ACCOUNTS } from './mockData';
import { API_CONFIG, apiFetch } from './client';

export interface IAccountService {
  getAccounts(): Promise<Account[]>;
  createAccount(payload: NewAccountPayload): Promise<Account>;
  deleteAccount(id: string): Promise<void>;
  clearMockAccounts?(): void;
}

// In-memory accounts for mock fallback
let mockAccountsList: Account[] = [...MOCK_ACCOUNTS];

export const accountService: IAccountService = {
  clearMockAccounts(): void {
    mockAccountsList = [];
  },
  async getAccounts(): Promise<Account[]> {
    if (!API_CONFIG.useMockData) {
      return apiFetch<Account[]>('/accounts');
    }
    return new Promise((resolve) => setTimeout(() => resolve([...mockAccountsList]), 150));
  },

  async createAccount(payload: NewAccountPayload): Promise<Account> {
    const balance = payload.balance ?? payload.openingBalance ?? 0;
    const bodyPayload = {
      name: payload.name,
      type: payload.type,
      balance,
      openingBalance: balance,
      currency: payload.currency || 'INR',
      accountNumberMasked: payload.accountNumberMasked || `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
      institution: payload.institution || 'Direct Holding',
      isPrimary: Boolean(payload.isPrimary),
    };

    if (!API_CONFIG.useMockData) {
      return apiFetch<Account>('/accounts', {
        method: 'POST',
        body: JSON.stringify(bodyPayload),
      });
    }

    const newAcc: Account = {
      id: `acc-${Date.now()}`,
      name: bodyPayload.name,
      type: bodyPayload.type,
      balance: bodyPayload.balance,
      currency: bodyPayload.currency,
      accountNumberMasked: bodyPayload.accountNumberMasked,
      institution: bodyPayload.institution,
      isPrimary: bodyPayload.isPrimary,
    };
    mockAccountsList.push(newAcc);
    return new Promise((resolve) => setTimeout(() => resolve(newAcc), 150));
  },

  async deleteAccount(id: string): Promise<void> {
    if (!API_CONFIG.useMockData) {
      return apiFetch<void>(`/accounts/${id}`, { method: 'DELETE' });
    }
    mockAccountsList = mockAccountsList.filter((a) => a.id !== id);
    return new Promise((resolve) => setTimeout(resolve, 150));
  },
};
