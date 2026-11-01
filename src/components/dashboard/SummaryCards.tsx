import React from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { FinancialSummary } from '../../types/account';
import { StatCard } from '../common/StatCard';
import { formatCurrency } from '../../utils/formatters';

interface SummaryCardsProps {
  summary: FinancialSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Balance"
        value={formatCurrency(summary.totalNetWorth)}
        subtitle={`Liquid: ${formatCurrency(summary.totalLiquidBalance)}`}
        icon={Wallet}
        trend={{
          value: summary.netWorthChangePercent,
          label: 'vs last month',
        }}
      />

      <StatCard
        title="Monthly Income"
        value={formatCurrency(summary.totalMonthlyIncome)}
        subtitle="Current billing cycle"
        icon={TrendingUp}
        trend={{
          value: summary.monthlyIncomeChangePercent,
          label: 'vs last month',
        }}
      />

      <StatCard
        title="Monthly Expenses"
        value={formatCurrency(summary.totalMonthlyExpenses)}
        subtitle="Total outflows"
        icon={TrendingDown}
        trend={{
          value: summary.monthlyExpenseChangePercent,
          isPositiveGood: false,
          label: 'vs last month',
        }}
      />

      <StatCard
        title="Savings"
        value={formatCurrency(summary.monthlySavings)}
        subtitle={`${summary.savingsRatePercentage.toFixed(1)}% savings rate`}
        icon={PiggyBank}
        trend={{
          value: 4.8,
          label: 'above target',
        }}
      />
    </div>
  );
};
