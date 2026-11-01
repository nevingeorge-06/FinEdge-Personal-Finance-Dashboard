import React from 'react';
import { TransactionType, TransactionCategory } from '../../types/transaction';
import { CATEGORIES } from '../../utils/constants';
import { Search, RotateCcw, ArrowUpDown, Filter } from 'lucide-react';

interface TransactionFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: TransactionType | 'ALL';
  onTypeChange: (type: TransactionType | 'ALL') => void;
  selectedCategory: TransactionCategory | 'ALL';
  onCategoryChange: (category: TransactionCategory | 'ALL') => void;
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'date' | 'amount', sortOrder: 'asc' | 'desc') => void;
  onResetFilters: () => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  sortOrder,
  onSortChange,
  onResetFilters,
}) => {
  const types: { id: TransactionType | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'INCOME', label: 'Income' },
    { id: 'EXPENSE', label: 'Expenses' },
  ];

  return (
    <div className="bg-cream-50 border border-cream-400 rounded-xl p-3.5 mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#CBAF96' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by description, account, category..."
            className="w-full pl-9 pr-8 py-1.5 rounded-lg text-xs focus:outline-none transition-colors"
            style={{ backgroundColor: '#F6F0E7', border: '1px solid #D8C6B2', color: '#38271F' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#76513C'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(118,81,60,0.15)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#D8C6B2'; e.currentTarget.style.boxShadow = 'none'; }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-mocha-400 hover:text-mocha-700"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter buttons & dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Toggle Pills */}
          <div className="flex p-1 rounded-lg border" style={{ backgroundColor: '#F6F0E7', borderColor: '#D8C6B2' }}>
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => onTypeChange(t.id)}
                className="px-3 py-1 rounded text-xs font-medium transition-colors"
                style={selectedType === t.id
                  ? { backgroundColor: '#FFFDF8', color: '#76513C', fontWeight: 600, border: '1px solid #D8C6B2' }
                  : { color: '#78685B' }
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value as TransactionCategory | 'ALL')}
              className="appearance-none text-xs py-1.5 pl-3 pr-8 rounded-lg focus:outline-none cursor-pointer"
              style={{ backgroundColor: '#F6F0E7', border: '1px solid #D8C6B2', color: '#78685B' }}
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#CBAF96' }} />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as ['date' | 'amount', 'asc' | 'desc'];
                onSortChange(sb, so);
              }}
              className="appearance-none text-xs py-1.5 pl-3 pr-8 rounded-lg focus:outline-none cursor-pointer"
              style={{ backgroundColor: '#F6F0E7', border: '1px solid #D8C6B2', color: '#78685B' }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#CBAF96' }} />
          </div>

          {/* Reset button */}
          {(searchQuery || selectedType !== 'ALL' || selectedCategory !== 'ALL') && (
            <button
              onClick={onResetFilters}
              className="p-1.5 rounded-lg text-xs transition-colors border"
              style={{ backgroundColor: '#F6F0E7', borderColor: '#D8C6B2', color: '#78685B' }}
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
