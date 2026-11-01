import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types/transaction';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Inbox,
  CreditCard,
  SearchX,
} from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  isLoading?: boolean;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onDeleteTransaction,
  isLoading = false,
  searchQuery = '',
  onClearSearch,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const totalPages = Math.ceil(transactions.length / pageSize) || 1;

  // Reset to first page when search query changes or when out of bounds
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  if (isLoading) {
    return (
      <div className="rounded-xl bg-cream-50 border border-cream-400 p-12 text-center">
        <div className="w-7 h-7 border-2 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#D8C6B2', borderTopColor: '#76513C' }} />
        <p className="text-xs" style={{ color: '#78685B' }}>Loading transactions...</p>
      </div>
    );
  }

  const isSearching = Boolean(searchQuery && searchQuery.trim());

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl bg-cream-50 border border-cream-400 p-12 text-center">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#E6D8C5', color: '#78685B' }}>
          {isSearching ? <SearchX className="w-5 h-5" /> : <Inbox className="w-5 h-5" />}
        </div>
        <h4 className="text-sm font-semibold" style={{ color: '#38271F' }}>
          {isSearching ? 'No results found' : 'No transactions found'}
        </h4>
        <p className="text-xs max-w-sm mx-auto mt-1" style={{ color: '#78685B' }}>
          {isSearching
            ? `No transactions match "${searchQuery.trim()}". Try checking for typos or searching a different term or category.`
            : 'Try adjusting your search criteria, category filters, or record a new transaction above.'}
        </p>
        {isSearching && onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ backgroundColor: '#76513C', color: '#FFFDF8' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#5D3D2D'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#76513C'; }}
          >
            Clear Search
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-cream-50 border border-cream-400 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr style={{ backgroundColor: '#F6F0E7', borderBottom: '1px solid #D8C6B2', color: '#78685B' }} className="font-medium">
              <th className="py-3 px-4">Transaction / Memo</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Account &amp; Method</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';

              return (
                <tr
                  key={tx.id}
                  className="group transition-colors"
                  style={{ borderBottom: '1px solid #E6D8C5' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#EADCCB'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = ''; }}
                >
                  {/* Title & icon */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: isIncome ? 'rgba(40,122,85,0.10)' : '#E6D8C5',
                          borderColor: isIncome ? 'rgba(40,122,85,0.25)' : '#D8C6B2',
                          color: isIncome ? '#287A55' : '#78685B',
                        }}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-xs sm:max-w-md" style={{ color: '#38271F' }}>
                          {tx.description}
                        </p>
                        {tx.notes && (
                          <p className="text-[11px] truncate max-w-xs" style={{ color: '#CBAF96' }}>{tx.notes}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <Badge variant={isIncome ? 'teal' : 'slate'} size="sm">
                      {tx.category}
                    </Badge>
                  </td>

                  {/* Account / Method */}
                  <td className="py-3 px-4" style={{ color: '#78685B' }}>
                    <div className="flex items-center gap-1.5 font-medium">
                      <CreditCard className="w-3.5 h-3.5 shrink-0" style={{ color: '#CBAF96' }} />
                      <span className="truncate max-w-[140px]">{tx.paymentMethod}</span>
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: '#CBAF96' }}>{tx.account}</p>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 text-[11px]" style={{ color: '#78685B' }}>
                    {formatDate(tx.date)}
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className="font-semibold text-xs sm:text-sm font-mono"
                      style={{ color: isIncome ? '#287A55' : '#B94C48' }}
                    >
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: 'rgba(40,122,85,0.08)', color: '#287A55', border: '1px solid rgba(40,122,85,0.20)' }}>
                      {tx.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="p-1 rounded transition-colors"
                      style={{ color: '#CBAF96' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#B94C48'; (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(185,76,72,0.08)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#CBAF96'; (e.currentTarget as HTMLButtonElement).style.backgroundColor = ''; }}
                      title="Delete transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 flex items-center justify-between text-xs" style={{ borderTop: '1px solid #D8C6B2', backgroundColor: '#F6F0E7', color: '#78685B' }}>
        <div>
          Showing{' '}
          <span className="font-semibold" style={{ color: '#38271F' }}>
            {(currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold" style={{ color: '#38271F' }}>
            {Math.min(currentPage * pageSize, transactions.length)}
          </span>{' '}
          of <span className="font-semibold" style={{ color: '#38271F' }}>{transactions.length}</span> records
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-1 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors"
            style={{ backgroundColor: '#E6D8C5', color: '#78685B' }}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-xs font-medium" style={{ color: '#78685B' }}>
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-1 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors"
            style={{ backgroundColor: '#E6D8C5', color: '#78685B' }}
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
