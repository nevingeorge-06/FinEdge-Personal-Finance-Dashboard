import React from 'react';
import { Budget } from '../../types/budget';
import { ProgressBar } from '../common/ProgressBar';
import { formatCurrency } from '../../utils/formatters';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BudgetProgressProps {
  budgets: Budget[];
  onViewAllBudgets: () => void;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({ budgets, onViewAllBudgets }) => {
  const totalBudgeted = budgets.reduce((acc, b) => acc + b.allocatedAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);
  const overBudgetCategories = budgets.filter((b) => b.spentAmount > b.allocatedAmount);

  return (
    <div className="rounded-xl bg-cream-50 border border-cream-400 p-5 shadow-sm flex flex-col justify-between" style={{ boxShadow: '0 2px 8px 0 rgba(56,39,31,0.06)' }}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-mocha-800 tracking-tight">Budget Overview</h3>
              {overBudgetCategories.length > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border" style={{ color: '#B94C48', backgroundColor: 'rgba(185,76,72,0.08)', borderColor: 'rgba(185,76,72,0.25)' }}>
                  <AlertCircle className="w-3 h-3" />
                  {overBudgetCategories.length} exceeded
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border" style={{ color: '#287A55', backgroundColor: 'rgba(40,122,85,0.08)', borderColor: 'rgba(40,122,85,0.25)' }}>
                  <CheckCircle2 className="w-3 h-3" />
                  Within limits
                </span>
              )}
            </div>
            <p className="text-xs text-mocha-400 mt-0.5">Monthly limits vs. actual expenditures</p>
          </div>

          <button
            onClick={onViewAllBudgets}
            className="text-xs font-medium flex items-center gap-1 transition-colors"
            style={{ color: '#76513C' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#5D3D2D'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#76513C'; }}
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Global budget status summary banner */}
        <div className="p-3 rounded-lg bg-cream-300 border border-cream-400 mb-4 flex items-center justify-between text-xs">
          <div>
            <span className="text-mocha-400">Total Spent</span>
            <p className="font-semibold text-mocha-800 mt-0.5 font-mono">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="text-center">
            <span className="text-mocha-400">Allocated</span>
            <p className="font-semibold text-mocha-600 mt-0.5 font-mono">{formatCurrency(totalBudgeted)}</p>
          </div>
          <div className="text-right">
            <span className="text-mocha-400">Remaining</span>
            <p className="font-semibold mt-0.5 font-mono" style={{ color: '#287A55' }}>
              {formatCurrency(Math.max(0, totalBudgeted - totalSpent))}
            </p>
          </div>
        </div>

        {/* Category progress list */}
        <div className="space-y-3.5">
          {budgets.slice(0, 4).map((budget) => {
            const percentage = (budget.spentAmount / budget.allocatedAmount) * 100;
            const isExceeded = budget.spentAmount > budget.allocatedAmount;

            return (
              <div key={budget.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: budget.color }}
                    />
                    <span className="font-medium text-mocha-700">{budget.category}</span>
                  </div>
                  <div className="text-[11px] text-right font-medium font-mono">
                    <span style={{ color: isExceeded ? '#B94C48' : '#38271F', fontWeight: isExceeded ? 700 : 500 }}>
                      {formatCurrency(budget.spentAmount)}
                    </span>
                    <span className="text-mocha-300 mx-1">/</span>
                    <span className="text-mocha-400">{formatCurrency(budget.allocatedAmount)}</span>
                  </div>
                </div>

                <ProgressBar
                  value={budget.spentAmount}
                  max={budget.allocatedAmount}
                  size="sm"
                  warningThreshold={budget.alertThresholdPercent}
                />

                <div className="flex items-center justify-between text-[11px] text-mocha-400 mt-1">
                  <span>{percentage.toFixed(0)}% consumed</span>
                  {isExceeded ? (
                    <span className="font-medium" style={{ color: '#B94C48' }}>Over by {formatCurrency(budget.spentAmount - budget.allocatedAmount)}</span>
                  ) : (
                    <span>{formatCurrency(budget.allocatedAmount - budget.spentAmount)} left</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-cream-400 text-center">
        <button
          onClick={onViewAllBudgets}
          className="w-full py-2 rounded-lg text-xs font-medium transition-colors border border-cream-400 hover:border-mocha-300"
          style={{ backgroundColor: '#E6D8C5', color: '#78685B' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#EADCCB'; (e.currentTarget as HTMLButtonElement).style.color = '#38271F'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#E6D8C5'; (e.currentTarget as HTMLButtonElement).style.color = '#78685B'; }}
        >
          Manage All {budgets.length} Budgets
        </button>
      </div>
    </div>
  );
};
