/**
 * Formatting utilities for FinEdge Personal Finance Dashboard
 */

export const formatCurrency = (amount: number, currency = 'INR'): string => {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatPercent = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    'Salary':        '#287A55', // indicator-income green
    'Freelance':     '#567A91', // indicator-info blue-grey
    'Investments':   '#76513C', // primary mocha accent
    'Housing':       '#8B6F5E', // warm brown
    'Food & Dining': '#B77925', // indicator-warning amber
    'Groceries':     '#287A55', // income green (same as salary – food/positive)
    'Transportation':'#567A91', // info blue-grey
    'Utilities':     '#9B7260', // medium mocha
    'Entertainment': '#C4703A', // copper tone
    'Healthcare':    '#B94C48', // indicator-expense red
    'Education':     '#76513C', // primary mocha
    'Shopping':      '#A0614E', // warm terracotta
    'Personal Care': '#78685B', // secondary text mocha
    'Other':         '#CBAF96', // cream-500 neutral
  };

  return colorMap[category] || '#CBAF96';
};
