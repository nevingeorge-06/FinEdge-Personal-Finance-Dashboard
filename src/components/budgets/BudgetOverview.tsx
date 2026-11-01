import React, { useState } from 'react';
import { Budget, NewBudgetPayload } from '../../types/budget';
import { ProgressBar } from '../common/ProgressBar';
import { formatCurrency } from '../../utils/formatters';
import { AddBudgetModal } from './AddBudgetModal';
import {
  PieChart,
  Plus,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Info,
  Trash2,
} from 'lucide-react';

interface BudgetOverviewProps {
  budgets: Budget[];
  onAddBudget: (payload: NewBudgetPayload) => Promise<void>;
  onDeleteBudget?: (id: string) => Promise<void>;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  budgets,
  onAddBudget,
  onDeleteBudget,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.allocatedAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);
  const remainingBudget = Math.max(0, totalBudgeted - totalSpent);
  const percentSpent = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const overBudgetCategories = budgets.filter((b) => b.spentAmount > b.allocatedAmount);

  return (
    <div className="space-y-6">
      {/* Header section with Add Budget button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#38271F' }}>
            <PieChart className="w-5 h-5" style={{ color: '#76513C' }} />
            <span>Budgets &amp; Limits</span>
          </h2>
          <p className="text-xs mt-1" style={{ color: '#78685B' }}>
            Track and manage category spending targets
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors self-start sm:self-auto"
          style={{ backgroundColor: '#76513C', color: '#FFFDF8' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#5D3D2D'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#76513C'; }}
        >
          <Plus className="w-4 h-4" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Top metrics summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
          <p className="text-xs font-medium" style={{ color: '#78685B' }}>Total Budgeted</p>
          <p className="text-xl font-bold mt-1 font-mono" style={{ color: '#38271F' }}>
            {formatCurrency(totalBudgeted)}
          </p>
          <p className="text-[11px] mt-1" style={{ color: '#CBAF96' }}>{budgets.length} active categories</p>
        </div>

        <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
          <p className="text-xs font-medium" style={{ color: '#78685B' }}>Total Spent</p>
          <p className="text-xl font-bold mt-1 font-mono" style={{ color: '#38271F' }}>
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-[11px] mt-1" style={{ color: '#CBAF96' }}>{percentSpent.toFixed(1)}% of allocation</p>
        </div>

        <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
          <p className="text-xs font-medium" style={{ color: '#78685B' }}>Remaining</p>
          <p className="text-xl font-bold mt-1 font-mono" style={{ color: '#287A55' }}>
            {formatCurrency(remainingBudget)}
          </p>
          <p className="text-[11px] mt-1" style={{ color: '#CBAF96' }}>Available to spend</p>
        </div>

        <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
          <p className="text-xs font-medium" style={{ color: '#78685B' }}>Status</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            {overBudgetCategories.length > 0 ? (
              <>
                <AlertCircle className="w-4 h-4" style={{ color: '#B94C48' }} />
                <span className="text-sm font-semibold" style={{ color: '#B94C48' }}>
                  {overBudgetCategories.length} Exceeded
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" style={{ color: '#287A55' }} />
                <span className="text-sm font-semibold" style={{ color: '#287A55' }}>On Target</span>
              </>
            )}
          </div>
          <p className="text-[11px] mt-1" style={{ color: '#CBAF96' }}>Threshold monitoring</p>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((budget) => {
          const percentage = (budget.spentAmount / budget.allocatedAmount) * 100;
          const isOver = budget.spentAmount > budget.allocatedAmount;
          const isNear = percentage >= budget.alertThresholdPercent && !isOver;

          return (
            <div
              key={budget.id}
              className="rounded-xl p-5 shadow-sm transition-colors flex flex-col justify-between"
              style={{
                backgroundColor: '#FFFDF8',
                border: isOver ? '1px solid rgba(185,76,72,0.35)' : isNear ? '1px solid rgba(183,121,37,0.35)' : '1px solid #D8C6B2',
              }}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: budget.color }}
                    />
                    <div>
                      <h4 className="text-sm font-semibold" style={{ color: '#38271F' }}>{budget.category}</h4>
                      <span className="text-[10px] uppercase font-medium" style={{ color: '#CBAF96' }}>
                        {budget.period}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded border"
                      style={
                        isOver
                          ? { backgroundColor: 'rgba(185,76,72,0.08)', color: '#B94C48', borderColor: 'rgba(185,76,72,0.25)' }
                          : isNear
                          ? { backgroundColor: 'rgba(183,121,37,0.08)', color: '#B77925', borderColor: 'rgba(183,121,37,0.25)' }
                          : { backgroundColor: 'rgba(40,122,85,0.08)', color: '#287A55', borderColor: 'rgba(40,122,85,0.25)' }
                      }
                    >
                      {percentage.toFixed(0)}%
                    </span>
                    {onDeleteBudget && (
                      <button
                        type="button"
                        onClick={() => onDeleteBudget(budget.id)}
                        className="p-1 rounded transition-colors"
                        style={{ color: '#CBAF96' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#B94C48'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#CBAF96'; }}
                        title="Delete Budget"
                        aria-label="Delete Budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="my-3">
                  <ProgressBar
                    value={budget.spentAmount}
                    max={budget.allocatedAmount}
                    size="md"
                    warningThreshold={budget.alertThresholdPercent}
                  />
                </div>

                {/* Amount breakdown */}
                <div className="flex items-center justify-between text-xs pt-1 font-mono">
                  <div>
                    <span className="text-[11px]" style={{ color: '#CBAF96' }}>Spent</span>
                    <p className="font-semibold" style={{ color: isOver ? '#B94C48' : '#38271F' }}>
                      {formatCurrency(budget.spentAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px]" style={{ color: '#CBAF96' }}>Limit</span>
                    <p className="font-semibold" style={{ color: '#78685B' }}>
                      {formatCurrency(budget.allocatedAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status footer message */}
              <div className="mt-4 pt-3 text-[11px]" style={{ borderTop: '1px solid #E6D8C5' }}>
                {isOver ? (
                  <p className="flex items-center gap-1 font-medium" style={{ color: '#B94C48' }}>
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Over budget by {formatCurrency(budget.spentAmount - budget.allocatedAmount)}</span>
                  </p>
                ) : isNear ? (
                  <p className="flex items-center gap-1 font-medium" style={{ color: '#B77925' }}>
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Nearing alert threshold ({budget.alertThresholdPercent}%)</span>
                  </p>
                ) : (
                  <p className="flex items-center gap-1" style={{ color: '#78685B' }}>
                    <TrendingDown className="w-3.5 h-3.5 shrink-0" style={{ color: '#287A55' }} />
                    <span>{formatCurrency(budget.allocatedAmount - budget.spentAmount)} remaining</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Budgeting Guidance */}
      <div className="p-4 rounded-xl text-xs flex items-start gap-3" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
        <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#76513C' }} />
        <div>
          <h4 className="font-medium" style={{ color: '#38271F' }}>50 / 30 / 20 Allocation Rule</h4>
          <p className="mt-1 leading-relaxed" style={{ color: '#78685B' }}>
            A balanced financial framework partitions after-tax income into three tiers: 50% for Needs (Housing, Groceries, Utilities), 30% for Discretionary Wants (Dining, Entertainment, Shopping), and 20% for Savings and Investments.
          </p>
        </div>
      </div>

      {/* Add Budget Modal */}
      <AddBudgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onAddBudget}
      />
    </div>
  );
};
