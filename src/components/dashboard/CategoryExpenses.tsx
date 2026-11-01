import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategoryExpenseBreakdown } from '../../types/analytics';
import { formatCurrency } from '../../utils/formatters';

interface CategoryExpensesProps {
  data: CategoryExpenseBreakdown[];
  totalExpenses: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: CategoryExpenseBreakdown;
  }>;
}

const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="rounded-lg shadow-xl text-xs p-3" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="font-semibold" style={{ color: '#38271F' }}>{item.category}</span>
        </div>
        <p className="font-semibold font-mono" style={{ color: '#76513C' }}>
          {formatCurrency(item.amount)}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: '#78685B' }}>
          {item.percentage}% of total expenses
        </p>
      </div>
    );
  }
  return null;
};

export const CategoryExpenses: React.FC<CategoryExpensesProps> = ({ data, totalExpenses }) => {
  return (
    <div className="rounded-xl bg-cream-50 border border-cream-400 p-5 shadow-sm flex flex-col justify-between" style={{ boxShadow: '0 2px 8px 0 rgba(56,39,31,0.06)' }}>
      <div className="mb-2">
        <h3 className="text-base font-semibold text-mocha-800 tracking-tight">Spending by Category</h3>
        <p className="text-xs text-mocha-400 mt-0.5">Monthly allocation breakdown</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center flex-1">
        {/* Donut Chart */}
        <div className="md:col-span-5 h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="amount"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFDF8" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Total Indicator */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: '#CBAF96' }}>Total</span>
            <span className="text-sm font-bold mt-0.5 font-mono" style={{ color: '#38271F' }}>
              {formatCurrency(totalExpenses)}
            </span>
          </div>
        </div>

        {/* Legend / Category breakdown list */}
        <div className="md:col-span-7 space-y-1.5 overflow-y-auto max-h-56 pr-1">
          {data.map((cat) => (
            <div
              key={cat.category}
              className="flex items-center justify-between p-2 rounded-lg transition-colors text-xs border"
              style={{ backgroundColor: '#F6F0E7', borderColor: '#E6D8C5' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#EADCCB'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#F6F0E7'; }}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium truncate" style={{ color: '#78685B' }}>{cat.category}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-semibold font-mono" style={{ color: '#38271F' }}>
                  {formatCurrency(cat.amount)}
                </span>
                <span className="text-[11px] ml-2 font-medium" style={{ color: '#CBAF96' }}>
                  {cat.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
