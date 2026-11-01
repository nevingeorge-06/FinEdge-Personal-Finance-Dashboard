import React, { useState, useEffect } from 'react';
import { Settings, User as UserIcon, Bell, Shield, Sliders, CheckCircle2, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { User } from '../../types/auth';
import { Modal } from '../common/Modal';

interface SettingsViewProps {
  onShowToast: (msg: string) => void;
  currentUser?: User | null;
  onClearAllFinancialData?: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onShowToast,
  currentUser,
  onClearAllFinancialData,
}) => {
  const [name, setName] = useState(currentUser?.fullName || 'Alex Morgan');
  const [email, setEmail] = useState(currentUser?.email || 'alex.morgan@finedge.io');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.fullName);
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const [currency, setCurrency] = useState('INR');
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [largeTxAlert, setLargeTxAlert] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    onShowToast('Settings successfully updated');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleConfirmClear = async () => {
    if (!onClearAllFinancialData) return;
    setClearError(null);
    setIsClearing(true);
    try {
      await onClearAllFinancialData();
      setIsConfirmModalOpen(false);
    } catch (err: unknown) {
      setClearError(err instanceof Error ? err.message : 'Failed to clear financial data. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const inputStyle = { backgroundColor: '#F6F0E7', border: '1px solid #D8C6B2', color: '#38271F' };
  const labelStyle = { color: '#78685B' };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#38271F' }}>
          <Settings className="w-5 h-5" style={{ color: '#76513C' }} />
          <span>Account Settings &amp; Preferences</span>
        </h2>
        <p className="text-xs mt-1" style={{ color: '#78685B' }}>
          Manage your personal profile, alert thresholds, and dashboard preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Profile Card */}
        <div className="rounded-xl p-5 shadow-sm" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
          <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid #D8C6B2' }}>
            <UserIcon className="w-4 h-4" style={{ color: '#76513C' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#38271F' }}>Personal Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none transition-colors"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#76513C'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(118,81,60,0.15)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#D8C6B2'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none transition-colors"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#76513C'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(118,81,60,0.15)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#D8C6B2'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          </div>
        </div>

        {/* Currency & Localization */}
        <div className="rounded-xl p-5 shadow-sm" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
          <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid #D8C6B2' }}>
            <Sliders className="w-4 h-4" style={{ color: '#76513C' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#38271F' }}>Preferences &amp; Regional Formatting</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Primary Display Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
                style={inputStyle}
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Fiscal Month Start Date</label>
              <select
                defaultValue="1"
                className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
                style={inputStyle}
              >
                <option value="1">1st of Month (Calendar default)</option>
                <option value="15">15th of Month</option>
                <option value="25">25th of Month (Salary cycle)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Toggles */}
        <div className="rounded-xl p-5 shadow-sm" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
          <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid #D8C6B2' }}>
            <Bell className="w-4 h-4" style={{ color: '#76513C' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#38271F' }}>Notifications &amp; Alerts</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors" style={{ backgroundColor: '#F6F0E7', borderColor: '#E6D8C5' }}>
              <div>
                <p className="text-xs font-medium" style={{ color: '#38271F' }}>Budget Threshold Warning Alerts</p>
                <p className="text-[11px]" style={{ color: '#78685B' }}>Receive in-app visual indicators when spending exceeds 80%</p>
              </div>
              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={(e) => setBudgetAlerts(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: '#76513C' }}
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors" style={{ backgroundColor: '#F6F0E7', borderColor: '#E6D8C5' }}>
              <div>
                <p className="text-xs font-medium" style={{ color: '#38271F' }}>Weekly Cash Flow Summary</p>
                <p className="text-[11px]" style={{ color: '#78685B' }}>Digest of income and category expenditures every Monday</p>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: '#76513C' }}
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors" style={{ backgroundColor: '#F6F0E7', borderColor: '#E6D8C5' }}>
              <div>
                <p className="text-xs font-medium" style={{ color: '#38271F' }}>Large Transaction Flags</p>
                <p className="text-[11px]" style={{ color: '#78685B' }}>Highlight individual expenses exceeding ₹10,000</p>
              </div>
              <input
                type="checkbox"
                checked={largeTxAlert}
                onChange={(e) => setLargeTxAlert(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: '#76513C' }}
              />
            </label>
          </div>
        </div>

        {/* Security & Authentication */}
        <div className="rounded-xl p-5 shadow-sm" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
          <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid #D8C6B2' }}>
            <Shield className="w-4 h-4" style={{ color: '#76513C' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#38271F' }}>Security &amp; Data Privacy</h3>
          </div>

          <div className="flex items-center justify-between text-xs" style={{ color: '#78685B' }}>
            <div>
              <p className="font-medium" style={{ color: '#38271F' }}>Two-Factor Authentication (2FA)</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#CBAF96' }}>Biometric and TOTP authenticator app verification</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium" style={{ backgroundColor: 'rgba(40,122,85,0.08)', color: '#287A55', border: '1px solid rgba(40,122,85,0.20)' }}>
              Enabled
            </span>
          </div>
        </div>

        {/* Data Management & Danger Zone */}
        {onClearAllFinancialData && (
          <div
            className="rounded-xl p-5 shadow-sm"
            style={{
              backgroundColor: '#FFFDF8',
              border: '1px solid rgba(185, 76, 72, 0.35)',
            }}
          >
            <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid rgba(185, 76, 72, 0.20)' }}>
              <Trash2 className="w-4 h-4" style={{ color: '#B94C48' }} />
              <h3 className="text-sm font-semibold" style={{ color: '#B94C48' }}>Data Management &amp; Privacy</h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold" style={{ color: '#38271F' }}>Clear All Financial Records</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#78685B' }}>
                  Permanently wipe all income, expenses, budgets, and connected accounts. Your login account and authentication credentials will remain intact.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setClearError(null);
                  setIsConfirmModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 border"
                style={{
                  backgroundColor: 'rgba(185, 76, 72, 0.08)',
                  color: '#B94C48',
                  borderColor: 'rgba(185, 76, 72, 0.30)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#B94C48';
                  (e.currentTarget as HTMLButtonElement).style.color = '#FFFDF8';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(185, 76, 72, 0.08)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#B94C48';
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Financial Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isSaved && (
            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#287A55' }}>
              <CheckCircle2 className="w-4 h-4" />
              Saved successfully
            </span>
          )}
          <button
            type="submit"
            className="px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
            style={{ backgroundColor: '#76513C', color: '#FFFDF8' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#5D3D2D'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#76513C'; }}
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Confirmation Dialog for Clearing Financial Data */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          if (!isClearing) setIsConfirmModalOpen(false);
        }}
        title="Permanently Clear Financial Data?"
        subtitle="This action will delete your records and cannot be undone."
        maxWidth="md"
      >
        <div className="space-y-4">
          {clearError && (
            <div
              className="p-3 rounded-lg text-xs"
              style={{ backgroundColor: 'rgba(185,76,72,0.08)', border: '1px solid rgba(185,76,72,0.20)', color: '#B94C48' }}
            >
              {clearError}
            </div>
          )}

          <div
            className="p-3.5 rounded-lg flex items-start gap-2.5 text-xs"
            style={{
              backgroundColor: 'rgba(185, 76, 72, 0.08)',
              border: '1px solid rgba(185, 76, 72, 0.25)',
              color: '#B94C48',
            }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Are you sure you want to proceed?</p>
              <p className="mt-1 leading-relaxed">
                You are about to permanently delete all financial records associated with this account.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs" style={{ color: '#38271F' }}>
            <p className="font-semibold" style={{ color: '#76513C' }}>The following will be permanently removed:</p>
            <ul className="list-disc list-inside space-y-1 pl-1" style={{ color: '#78685B' }}>
              <li>All recorded Income &amp; Expense transactions</li>
              <li>All monthly category budgets and spending limits</li>
              <li>All connected financial accounts and balance history</li>
              <li>All historical cash flow and category expense analytics</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: '#F6F0E7', border: '1px solid #D8C6B2', color: '#78685B' }}>
            <span className="font-semibold" style={{ color: '#38271F' }}>Preserved:</span> Your login credentials, user profile (<span className="font-mono text-[11px]">{email}</span>), and security preferences will remain active.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3" style={{ borderTop: '1px solid #D8C6B2' }}>
            <button
              type="button"
              disabled={isClearing}
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{ color: '#78685B' }}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isClearing}
              onClick={handleConfirmClear}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-sm"
              style={{ backgroundColor: '#B94C48', color: '#FFFDF8' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#993C39'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#B94C48'; }}
            >
              {isClearing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Clearing Data...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Delete Financial Records</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
