import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { NewTransactionPayload, TransactionType, TransactionCategory, PaymentMethod } from '../../types/transaction';
import { CATEGORIES, PAYMENT_METHODS } from '../../utils/constants';
import { Plus, Loader2 } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: NewTransactionPayload) => Promise<void>;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState<TransactionCategory>('Food & Dining');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [account, setAccount] = useState('Priority Checking (HDFC)');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const parsedAmount = parseFloat(amount);
    if (!description.trim()) {
      setErrorMessage('Please enter a transaction description.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid amount greater than zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        description: description.trim(),
        amount: parsedAmount,
        type,
        category,
        paymentMethod,
        account,
        date,
        notes: notes.trim() || undefined,
      });

      setDescription('');
      setAmount('');
      setNotes('');
      setType('EXPENSE');
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = { backgroundColor: '#F6F0E7', border: '1px solid #D8C6B2', color: '#38271F' };
  const labelStyle = { color: '#78685B' };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Transaction"
      subtitle="Enter transaction details below"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'rgba(185,76,72,0.08)', border: '1px solid rgba(185,76,72,0.20)', color: '#B94C48' }}>
            {errorMessage}
          </div>
        )}

        {/* Transaction Type Pill Selector */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Transaction Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setType('EXPENSE');
                setCategory('Food & Dining');
              }}
              className="py-2 px-3 rounded-lg text-xs font-medium transition-colors border"
              style={type === 'EXPENSE'
                ? { backgroundColor: 'rgba(185,76,72,0.08)', color: '#B94C48', borderColor: 'rgba(185,76,72,0.30)' }
                : { backgroundColor: '#F6F0E7', color: '#78685B', borderColor: '#D8C6B2' }
              }
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('INCOME');
                setCategory('Salary');
              }}
              className="py-2 px-3 rounded-lg text-xs font-medium transition-colors border"
              style={type === 'INCOME'
                ? { backgroundColor: 'rgba(40,122,85,0.08)', color: '#287A55', borderColor: 'rgba(40,122,85,0.30)' }
                : { backgroundColor: '#F6F0E7', color: '#78685B', borderColor: '#D8C6B2' }
              }
            >
              Income (+)
            </button>
          </div>
        </div>

        {/* Description & Amount row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Description *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Grocery Store, Cloud Services"
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Amount (₹) *</label>
            <input
              type="number"
              required
              min="0.01"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1500"
              className="w-full px-3 py-2 rounded-lg text-xs font-mono focus:outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
              style={inputStyle}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
              style={inputStyle}
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Account & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Account</label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
              style={inputStyle}
            >
              <option value="Priority Checking (HDFC)">Priority Checking (HDFC)</option>
              <option value="High Yield Savings (ICICI)">High Yield Savings (ICICI)</option>
              <option value="Zerodha Wealth Portfolio">Zerodha Wealth Portfolio</option>
              <option value="Cash Wallet">Cash Wallet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Notes (Optional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add memo or reference information..."
            className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
            style={inputStyle}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3" style={{ borderTop: '1px solid #D8C6B2' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ color: '#78685B' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#76513C', color: '#FFFDF8' }}
            onMouseEnter={(e) => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#5D3D2D'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#76513C'; }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Save Transaction</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
