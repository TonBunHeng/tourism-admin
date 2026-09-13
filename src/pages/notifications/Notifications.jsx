import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Star,
  UserX,
  MessageCircle,
  ShieldAlert,
  Clock,
  ChevronRight,
  Sparkles,
  Info,
  Users,
  RefreshCw,
  Loader2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAlert } from '../../context/AlertContext';
import notificationService from '../../services/notificationService';
import NotificationDetailsModal from './NotificationDetailsModal';

export default function Notifications() {
  const { showConfirm, showSuccess, showError } = useAlert();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab persistence via URL search param + sessionStorage
  const [filterCategory, setFilterCategory] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl.toLowerCase() !== 'security') return tabFromUrl;
    const tabFromStorage = sessionStorage.getItem('notifications_active_tab');
    if (tabFromStorage && tabFromStorage.toLowerCase() !== 'security') return tabFromStorage;
    return 'All';
  });

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Selected Notification for Details Modal
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const categories = ['All', 'Alerts', 'Reviews', 'Messages', 'Users', 'System'];

  // Sync tab state to URL & Storage
  const handleTabChange = (cat) => {
    setFilterCategory(cat);
    sessionStorage.setItem('notifications_active_tab', cat);
    if (cat === 'All') {
      searchParams.delete('tab');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ tab: cat }, { replace: true });
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffSec = Math.floor((now - date) / 1000);

      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHour / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getNotificationIcon = (type, category) => {
    const cat = (category || '').toLowerCase();
    const typ = (type || '').toLowerCase();

    if (cat === 'security' || typ === 'security') {
      return {
        icon: ShieldAlert,
        iconBg: 'bg-red-50 dark:bg-red-950/40',
        iconColor: 'text-red-600 dark:text-red-400'
      };
    }
    if (typ === 'deletion_request' || cat === 'alerts') {
      return {
        icon: UserX,
        iconBg: 'bg-rose-50 dark:bg-rose-950/40',
        iconColor: 'text-rose-600 dark:text-rose-400'
      };
    }
    if (typ === 'review' || cat === 'reviews') {
      return {
        icon: Star,
        iconBg: 'bg-amber-50 dark:bg-amber-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400'
      };
    }
    if (typ === 'chat' || cat === 'messages') {
      return {
        icon: MessageCircle,
        iconBg: 'bg-blue-50 dark:bg-blue-950/40',
        iconColor: 'text-blue-600 dark:text-blue-400'
      };
    }
    if (typ === 'user' || cat === 'users') {
      return {
        icon: Users,
        iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
        iconColor: 'text-indigo-600 dark:text-indigo-400'
      };
    }
    if (typ === 'event') {
      return {
        icon: Calendar,
        iconBg: 'bg-blue-50 dark:bg-blue-950/40',
        iconColor: 'text-blue-600 dark:text-blue-400'
      };
    }
    return {
      icon: Info,
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
      iconColor: 'text-blue-600 dark:text-blue-400'
    };
  };

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = {};
      if (filterCategory !== 'All') {
        params.category = filterCategory;
      }
      if (showUnreadOnly) {
        params.unread_only = true;
      }

      const res = await notificationService.getNotifications(params);
      const data = res?.data || res || [];
      const notifs = Array.isArray(data) ? data : (data.data || []);
      setNotifications(notifs);

      // Meta counts
      if (res?.meta?.unread_count !== undefined) {
        setUnreadCount(res.meta.unread_count);
      } else {
        const unreadRes = await notificationService.getUnreadCount();
        setUnreadCount(unreadRes?.unread_count || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterCategory, showUnreadOnly]);

  useEffect(() => {
    fetchNotifications();

    const handleSync = () => fetchNotifications(true);
    window.addEventListener('notifications-updated', handleSync);
    return () => window.removeEventListener('notifications-updated', handleSync);
  }, [fetchNotifications]);

  const handleOpenDetails = (notification, e) => {
    if (e) e.stopPropagation();
    setSelectedNotification(notification);
    setIsDetailsModalOpen(true);

    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n))
      );
      if (selectedNotification && selectedNotification.id === id) {
        setSelectedNotification(prev => ({ ...prev, read: true }));
      }
      setUnreadCount(prev => Math.max(0, prev - 1));
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const confirmed = await showConfirm({
      title: 'Mark All as Read',
      message: 'Are you sure you want to mark all notifications as read?',
      confirmText: 'Mark All Read',
      type: 'warning'
    });

    if (confirmed) {
      try {
        await notificationService.markAllRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() })));
        setUnreadCount(0);
        window.dispatchEvent(new CustomEvent('notifications-updated'));
      } catch (err) {
        showError(err.message || 'Failed to mark all as read.', 'Error');
      }
    }
  };

  const handleDeleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    const confirmed = await showConfirm({
      title: 'Delete Notification',
      message: 'Are you sure you want to permanently remove this notification?',
      confirmText: 'Delete',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await notificationService.deleteNotification(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (selectedNotification && selectedNotification.id === id) {
          setIsDetailsModalOpen(false);
          setSelectedNotification(null);
        }
        showSuccess('Notification deleted.', 'Success');
        window.dispatchEvent(new CustomEvent('notifications-updated'));
      } catch (err) {
        showError(err.message || 'Failed to delete notification.', 'Error');
      }
    }
  };

  const handleClearAll = async () => {
    const confirmed = await showConfirm({
      title: 'Clear All Notifications',
      message: 'Are you sure you want to clear all notification records? This action cannot be undone.',
      confirmText: 'Clear All',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await notificationService.clearAll();
        setNotifications([]);
        setUnreadCount(0);
        showSuccess('All notifications cleared.', 'Success');
        window.dispatchEvent(new CustomEvent('notifications-updated'));
      } catch (err) {
        showError(err.message || 'Failed to clear notifications.', 'Error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Details Modal */}
      <NotificationDetailsModal
        isOpen={isDetailsModalOpen}
        notification={selectedNotification}
        onClose={() => setIsDetailsModalOpen(false)}
        onMarkRead={handleMarkAsRead}
        onDelete={handleDeleteNotification}
      />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
            Real-time updates for security alerts, tourist reviews, chat messages, and system events
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="py-2 px-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="py-2 px-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
              Mark All Read
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="py-2 px-3.5 rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] p-3 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => handleTabChange(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-[#003E83] dark:bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="rounded-md border-gray-300 text-[#003E83] dark:text-blue-500 focus:ring-[#003E83] dark:focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
            />
            Show unread only ({unreadCount})
          </label>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] shadow-xs overflow-hidden divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)]">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#003E83] dark:text-blue-500 animate-spin" />
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              Fetching real notifications from database...
            </p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => {
            const { icon: Icon, iconBg, iconColor } = getNotificationIcon(
              notification.type,
              notification.category
            );
            const timeLabel = formatTimeAgo(notification.created_at);

            return (
              <div
                key={notification.id}
                onClick={(e) => handleOpenDetails(notification, e)}
                className={`p-4 md:p-5 flex items-start justify-between gap-4 transition-colors hover:bg-gray-50/80 dark:hover:bg-zinc-800/50 cursor-pointer group ${
                  !notification.read ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2 rounded-md shrink-0 ${iconBg}`}>
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                        {notification.category || 'General'}
                      </span>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-md bg-blue-600 shrink-0" />
                      )}
                      <span className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeLabel}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1">
                      {notification.title}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5 leading-relaxed line-clamp-2">
                      {notification.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleOpenDetails(notification, e)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-[#003E83] dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Open details"
                  >
                    <ChevronRight className="w-5 h-5 text-[#003E83] dark:text-blue-400" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
              No {filterCategory !== 'All' ? filterCategory : ''} notifications found
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
              You are all caught up with recent database events!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
