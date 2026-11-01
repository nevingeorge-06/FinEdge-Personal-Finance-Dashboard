import React from 'react';
import { CashFlowDataPoint, CategoryExpenseBreakdown, FinancialHealthScore } from '../../types/analytics';
import { CashFlowChart } from '../dashboard/CashFlowChart';
import { CategoryExpenses } from '../dashboard/CategoryExpenses';
import { formatCurrency } from '../../utils/formatters';
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  DollarSign,
  Scale,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  cashFlowHistory: CashFlowDataPoint[];
  categoryExpenses: CategoryExpenseBreakdown[];
  financialHealth: FinancialHealthScore;
  totalIncome: number;
  totalExpenses: number;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  cashFlowHistory,
  categoryExpenses,
  financialHealth,
  totalIncome,
  totalExpenses,
}) => {
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#38271F' }}>
          <TrendingUp className="w-5 h-5" style={{ color: '#76513C' }} />
          <span>Financial Analytics</span>
        </h2>
        <p className="text-xs mt-1" style={{ color: '#78685B' }}>
          Detailed breakdown of your cash flows, spending patterns, and savings trajectory
        </p>
      </div>

      {/* Financial Health Score & Ratio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health score card */}
        <div className="rounded-xl p-5 shadow-sm flex flex-col justify-between" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: '#78685B' }}>
                Financial Health Index
              </span>
              <Activity className="w-4 h-4" style={{ color: '#76513C' }} />
            </div>

            <div className="flex items-baseline gap-2.5 my-2">
              <span className="text-3xl font-bold" style={{ color: '#38271F' }}>
                {financialHealth.score}
              </span>
              <span className="text-xs font-medium" style={{ color: '#CBAF96' }}>/ 100</span>
              <span className="ml-auto px-2 py-0.5 rounded text-[11px] font-medium" style={{ backgroundColor: 'rgba(40,122,85,0.08)', color: '#287A55', border: '1px solid rgba(40,122,85,0.20)' }}>
                {financialHealth.rating}
              </span>
            </div>

            <p className="text-xs mt-2 leading-relaxed" style={{ color: '#78685B' }}>
              Your overall cash flow demonstrates solid discipline and healthy savings reserves.
            </p>
          </div>
        </div>

        {/* Savings vs Burn Rate */}
        <div className="rounded-xl p-5 shadow-sm flex flex-col justify-between" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
          <div>
            <div className="flex items-center justify-between text-xs font-medium mb-2">
              <span style={{ color: '#78685B' }}>Savings Ratio</span>
              <DollarSign className="w-4 h-4" style={{ color: '#287A55' }} />
            </div>
            <p className="text-2xl font-bold font-mono" style={{ color: '#287A55' }}>
              {savingsRate.toFixed(1)}%
            </p>
            <p className="text-xs mt-1" style={{ color: '#78685B' }}>
              {formatCurrency(savings)} saved from {formatCurrency(totalIncome)} income
            </p>
          </div>

          <div className="w-full h-2 rounded-full overflow-hidden mt-4" style={{ backgroundColor: '#E6D8C5', border: '1px solid #D8C6B2' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%`, backgroundColor: '#287A55' }}
            />
          </div>
        </div>

        {/* Expense Load Ratio */}
        <div className="rounded-xl p-5 shadow-sm flex flex-col justify-between" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
          <div>
            <div className="flex items-center justify-between text-xs font-medium mb-2">
              <span style={{ color: '#78685B' }}>Expense Ratio</span>
              <Scale className="w-4 h-4" style={{ color: '#78685B' }} />
            </div>
            <p className="text-2xl font-bold font-mono" style={{ color: '#38271F' }}>
              {expenseRatio.toFixed(1)}%
            </p>
            <p className="text-xs mt-1" style={{ color: '#78685B' }}>
              {formatCurrency(totalExpenses)} total expenditures
            </p>
          </div>

          <div className="w-full h-2 rounded-full overflow-hidden mt-4" style={{ backgroundColor: '#E6D8C5', border: '1px solid #D8C6B2' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, expenseRatio))}%`, backgroundColor: '#B94C48' }}
            />
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <CashFlowChart data={cashFlowHistory} />
        </div>
        <div className="lg:col-span-5">
          <CategoryExpenses data={categoryExpenses} totalExpenses={totalExpenses} />
        </div>
      </div>

      {/* Financial Insights */}
      <div className="rounded-xl p-5 shadow-sm" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4" style={{ color: '#B77925' }} />
          <h3 className="text-base font-semibold tracking-tight" style={{ color: '#38271F' }}>Smart Financial Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {financialHealth.insights.map((insight, index) => (
            <div
              key={index}
              className="p-3.5 rounded-lg flex items-start gap-3 text-xs"
              style={{ backgroundColor: '#F6F0E7', border: '1px solid #E6D8C5' }}
            >
              {index === 2 ? (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#B77925' }} />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#287A55' }} />
              )}
              <p className="leading-relaxed" style={{ color: '#78685B' }}>{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
