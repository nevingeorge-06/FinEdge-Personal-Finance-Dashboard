import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { NewBudgetPayload } from '../../types/budget';
import { TransactionCategory } from '../../types/transaction';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { getCategoryColor } from '../../utils/formatters';
import { Plus, Loader2 } from 'lucide-react';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: NewBudgetPayload) => Promise<void>;
}

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [category, setCategory] = useState<TransactionCategory>('Groceries');
  const [allocatedAmount, setAllocatedAmount] = useState('');
  const [alertThresholdPercent, setAlertThresholdPercent] = useState('80');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const parsedAmount = parseFloat(allocatedAmount);
    const parsedThreshold = parseInt(alertThresholdPercent, 10);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid budget amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        category,
        allocatedAmount: parsedAmount,
        period: 'MONTHLY',
        color: getCategoryColor(category),
        alertThresholdPercent: isNaN(parsedThreshold) ? 80 : parsedThreshold,
      });

      setAllocatedAmount('');
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save budget.');
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
      title="Create Budget Target"
      subtitle="Define monthly spending cap & warning threshold"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'rgba(185,76,72,0.08)', border: '1px solid rgba(185,76,72,0.20)', color: '#B94C48' }}>
            {errorMessage}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TransactionCategory)}
            className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
            style={inputStyle}
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
            Monthly Limit Allocation (₹) *
          </label>
          <input
            type="number"
            required
            min="100"
            step="100"
            value={allocatedAmount}
            onChange={(e) => setAllocatedAmount(e.target.value)}
            placeholder="e.g. 5000"
            className="w-full px-3 py-2 rounded-lg text-xs font-mono focus:outline-none"
            style={inputStyle}
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium" style={labelStyle}>Warning Alert Threshold</span>
            <span className="font-semibold" style={{ color: '#76513C' }}>{alertThresholdPercent}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={alertThresholdPercent}
            onChange={(e) => setAlertThresholdPercent(e.target.value)}
            className="w-full h-2 rounded-lg cursor-pointer"
            style={{ accentColor: '#76513C' }}
          />
          <p className="text-[11px] mt-1" style={{ color: '#CBAF96' }}>
            FinEdge highlights budgets when expenditures exceed this threshold.
          </p>
        </div>

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
                <span>Save Budget</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
