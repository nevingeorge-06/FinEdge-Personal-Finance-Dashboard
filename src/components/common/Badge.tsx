import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'teal' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    teal:    'bg-indicator-income/10 text-indicator-income border-indicator-income/30',
    emerald: 'bg-indicator-income/10 text-indicator-income border-indicator-income/30',
    amber:   'bg-indicator-warning/10 text-indicator-warning border-indicator-warning/30',
    rose:    'bg-indicator-expense/10 text-indicator-expense border-indicator-expense/30',
    blue:    'bg-indicator-info/10 text-indicator-info border-indicator-info/30',
    purple:  'bg-mocha-100 text-mocha-500 border-mocha-300',
    slate:   'bg-cream-300 text-mocha-500 border-cream-400',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
