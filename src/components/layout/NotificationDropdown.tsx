import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Check,
  Sparkles,
} from 'lucide-react';
import { AppNotification, NotificationType } from '../../types/notification';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle clicking outside and pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'ALERT':
        return <AlertCircle className="w-4 h-4 shrink-0 text-[#B94C48]" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 shrink-0 text-[#B77925]" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 shrink-0 text-[#287A55]" />;
      case 'INFO':
      default:
        return <Info className="w-4 h-4 shrink-0 text-[#567A91]" />;
    }
  };

  const getBgStyle = (type: NotificationType, read: boolean) => {
    if (read) return { backgroundColor: '#FFFDF8', opacity: 0.85 };
    switch (type) {
      case 'ALERT':
        return { backgroundColor: 'rgba(185, 76, 72, 0.05)' };
      case 'WARNING':
        return { backgroundColor: 'rgba(183, 121, 37, 0.05)' };
      case 'SUCCESS':
        return { backgroundColor: 'rgba(40, 122, 85, 0.05)' };
      case 'INFO':
      default:
        return { backgroundColor: 'rgba(86, 122, 145, 0.05)' };
    }
  };

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.linkTab && onNavigateTab) {
      onNavigateTab(notification.linkTab);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-lg text-mocha-400 hover:text-mocha-700 hover:bg-cream-300 transition-colors focus:outline-none"
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 flex items-center justify-center min-w-[15px] h-[15px] px-1 text-[9px] font-bold text-cream-50 rounded-full"
            style={{ backgroundColor: '#B94C48' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col"
          style={{
            backgroundColor: '#FFFDF8',
            border: '1px solid #D8C6B2',
            boxShadow: '0 10px 25px -5px rgba(56, 39, 31, 0.15)',
          }}
        >
          {/* Header */}
          <div
            className="p-3.5 flex items-center justify-between border-b"
            style={{ borderColor: '#D8C6B2', backgroundColor: '#F6F0E7' }}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold" style={{ color: '#38271F' }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ backgroundColor: 'rgba(118, 81, 60, 0.15)', color: '#76513C' }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && onMarkAllAsRead && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] font-medium flex items-center gap-1 transition-colors hover:underline"
                style={{ color: '#76513C' }}
              >
                <Check className="w-3 h-3" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: '#E6D8C5' }}>
            {notifications.length === 0 ? (
              /* Friendly Empty State */
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-2.5"
                  style={{ backgroundColor: 'rgba(40, 122, 85, 0.1)', color: '#287A55' }}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#38271F' }}>
                  You're all caught up!
                </p>
                <p className="text-xs mt-1" style={{ color: '#78685B' }}>
                  No new budget warnings or activity alerts at this time.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className="p-3 flex items-start gap-2.5 transition-colors cursor-pointer hover:bg-cream-200/50"
                  style={getBgStyle(n.type, n.read)}
                >
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs truncate ${n.read ? 'font-medium' : 'font-semibold'}`}
                        style={{ color: '#38271F' }}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: '#76513C' }}
                          title="Unread"
                        />
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#78685B' }}>
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 text-[10px]" style={{ color: '#CBAF96' }}>
                      <span>{n.timestamp}</span>
                      {n.linkTab && (
                        <span className="font-medium hover:underline" style={{ color: '#76513C' }}>
                          View details &rarr;
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
