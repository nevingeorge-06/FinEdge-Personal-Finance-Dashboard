import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { CashFlowChart } from './components/dashboard/CashFlowChart';
import { CategoryExpenses } from './components/dashboard/CategoryExpenses';
import { BudgetProgress } from './components/dashboard/BudgetProgress';
import { RecentTransactions } from './components/dashboard/RecentTransactions';
import { TransactionTable } from './components/transactions/TransactionTable';
import { TransactionFilters } from './components/transactions/TransactionFilters';
import { AddTransactionModal } from './components/transactions/AddTransactionModal';
import { BudgetOverview } from './components/budgets/BudgetOverview';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { AccountsView } from './components/accounts/AccountsView';
import { SettingsView } from './components/settings/SettingsView';

import {
  Transaction,
  TransactionType,
  TransactionCategory,
  NewTransactionPayload,
} from './types/transaction';
import { Budget, NewBudgetPayload } from './types/budget';
import { Account, FinancialSummary, NewAccountPayload } from './types/account';
import { CashFlowDataPoint, CategoryExpenseBreakdown, FinancialHealthScore } from './types/analytics';
import { AppNotification } from './types/notification';

import { transactionService } from './api/transactionService';
import { budgetService } from './api/budgetService';
import { analyticsService } from './api/analyticsService';
import { accountService } from './api/accountService';
import { API_CONFIG } from './api/client';
import { financialDataService } from './api/financialDataService';
import { authService } from './api/authService';
import { MOCK_ACCOUNTS } from './api/mockData';
import { User } from './types/auth';
import { AuthPage } from './components/auth/AuthPage';
import { getCategoryColor } from './utils/formatters';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCachedUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [financialHealth, setFinancialHealth] = useState<FinancialHealthScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataCleared, setIsDataCleared] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => new Set());

  // Transaction Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Trigger brief toast alert
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auth Handlers
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.fullName}!`);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setTransactions([]);
    setBudgets([]);
    setAccounts([]);
    setFinancialHealth(null);
    showToast('Signed out successfully');
  };

  // Validate session on mount
  useEffect(() => {
    const verifySession = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    };
    verifySession();
  }, []);

  // Initial Data Fetch when authenticated
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [txs, bgs, accs, fh] = await Promise.all([
          transactionService.getAllTransactions(),
          budgetService.getBudgets(),
          accountService.getAccounts(),
          analyticsService.getFinancialHealth(),
        ]);
        setTransactions(txs);
        setBudgets(bgs);
        setAccounts(accs);
        setFinancialHealth(fh);
      } catch (err: unknown) {
        console.error('Failed to load financial data:', err);
        if (err instanceof Error && err.message.includes('Session expired')) {
          handleLogout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [currentUser]);

  // Dynamically compute Account Balances based on registered accounts and transaction history
  const dynamicAccounts: Account[] = useMemo(() => {
    if (isDataCleared) return [];

    // Determine whether accounts come from the backend (real persisted data)
    // or from mock/fallback. Mock accounts are structural templates whose
    // hardcoded balances must NOT be used — balance should be derived purely
    // from transactions. Backend-persisted accounts retain their real opening
    // balance (stored in the DB).
    const isBackendMode = !API_CONFIG.useMockData;

    const baseAccounts: Account[] = accounts.length > 0
      ? (isBackendMode
          ? accounts  // real backend data – keep persisted opening balances
          : accounts.map((a) => ({ ...a, balance: 0 })))  // mock data – zero all balances
      : (transactions.length > 0
          ? MOCK_ACCOUNTS.map((a) => ({ ...a, balance: 0 }))  // fallback templates – zero all
          : []);

    const computed = baseAccounts.map((acc) => {
      const accountTxns = transactions.filter(
        (t) => t.account && t.account.trim().toLowerCase() === acc.name.trim().toLowerCase()
      );

      let netFromTx = 0;
      if (acc.type === 'INVESTMENT') {
        const income = accountTxns.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
        // Investment additions (purchases / SIPs) allocated specifically to this investment account
        const investmentAdditions = accountTxns
          .filter((t) => t.type === 'EXPENSE' && t.category === 'Investments')
          .reduce((s, t) => s + t.amount, 0);
        // Withdrawals or fees reduce portfolio
        const withdrawalsAndFees = accountTxns
          .filter((t) => t.type === 'EXPENSE' && t.category !== 'Investments')
          .reduce((s, t) => s + t.amount, 0);

        netFromTx = income + investmentAdditions - withdrawalsAndFees;
      } else {
        const income = accountTxns.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
        const expenses = accountTxns.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
        netFromTx = income - expenses;
      }

      const baseBal = typeof acc.balance === 'number' ? acc.balance : parseFloat(String(acc.balance || 0)) || 0;
      return { ...acc, balance: baseBal + netFromTx };
    });

    // Check if there are transactions associated with account names not present in baseAccounts
    const knownNames = new Set(baseAccounts.map((a) => a.name.trim().toLowerCase()));
    const extraNames = Array.from(
      new Set(
        transactions
          .map((t) => t.account)
          .filter((name): name is string => Boolean(name && name.trim() && !knownNames.has(name.trim().toLowerCase())))
      )
    );

    for (const name of extraNames) {
      const accountTxns = transactions.filter(
        (t) => t.account && t.account.trim().toLowerCase() === name.trim().toLowerCase()
      );
      const lower = name.toLowerCase();
      const type: Account['type'] = lower.includes('cash')
        ? 'CASH'
        : lower.includes('invest') || lower.includes('zerodha') || lower.includes('demat') || lower.includes('stock')
        ? 'INVESTMENT'
        : lower.includes('saving')
        ? 'SAVINGS'
        : 'CHECKING';

      let balance = 0;
      if (type === 'INVESTMENT') {
        const income = accountTxns.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
        const investmentAdditions = accountTxns
          .filter((t) => t.type === 'EXPENSE' && t.category === 'Investments')
          .reduce((s, t) => s + t.amount, 0);
        const otherExpenses = accountTxns
          .filter((t) => t.type === 'EXPENSE' && t.category !== 'Investments')
          .reduce((s, t) => s + t.amount, 0);
        balance = income + investmentAdditions - otherExpenses;
      } else {
        const income = accountTxns.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
        const expenses = accountTxns.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
        balance = income - expenses;
      }

      computed.push({
        id: `acc-custom-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name,
        type,
        balance,
        currency: 'INR',
        accountNumberMasked: '•••• ' + (Math.abs(name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 1000) % 9000) + 1000),
        institution: name.includes('(') ? name.slice(name.indexOf('(') + 1, name.indexOf(')')) : 'Direct Holding',
        isPrimary: false,
      });
    }

    return computed;
  }, [accounts, transactions, isDataCleared]);

  // Dynamically compute Financial Summary based on transactions
  const summary: FinancialSummary = useMemo(() => {
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // e.g. '2026-10'

    // Only count transactions for the CURRENT MONTH
    const currentMonthTxns = transactions.filter((t) => t.date && t.date.startsWith(currentMonthPrefix));

    const monthlyIncome = currentMonthTxns
      .filter((t) => t.type === 'INCOME')
      .reduce((acc, t) => acc + t.amount, 0);

    const monthlyExpenses = currentMonthTxns
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0);

    const savings = Math.max(0, monthlyIncome - monthlyExpenses);
    const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

    // All-time transaction net balance
    const allTimeIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((acc, t) => acc + t.amount, 0);
    const allTimeExpenses = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0);
    const netTransactionsBalance = allTimeIncome - allTimeExpenses;

    const totalAccountsBalance = dynamicAccounts.reduce((acc, a) => acc + a.balance, 0);
    const unassignedTxns = transactions.filter((t) => !t.account || !t.account.trim());
    const unassignedNet = unassignedTxns
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0) -
      unassignedTxns
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalNetWorth = totalAccountsBalance + unassignedNet;

    const totalLiquid = dynamicAccounts.length > 0
      ? dynamicAccounts
          .filter((a) => a.type === 'CHECKING' || a.type === 'SAVINGS' || a.type === 'CASH')
          .reduce((acc, a) => acc + a.balance, 0) + (unassignedNet > 0 ? unassignedNet : 0)
      : Math.max(0, netTransactionsBalance);

    return {
      totalNetWorth,
      totalLiquidBalance: totalLiquid,
      totalMonthlyIncome: monthlyIncome,
      totalMonthlyExpenses: monthlyExpenses,
      monthlySavings: savings,
      savingsRatePercentage: savingsRate,
      monthlyIncomeChangePercent: monthlyIncome > 0 ? 8.5 : 0,
      monthlyExpenseChangePercent: monthlyExpenses > 0 ? -4.2 : 0,
      netWorthChangePercent: 12.3,
    };
  }, [transactions, dynamicAccounts]);

  // Dynamically compute active Expense Budgets (calculate spent strictly from expense transactions)
  const activeBudgets: Budget[] = useMemo(() => {
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Filter out income categories (Salary, Freelance, Investments) from expense budgets
    const expenseOnlyBudgets = budgets.filter(
      (b) => b.category !== 'Salary' && b.category !== 'Freelance' && b.category !== 'Investments'
    );

    return expenseOnlyBudgets.map((b) => {
      const monthPrefix = b.month || currentMonthPrefix;
      const spent = transactions
        .filter((t) => t.type === 'EXPENSE' && t.category === b.category && t.date && t.date.startsWith(monthPrefix))
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...b,
        spentAmount: spent,
      };
    });
  }, [budgets, transactions]);

  // Dynamically compute real Application Notifications from live budget and transaction data
  const notifications: AppNotification[] = useMemo(() => {
    if (isDataCleared) return [];

    const list: AppNotification[] = [];

    // 1. Budget Alerts: Limit exceeded or approaching warning threshold
    for (const b of activeBudgets) {
      const threshold = b.alertThresholdPercent || 80;
      const spent = b.spentAmount;
      const allocated = b.allocatedAmount;

      if (allocated > 0 && spent > allocated) {
        const id = `budget-exceeded-${b.id || b.category}`;
        list.push({
          id,
          type: 'ALERT',
          title: `${b.category} Budget Exceeded`,
          message: `Spending reached ₹${spent.toLocaleString('en-IN')} (limit ₹${allocated.toLocaleString('en-IN')}) — exceeded by ${Math.round(((spent - allocated) / allocated) * 100)}%.`,
          timestamp: 'Current billing cycle',
          read: readNotificationIds.has(id),
          linkTab: 'budgets',
        });
      } else if (allocated > 0 && spent >= allocated * (threshold / 100)) {
        const id = `budget-warn-${b.id || b.category}`;
        list.push({
          id,
          type: 'WARNING',
          title: `${b.category} Budget Alert`,
          message: `You've utilized ${Math.round((spent / allocated) * 100)}% of your ₹${allocated.toLocaleString('en-IN')} monthly limit.`,
          timestamp: 'Current billing cycle',
          read: readNotificationIds.has(id),
          linkTab: 'budgets',
        });
      }
    }

    // 2. High-Value Transaction Flag (>= ₹10,000)
    const highValueTx = transactions.find((t) => t.type === 'EXPENSE' && t.amount >= 10000);
    if (highValueTx) {
      const id = `tx-high-${highValueTx.id}`;
      list.push({
        id,
        type: 'INFO',
        title: 'Large Outflow Flagged',
        message: `₹${highValueTx.amount.toLocaleString('en-IN')} was debited for "${highValueTx.description}".`,
        timestamp: highValueTx.date,
        read: readNotificationIds.has(id),
        linkTab: 'transactions',
      });
    }

    // 3. Healthy Savings Milestone
    if (summary.totalMonthlyIncome > 0 && summary.savingsRatePercentage >= 20) {
      const id = `savings-milestone-${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
      list.push({
        id,
        type: 'SUCCESS',
        title: 'Strong Savings Milestone',
        message: `Your monthly savings rate is ${summary.savingsRatePercentage.toFixed(1)}% (₹${summary.monthlySavings.toLocaleString('en-IN')} saved).`,
        timestamp: 'This month',
        read: readNotificationIds.has(id),
        linkTab: 'analytics',
      });
    }

    return list;
  }, [activeBudgets, transactions, summary, isDataCleared, readNotificationIds]);

  // Dynamically compute 6-Month Cash Flow History from transactions
  const dynamicCashFlowHistory: CashFlowDataPoint[] = useMemo(() => {
    const result: CashFlowDataPoint[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      // Use middle of month (15th) to avoid edge-of-month UTC timezone shifts
      const d = new Date(now.getFullYear(), now.getMonth() - i, 15);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`; // e.g. '2026-10'
      const monthLabel = d.toLocaleString('default', { month: 'short' });

      const monthTxns = transactions.filter((t) => t.date && t.date.startsWith(monthKey));
      const income = monthTxns
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthTxns
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

      result.push({
        month: monthLabel,
        income,
        expenses,
        savings: Math.max(0, income - expenses),
      });
    }

    return result;
  }, [transactions]);

  // Dynamically compute Category Expense Breakdown based on transactions
  const categoryExpenses: CategoryExpenseBreakdown[] = useMemo(() => {
    const expenseTxns = transactions.filter((t) => t.type === 'EXPENSE');
    const totalExp = expenseTxns.reduce((acc, t) => acc + t.amount, 0);

    const map: Record<string, { amount: number; count: number }> = {};
    for (const t of expenseTxns) {
      if (!map[t.category]) {
        map[t.category] = { amount: 0, count: 0 };
      }
      map[t.category].amount += t.amount;
      map[t.category].count += 1;
    }

    const breakdown: CategoryExpenseBreakdown[] = Object.keys(map).map((cat) => {
      const amount = map[cat].amount;
      const percentage = totalExp > 0 ? parseFloat(((amount / totalExp) * 100).toFixed(1)) : 0;
      return {
        category: cat,
        amount,
        percentage,
        color: getCategoryColor(cat),
        transactionCount: map[cat].count,
      };
    });

    return breakdown.sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          (t.description ? t.description.toLowerCase().includes(q) : false) ||
          (t.category ? t.category.toLowerCase().includes(q) : false) ||
          (t.account ? t.account.toLowerCase().includes(q) : false) ||
          (t.notes ? t.notes.toLowerCase().includes(q) : false)
      );
    }

    if (selectedType !== 'ALL') {
      result = result.filter((t) => t.type === selectedType);
    }

    if (selectedCategory !== 'ALL') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    if (sortBy === 'amount') {
      result.sort((a, b) => (sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount));
    } else {
      result.sort((a, b) =>
        sortOrder === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    return result;
  }, [transactions, searchQuery, selectedType, selectedCategory, sortBy, sortOrder]);

  // Handlers for Add & Delete
  const handleAddTransaction = async (payload: NewTransactionPayload) => {
    setIsDataCleared(false);
    const newTx = await transactionService.createTransaction(payload);
    setTransactions((prev) => [newTx, ...prev]);

    // Refresh accounts if connected
    try {
      const updatedAccounts = await accountService.getAccounts();
      if (updatedAccounts && updatedAccounts.length > 0) {
        setAccounts(updatedAccounts);
      }
    } catch {
      // ignore
    }

    showToast(`Recorded "${newTx.description}" successfully`);
  };

  const handleDeleteTransaction = async (id: string) => {
    await transactionService.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction removed');
  };

  const handleAddBudget = async (payload: NewBudgetPayload) => {
    setIsDataCleared(false);
    const newBudget = await budgetService.createBudget(payload);
    setBudgets((prev) => [...prev, newBudget]);
    showToast(`Created budget for ${newBudget.category}`);
  };

  const handleDeleteBudget = async (id: string) => {
    await budgetService.deleteBudget(id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    showToast('Budget removed');
  };

  const handleAddAccount = async (payload: NewAccountPayload) => {
    setIsDataCleared(false);
    const newAcc = await accountService.createAccount(payload);
    setAccounts((prev) => [...prev, newAcc]);
    showToast(`Account "${newAcc.name}" successfully connected`);
  };

  const handleClearAllFinancialData = async () => {
    await financialDataService.clearAllFinancialData();
    setIsDataCleared(true);
    setTransactions([]);
    setBudgets([]);
    setAccounts([]);
    setFinancialHealth({
      score: 50,
      rating: 'FAIR',
      insights: ['No income or transactions recorded. Add your transactions to start tracking.'],
    });
    showToast('All financial data has been permanently cleared.');
  };

  const handleMarkNotificationRead = (id: string) => {
    setReadNotificationIds((prev) => new Set([...prev, id]));
  };

  const handleMarkAllNotificationsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotificationIds(new Set(allIds));
    showToast('All notifications marked as read');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedCategory('ALL');
    setSortBy('date');
    setSortOrder('desc');
  };

  const handleHeaderSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && activeTab !== 'transactions') {
      setActiveTab('transactions');
    }
  };

  // Protect Dashboard Route: If not logged in, show AuthPage
  if (!currentUser) {
    return (
      <>
        {toastMessage && (
          <div
            className="fixed bottom-5 right-5 z-50 font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
            style={{ backgroundColor: '#76513C', color: '#FFFDF8', boxShadow: '0 4px 14px 0 rgba(56,39,31,0.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FFFDF8' }} />
            <span>{toastMessage}</span>
          </div>
        )}
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: '#F6F0E7', color: '#38271F' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="fixed bottom-5 right-5 z-50 font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
          style={{ backgroundColor: '#76513C', color: '#FFFDF8', boxShadow: '0 4px 14px 0 rgba(56,39,31,0.2)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FFFDF8' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAddTransaction={() => setIsAddTxModalOpen(true)}
          activeTab={activeTab}
          onNavigateSettings={() => setActiveTab('settings')}
          currentUser={currentUser}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={handleHeaderSearch}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Tab 1: Dashboard Home */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 4 Stat Cards */}
              <SummaryCards summary={summary} />

              {/* Income vs Expenses Chart & Category Donut */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <CashFlowChart data={dynamicCashFlowHistory} />
                </div>
                <div className="lg:col-span-5">
                  <CategoryExpenses
                    data={categoryExpenses}
                    totalExpenses={summary.totalMonthlyExpenses}
                  />
                </div>
              </div>

              {/* Budget Progress & Recent Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                  <BudgetProgress
                    budgets={activeBudgets}
                    onViewAllBudgets={() => setActiveTab('budgets')}
                  />
                </div>
                <div className="lg:col-span-7">
                  <RecentTransactions
                    transactions={transactions}
                    onViewAll={() => setActiveTab('transactions')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Transactions Manager */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#38271F' }}>Transactions</h2>
                  <p className="text-xs mt-1" style={{ color: '#78685B' }}>
                    Search, filter, and review your complete financial ledger
                  </p>
                </div>
                <button
                  onClick={() => setIsAddTxModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium transition-colors self-start sm:self-auto"
                  style={{ backgroundColor: '#76513C', color: '#FFFDF8' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#5D3D2D'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#76513C'; }}
                >
                  + Record Transaction
                </button>
              </div>

              <TransactionFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={(sb, so) => {
                  setSortBy(sb);
                  setSortOrder(so);
                }}
                onResetFilters={handleResetFilters}
              />

              <TransactionTable
                transactions={filteredTransactions}
                onDeleteTransaction={handleDeleteTransaction}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery('')}
              />
            </div>
          )}

          {/* Tab 3: Budgets & Spending Limits */}
          {activeTab === 'budgets' && (
            <BudgetOverview
              budgets={activeBudgets}
              onAddBudget={handleAddBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          )}

          {/* Tab 4: Analytics */}
          {activeTab === 'analytics' && financialHealth && (
            <AnalyticsDashboard
              cashFlowHistory={dynamicCashFlowHistory}
              categoryExpenses={categoryExpenses}
              financialHealth={financialHealth}
              totalIncome={summary.totalMonthlyIncome}
              totalExpenses={summary.totalMonthlyExpenses}
            />
          )}

          {/* Tab 5: Connected Accounts */}
          {activeTab === 'accounts' && (
            <AccountsView
              accounts={dynamicAccounts}
              transactions={transactions}
              onOpenAddTransaction={() => setIsAddTxModalOpen(true)}
              onAddAccount={handleAddAccount}
            />
          )}

          {/* Tab 6: Settings */}
          {activeTab === 'settings' && (
            <SettingsView
              onShowToast={showToast}
              currentUser={currentUser}
              onClearAllFinancialData={handleClearAllFinancialData}
            />
          )}
        </main>

        {/* Global Modal for Adding Transactions */}
        <AddTransactionModal
          isOpen={isAddTxModalOpen}
          onClose={() => setIsAddTxModalOpen(false)}
          onSubmit={handleAddTransaction}
        />

        {/* Commercial Footer */}
        <footer
          className="mt-auto py-5 px-4 sm:px-6 lg:px-8 text-center text-xs"
          style={{ borderTop: '1px solid #D8C6B2', backgroundColor: '#FFFDF8', color: '#78685B' }}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-medium" style={{ color: '#38271F' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#76513C' }} />
              <span>FinEdge — Smarter Spending, Better Living</span>
            </p>
            <div className="flex items-center gap-4 text-[11px]" style={{ color: '#78685B' }}>
              <span className="cursor-pointer transition-colors" style={{ color: '#78685B' }} onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.color = '#38271F'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.color = '#78685B'; }}>Privacy Policy</span>
              <span>•</span>
              <span className="cursor-pointer transition-colors" style={{ color: '#78685B' }} onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.color = '#38271F'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.color = '#78685B'; }}>Terms of Service</span>
              <span>•</span>
              <span>© 2026 FinEdge Inc.</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
