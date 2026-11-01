import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositiveGood?: boolean;
    label?: string;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  onClick,
}) => {
  const isPositive = trend ? trend.value >= 0 : false;
  const isGood = trend ? (trend.isPositiveGood !== false ? isPositive : !isPositive) : true;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-cream-50 border border-cream-400 p-5 shadow-sm transition-all hover:border-mocha-300 hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-mocha-400 tracking-normal">{title}</p>
          <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-mocha-800 font-mono">{value}</h3>
        </div>
        <div className="p-2 rounded-lg bg-cream-300 border border-cream-400 text-mocha-500">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-cream-400">
        {trend ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded text-[11px] ${
                isGood
                  ? 'bg-indicator-income/10 text-indicator-income'
                  : 'bg-indicator-expense/10 text-indicator-expense'
              }`}
            >
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-mocha-400 text-[11px]">{trend.label || 'vs last month'}</span>
          </div>
        ) : (
          <span className="text-[11px] text-mocha-400">{subtitle || 'Updated today'}</span>
        )}
        {trend && subtitle && (
          <span className="text-[11px] text-mocha-400">{subtitle}</span>
        )}
      </div>
    </div>
  );
};
