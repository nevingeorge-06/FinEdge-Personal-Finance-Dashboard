import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { CashFlowDataPoint } from '../../types/analytics';
import { formatCurrency } from '../../utils/formatters';
import { BarChart2, LineChart as LineIcon, PiggyBank } from 'lucide-react';

interface CashFlowChartProps {
  data: CashFlowDataPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const formatMonthLabel = (val: string): string => {
  if (!val) return '';
  if (/^\d{4}-\d{2}$/.test(val)) {
    const [year, month] = val.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleString('default', { month: 'short' });
  }
  return val;
};

const formatYAxisTick = (val: number): string => {
  if (val === 0) return '₹0';
  if (val >= 100000) {
    const lakh = val / 100000;
    return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(1)}L`;
  }
  if (val >= 1000) {
    const k = val / 1000;
    return `₹${k % 1 === 0 ? k : k.toFixed(1)}k`;
  }
  return `₹${val}`;
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const incomeEntry = payload.find((p) => p.dataKey === 'income' || p.name === 'Income');
    const expensesEntry = payload.find((p) => p.dataKey === 'expenses' || p.name === 'Expenses');
    const income = incomeEntry?.value || 0;
    const expenses = expensesEntry?.value || 0;
    const netSavings = income - expenses;
    const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;

    return (
      <div className="rounded-xl p-3.5 shadow-xl text-xs min-w-[200px]" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
        <p className="font-semibold mb-2.5 pb-1.5 flex items-center justify-between" style={{ color: '#38271F', borderBottom: '1px solid #D8C6B2' }}>
          <span>{formatMonthLabel(label || '')} Overview</span>
          <span className="text-[10px] font-normal" style={{ color: '#CBAF96' }}>Monthly Details</span>
        </p>

        <div className="space-y-2">
          {/* Income */}
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: '#78685B' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#287A55' }} />
              Income
            </span>
            <span className="font-semibold font-mono" style={{ color: '#287A55' }}>
              {formatCurrency(income)}
            </span>
          </div>

          {/* Expenses */}
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: '#78685B' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#B94C48' }} />
              Expenses
            </span>
            <span className="font-semibold font-mono" style={{ color: '#B94C48' }}>
              {formatCurrency(expenses)}
            </span>
          </div>

          {/* Net Savings & Savings Rate */}
          <div className="pt-2 space-y-1" style={{ borderTop: '1px solid #E6D8C5' }}>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1" style={{ color: '#78685B' }}>
                <PiggyBank className="w-3 h-3" style={{ color: '#287A55' }} />
                Net Savings:
              </span>
              <span className="font-semibold font-mono" style={{ color: netSavings >= 0 ? '#287A55' : '#B94C48' }}>
                {formatCurrency(netSavings)}
              </span>
            </div>

            {income > 0 && (
              <div className="flex items-center justify-between gap-4 text-[11px]">
                <span style={{ color: '#78685B' }}>Savings Rate:</span>
                <span className="font-medium" style={{ color: savingsRate >= 0 ? '#287A55' : '#B94C48' }}>
                  {savingsRate.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Dynamic Y-axis upper bound
  const calculateDomain = ([, dataMax]: [number, number]): [number, number] => {
    if (!dataMax || dataMax <= 0) return [0, 10000];
    const padded = dataMax * 1.15;
    const step = padded > 50000 ? 10000 : 5000;
    return [0, Math.ceil(padded / step) * step];
  };

  return (
    <div className="rounded-xl bg-cream-50 border border-cream-400 p-5 shadow-sm flex flex-col justify-between" style={{ boxShadow: '0 2px 8px 0 rgba(56,39,31,0.06)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-semibold text-mocha-800 tracking-tight">Income vs. Expenses</h3>
          <p className="text-xs text-mocha-400 mt-0.5">6-month comparison of total cash flows</p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg border self-start sm:self-auto" style={{ backgroundColor: '#F6F0E7', borderColor: '#D8C6B2' }}>
          <button
            onClick={() => setChartType('area')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              chartType === 'area'
                ? 'font-semibold shadow-sm'
                : ''
            }`}
            style={chartType === 'area'
              ? { backgroundColor: '#FFFDF8', color: '#76513C', border: '1px solid #D8C6B2' }
              : { color: '#78685B' }
            }
          >
            <LineIcon className="w-3.5 h-3.5" />
            <span>Area</span>
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              chartType === 'bar'
                ? 'font-semibold shadow-sm'
                : ''
            }`}
            style={chartType === 'bar'
              ? { backgroundColor: '#FFFDF8', color: '#76513C', border: '1px solid #D8C6B2' }
              : { color: '#78685B' }
            }
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Bars</span>
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 12, right: 15, left: 10, bottom: 4 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#287A55" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#287A55" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B94C48" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#B94C48" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8C6B2" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#78685B"
                fontSize={11}
                tickLine={false}
                tickFormatter={formatMonthLabel}
              />
              <YAxis
                stroke="#78685B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={65}
                tickFormatter={formatYAxisTick}
                domain={calculateDomain}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px', color: '#78685B' }}
              />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#287A55"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#287A55', stroke: '#FFFDF8', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#287A55', stroke: '#FFFDF8', strokeWidth: 2 }}
                fillOpacity={1}
                fill="url(#incomeGradient)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#B94C48"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#B94C48', stroke: '#FFFDF8', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#B94C48', stroke: '#FFFDF8', strokeWidth: 2 }}
                fillOpacity={1}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 12, right: 15, left: 10, bottom: 4 }}
              barGap={6}
              barCategoryGap="24%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#D8C6B2" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#78685B"
                fontSize={11}
                tickLine={false}
                tickFormatter={formatMonthLabel}
              />
              <YAxis
                stroke="#78685B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={65}
                tickFormatter={formatYAxisTick}
                domain={calculateDomain}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px', color: '#78685B' }}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill="#287A55"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="expenses"
                name="Expenses"
                fill="#B94C48"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
