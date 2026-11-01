import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  TrendingUp,
  Wallet,
  Settings,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { User } from '../../types/auth';

export type ActiveTab = 'dashboard' | 'transactions' | 'budgets' | 'analytics' | 'accounts' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentUser?: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  currentUser,
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as ActiveTab, label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budgets' as ActiveTab, label: 'Budgets', icon: PieChart },
    { id: 'analytics' as ActiveTab, label: 'Analytics', icon: TrendingUp },
    { id: 'accounts' as ActiveTab, label: 'Accounts', icon: Wallet },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-mocha-800/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-cream-50 border-r border-cream-400 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ boxShadow: '2px 0 12px 0 rgba(56,39,31,0.06)' }}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-cream-400">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-mocha-500/10 border border-mocha-500/25 flex items-center justify-center text-mocha-500">
              <Shield className="w-5 h-5" style={{ fill: 'rgba(118,81,60,0.15)', stroke: '#76513C' }} />
            </div>
            <div>
              <h1 className="font-bold text-mocha-800 text-base tracking-tight leading-none">
                FinEdge
              </h1>
              <p className="text-[11px] text-mocha-400 mt-1 font-normal tracking-normal">
                Smarter Spending, Better Living
              </p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-mocha-300 mb-2">
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-mocha-500/10 text-mocha-600 font-semibold border border-mocha-500/20'
                    : 'text-mocha-400 hover:text-mocha-700 hover:bg-cream-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-mocha-500' : 'text-mocha-300'
                    }`}
                  />
                  {item.label}
                </div>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-mocha-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User profile footer */}
        {currentUser && (
          <div className="p-4 border-t border-cream-400">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-mocha-500 flex items-center justify-center text-cream-50 text-xs font-bold shrink-0">
                {currentUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-mocha-700 truncate">{currentUser.fullName}</p>
                <p className="text-[10px] text-mocha-400 truncate">{currentUser.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
