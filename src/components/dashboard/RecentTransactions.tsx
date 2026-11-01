import React from 'react';
import { Transaction } from '../../types/transaction';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { ArrowUpRight, ArrowDownLeft, ArrowRight, CreditCard } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewAll: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onViewAll,
}) => {
  return (
    <div className="rounded-xl bg-cream-50 border border-cream-400 p-5 shadow-sm" style={{ boxShadow: '0 2px 8px 0 rgba(56,39,31,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-mocha-800 tracking-tight">Recent Transactions</h3>
          <p className="text-xs text-mocha-400 mt-0.5">Latest account inflows and payments</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-medium flex items-center gap-1 transition-colors"
          style={{ color: '#76513C' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#5D3D2D'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#76513C'; }}
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-cream-400">
        {transactions.slice(0, 5).map((tx) => {
          const isIncome = tx.type === 'INCOME';

          return (
            <div
              key={tx.id}
              className="py-3 flex items-center justify-between gap-3 hover:bg-cream-600 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    isIncome
                      ? 'border-indicator-income/30'
                      : 'border-cream-400'
                  }`}
                  style={{
                    backgroundColor: isIncome ? 'rgba(40,122,85,0.10)' : '#E6D8C5',
                    color: isIncome ? '#287A55' : '#78685B',
                  }}
                >
                  {isIncome ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-mocha-800 truncate">
                    {tx.description}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-mocha-400 mt-0.5 flex-wrap">
                    <span>{formatDate(tx.date)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      {tx.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p
                  className={`text-xs sm:text-sm font-semibold font-mono`}
                  style={{ color: isIncome ? '#287A55' : '#B94C48' }}
                >
                  {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                </p>
                <div className="mt-0.5">
                  <Badge variant={isIncome ? 'teal' : 'amber'} size="sm">
                    {tx.category}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {transactions.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-mocha-400">No recent transactions</p>
        </div>
      )}
    </div>
  );
};
