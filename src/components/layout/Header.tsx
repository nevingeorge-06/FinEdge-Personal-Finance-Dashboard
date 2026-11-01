import React, { useState, useRef, useEffect } from 'react';
import { Menu, Plus, Search, User as UserIcon, LogOut, Shield, ChevronDown } from 'lucide-react';
import { User } from '../../types/auth';
import { AppNotification } from '../../types/notification';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenAddTransaction: () => void;
  activeTab: string;
  onNavigateSettings?: () => void;
  currentUser?: User | null;
  onLogout?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  notifications?: AppNotification[];
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenAddTransaction,
  activeTab,
  onNavigateSettings,
  currentUser,
  onLogout,
  searchQuery = '',
  onSearchChange,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onNavigateTab,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Your financial overview' };
      case 'transactions':
        return { title: 'Transactions', subtitle: 'View and manage your transaction history' };
      case 'budgets':
        return { title: 'Budgets', subtitle: 'Set and track monthly spending limits' };
      case 'analytics':
        return { title: 'Analytics', subtitle: 'Cash flow analysis and spending patterns' };
      case 'accounts':
        return { title: 'Accounts', subtitle: 'Manage linked bank accounts and vaults' };
      case 'settings':
        return { title: 'Settings', subtitle: 'Account preferences and configurations' };
      default:
        return { title: 'Dashboard', subtitle: 'Your financial overview' };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header
      className="sticky top-0 z-30 h-16 bg-cream-50/90 backdrop-blur-md border-b border-cream-400 px-4 sm:px-6 lg:px-8 flex items-center justify-between"
      style={{ boxShadow: '0 1px 8px 0 rgba(56,39,31,0.06)' }}
    >
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-mocha-400 hover:text-mocha-700 hover:bg-cream-300 transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-mocha-800 tracking-tight leading-none">{title}</h2>
          <p className="text-xs text-mocha-400 mt-1 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search, Notifications, CTA, Profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-mocha-300 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search transactions, accounts..."
            className="w-52 lg:w-64 pl-9 pr-8 py-1.5 text-xs bg-cream-100 border border-cream-400 rounded-lg text-mocha-700 placeholder-mocha-300 focus:outline-none focus:border-mocha-500 focus:ring-1 focus:ring-mocha-500/30 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange?.('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-mocha-400 hover:text-mocha-700"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Notifications */}
        <NotificationDropdown
          notifications={notifications}
          onMarkAsRead={onMarkNotificationRead}
          onMarkAllAsRead={onMarkAllNotificationsRead}
          onNavigateTab={onNavigateTab}
        />

        {/* Primary Action Button */}
        <button
          onClick={onOpenAddTransaction}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-cream-50 text-xs sm:text-sm font-medium transition-colors"
          style={{ backgroundColor: '#76513C' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#5D3D2D'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#76513C'; }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Add Transaction</span>
          <span className="xs:hidden">Add</span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative pl-1 border-l border-cream-400" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-cream-300 transition-colors"
            aria-expanded={isProfileOpen}
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-mocha-500 flex items-center justify-center text-xs font-semibold text-cream-50">
              {currentUser?.fullName
                ? currentUser.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'AM'}
            </div>
            <span className="hidden xl:inline text-xs font-medium text-mocha-700">
              {currentUser?.fullName || 'Alex Morgan'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-mocha-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-cream-50 border border-cream-400 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-cream-400">
                <p className="text-xs font-semibold text-mocha-800">
                  {currentUser?.fullName || 'Alex Morgan'}
                </p>
                <p className="text-[11px] text-mocha-400 truncate">
                  {currentUser?.email || 'alex.morgan@finedge.io'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  if (onNavigateSettings) onNavigateSettings();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-mocha-600 hover:bg-cream-300 hover:text-mocha-800 transition-colors text-left"
              >
                <UserIcon className="w-3.5 h-3.5 text-mocha-400" />
                <span>Account Profile</span>
              </button>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  if (onNavigateSettings) onNavigateSettings();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-mocha-600 hover:bg-cream-300 hover:text-mocha-800 transition-colors text-left"
              >
                <Shield className="w-3.5 h-3.5 text-mocha-400" />
                <span>Security &amp; PIN</span>
              </button>
              <div className="border-t border-cream-400 my-1" />
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  if (onLogout) onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-indicator-expense hover:bg-indicator-expense/10 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
