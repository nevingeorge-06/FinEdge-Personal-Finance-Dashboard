import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { AccountType, NewAccountPayload } from '../../types/account';
import { Landmark, Loader2 } from 'lucide-react';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: NewAccountPayload) => Promise<void>;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('INVESTMENT');
  const [balance, setBalance] = useState('');
  const [institution, setInstitution] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter an account name.');
      return;
    }

    const parsedBalance = balance ? parseFloat(balance) : 0;
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      setErrorMessage('Please enter a valid balance (₹0 or greater).');
      return;
    }

    const masked = accountNumber.trim()
      ? (accountNumber.trim().startsWith('•') ? accountNumber.trim() : `•••• ${accountNumber.trim().slice(-4)}`)
      : `•••• ${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        type,
        balance: parsedBalance,
        openingBalance: parsedBalance,
        institution: institution.trim() || (type === 'INVESTMENT' ? 'Direct Broking' : 'Commercial Bank'),
        accountNumberMasked: masked,
        currency: 'INR',
        isPrimary,
      });

      setName('');
      setBalance('');
      setInstitution('');
      setAccountNumber('');
      setType('INVESTMENT');
      setIsPrimary(false);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save account.');
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
      title="Connect New Account"
      subtitle="Register an investment portfolio, bank account, or wallet"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div
            className="p-3 rounded-lg text-xs"
            style={{ backgroundColor: 'rgba(185,76,72,0.08)', border: '1px solid rgba(185,76,72,0.20)', color: '#B94C48' }}
          >
            {errorMessage}
          </div>
        )}

        {/* Account Type Selector */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Account Type *</label>
          <div className="grid grid-cols-3 gap-2">
            {(['INVESTMENT', 'CHECKING', 'SAVINGS'] as AccountType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className="py-2 px-3 rounded-lg text-xs font-medium transition-colors border"
                style={type === t
                  ? { backgroundColor: '#76513C', color: '#FFFDF8', borderColor: '#76513C' }
                  : { backgroundColor: '#F6F0E7', color: '#78685B', borderColor: '#D8C6B2' }
                }
              >
                {t === 'INVESTMENT' ? 'Investment' : t === 'CHECKING' ? 'Checking' : 'Savings'}
              </button>
            ))}
          </div>
        </div>

        {/* Account Name */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
            {type === 'INVESTMENT' ? 'Portfolio / Account Name *' : 'Account Name *'}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === 'INVESTMENT' ? 'e.g. Zerodha Equities, Groww MF' : 'e.g. HDFC Salary, ICICI Savings'}
            className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
            style={inputStyle}
          />
        </div>

        {/* Opening Balance / Investment Amount */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
            {type === 'INVESTMENT' ? 'Initial Investment / Opening Balance (₹) *' : 'Opening Balance (₹) *'}
          </label>
          <input
            type="number"
            required
            min="0"
            step="any"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="e.g. 50000"
            className="w-full px-3 py-2 rounded-lg text-xs font-mono focus:outline-none"
            style={inputStyle}
          />
          <p className="text-[11px] mt-1" style={{ color: '#78685B' }}>
            {type === 'INVESTMENT'
              ? 'Current holding value or starting invested capital'
              : 'Initial cleared account balance'}
          </p>
        </div>

        {/* Institution & Account Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
              {type === 'INVESTMENT' ? 'Broker / Platform' : 'Institution / Bank'}
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder={type === 'INVESTMENT' ? 'e.g. Zerodha, Groww' : 'e.g. HDFC Bank, SBI'}
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Account / Demat No. (Optional)</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. 9931 (Last 4 digits)"
              className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Primary checkbox */}
        <label className="flex items-center gap-2 pt-1 text-xs cursor-pointer select-none" style={{ color: '#38271F' }}>
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="rounded"
            style={{ accentColor: '#76513C' }}
          />
          <span>Set as primary account</span>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3" style={{ borderTop: '1px solid #D8C6B2' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ color: '#78685B' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-sm"
            style={{ backgroundColor: '#76513C', color: '#FFFDF8' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Landmark className="w-3.5 h-3.5" />
                <span>Save Account</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
