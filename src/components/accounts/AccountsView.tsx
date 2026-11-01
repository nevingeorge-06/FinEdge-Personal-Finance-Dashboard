import React, { useState } from 'react';
import { Account, NewAccountPayload } from '../../types/account';
import { Transaction } from '../../types/transaction';
import { formatCurrency } from '../../utils/formatters';
import { AddAccountModal } from './AddAccountModal';
import {
  Wallet,
  Landmark,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  Plus,
  Info,
} from 'lucide-react';

interface AccountsViewProps {
  accounts: Account[];
  onOpenAddTransaction: () => void;
  onAddAccount?: (payload: NewAccountPayload) => Promise<void>;
  transactions?: Transaction[];
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  onOpenAddTransaction,
  onAddAccount,
  transactions = [],
}) => {
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  // Check if any transactions have unassigned accounts
  const unassignedTxns = transactions.filter((t) => !t.account || !t.account.trim());
  const unassignedIncome = unassignedTxns
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  const unassignedExpenses = unassignedTxns
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
  const unassignedNet = unassignedIncome - unassignedExpenses;

  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0) + unassignedNet;
  const liquidBalance = accounts
    .filter((a) => a.type === 'CHECKING' || a.type === 'SAVINGS' || a.type === 'CASH')
    .reduce((acc, a) => acc + a.balance, 0) + (unassignedNet > 0 ? unassignedNet : 0);
  const investedBalance = accounts
    .filter((a) => a.type === 'INVESTMENT')
    .reduce((acc, a) => acc + a.balance, 0);

  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'CHECKING':
        return Landmark;
      case 'SAVINGS':
        return Wallet;
      case 'INVESTMENT':
        return TrendingUp;
      default:
        return CreditCard;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#38271F' }}>
            <Wallet className="w-5 h-5" style={{ color: '#76513C' }} />
            <span>Accounts &amp; Assets</span>
          </h2>
          <p className="text-xs mt-1" style={{ color: '#78685B' }}>
            Connected banks, liquid reserves, and investment holdings
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onAddAccount && (
            <button
              onClick={() => setIsAddAccountModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm"
              style={{ backgroundColor: '#76513C', color: '#FFFDF8' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#5D3D2D'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#76513C'; }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Account</span>
            </button>
          )}

          <button
            onClick={onOpenAddTransaction}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors border"
            style={{ backgroundColor: '#FFFDF8', color: '#76513C', borderColor: '#D8C6B2' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#EADCCB'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFDF8'; }}
          >
            <Plus className="w-4 h-4" />
            <span>Record Activity</span>
          </button>
        </div>
      </div>

      {/* Net Worth Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
          <p className="text-xs font-medium" style={{ color: '#78685B' }}>Total Net Worth</p>
          <p className="text-2xl font-bold mt-1 font-mono" style={{ color: '#38271F' }}>
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-[11px] mt-1" style={{ color: '#CBAF96' }}>Cumulative account balances</p>
        </div>

        <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
          <p className="text-xs font-medium" style={{ color: '#78685B' }}>Liquid Reserves</p>
          <p className="text-2xl font-bold mt-1 font-mono" style={{ color: '#287A55' }}>
            {formatCurrency(liquidBalance)}
          </p>
          <p className="text-[11px] mt-1" style={{ color: '#CBAF96' }}>Immediate checking &amp; savings</p>
        </div>

        <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
          <p className="text-xs font-medium" style={{ color: '#78685B' }}>Investments</p>
          <p className="text-2xl font-bold mt-1 font-mono" style={{ color: '#76513C' }}>
            {formatCurrency(investedBalance)}
          </p>
          <p className="text-[11px] mt-1" style={{ color: '#CBAF96' }}>Equities &amp; securities</p>
        </div>
      </div>

      {/* Informational banner if any transactions are unassigned to accounts */}
      {unassignedNet !== 0 && (
        <div className="p-3.5 rounded-xl text-xs flex items-start gap-2.5" style={{ backgroundColor: 'rgba(183,121,37,0.08)', border: '1px solid rgba(183,121,37,0.25)', color: '#B77925' }}>
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <span className="font-semibold">Notice:</span> A net balance of {formatCurrency(unassignedNet)} is from transactions with no account specified. When recording transactions, selecting a specific account associates the funds with that account.
          </p>
        </div>
      )}

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const Icon = getAccountIcon(acc.type);
          const accountTxns = transactions.filter(
            (t) => t.account && t.account.trim().toLowerCase() === acc.name.trim().toLowerCase()
          );
          const txCount = accountTxns.length;

          return (
            <div
              key={acc.id}
              className="rounded-xl p-5 shadow-sm transition-all flex flex-col justify-between"
              style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#CBAF96'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px 0 rgba(56,39,31,0.08)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#D8C6B2'; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E6D8C5', border: '1px solid #D8C6B2', color: '#76513C' }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {acc.isPrimary && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(40,122,85,0.08)', color: '#287A55', border: '1px solid rgba(40,122,85,0.20)' }}>
                      <CheckCircle2 className="w-3 h-3" />
                      Primary
                    </span>
                  )}
                </div>

                <h3 className="text-base font-semibold truncate" style={{ color: '#38271F' }}>{acc.name}</h3>
                <p className="text-xs mt-0.5" style={{ color: '#78685B' }}>{acc.institution}</p>

                <div className="mt-4 pt-3" style={{ borderTop: '1px solid #E6D8C5' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-mono" style={{ color: '#CBAF96' }}>{acc.accountNumberMasked}</p>
                    <span className="text-[10px] font-medium" style={{ color: txCount > 0 ? '#76513C' : '#CBAF96' }}>
                      {txCount > 0 ? `${txCount} ${txCount === 1 ? 'transaction' : 'transactions'}` : 'No activity'}
                    </span>
                  </div>
                  <p className="text-xl font-bold mt-1 font-mono" style={{ color: acc.balance >= 0 ? '#38271F' : '#B94C48' }}>
                    {formatCurrency(acc.balance)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-xs" style={{ borderTop: '1px solid #E6D8C5' }}>
                <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#CBAF96' }}>
                  {acc.type}
                </span>
                <span className="flex items-center gap-1 text-[11px] cursor-pointer transition-colors" style={{ color: '#76513C' }}>
                  View Statements <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Account Modal */}
      {onAddAccount && (
        <AddAccountModal
          isOpen={isAddAccountModalOpen}
          onClose={() => setIsAddAccountModalOpen(false)}
          onSubmit={onAddAccount}
        />
      )}
    </div>
  );
};
