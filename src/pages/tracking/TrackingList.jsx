import React from 'react';
import { Eye, Trash2, Clock, Activity, PlusCircle, CheckCircle2, AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { getRoleColor, formatRoleLabel } from '../../utils/StatusUtils';

export default function TrackingList({
  logs = [],
  startIndex = 0,
  loading = false,
  isSuperAdmin = false,
  onViewDetails,
  onDeleteLog,
}) {
  const getActionBadge = (action) => {
    const act = (action || '').toLowerCase();
    if (act.includes('create') || act.includes('store')) {
      return {
        label: action.replace(/_/g, ' ').toUpperCase(),
        style: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
        icon: PlusCircle,
      };
    }
    if (act.includes('approve') || act.includes('verify') || act.includes('activate')) {
      return {
        label: action.replace(/_/g, ' ').toUpperCase(),
        style: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
        icon: CheckCircle2,
      };
    }
    if (act.includes('reject') || act.includes('suspend') || act.includes('block')) {
      return {
        label: action.replace(/_/g, ' ').toUpperCase(),
        style: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/50',
        icon: AlertCircle,
      };
    }
    if (act.includes('delete') || act.includes('destroy') || act.includes('clear')) {
      return {
        label: action.replace(/_/g, ' ').toUpperCase(),
        style: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800/50',
        icon: Trash2,
      };
    }
    if (act.includes('login') || act.includes('auth')) {
      return {
        label: action.replace(/_/g, ' ').toUpperCase(),
        style: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/50',
        icon: LogIn,
      };
    }
    return {
      label: action.replace(/_/g, ' ').toUpperCase(),
      style: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800/50',
      icon: RefreshCw,
    };
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return { relative: 'Just now', full: '' };
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    let relative = '';
    if (diffSec < 60) relative = 'Just now';
    else if (diffMin < 60) relative = `${diffMin}m ago`;
    else if (diffHr < 24) relative = `${diffHr}h ago`;
    else if (diffDays === 1) relative = 'Yesterday';
    else if (diffDays < 7) relative = `${diffDays}d ago`;
    else relative = date.toLocaleDateString();

    const full = date.toLocaleString();
    return { relative, full };
  };

  const safeLogs = Array.isArray(logs) ? logs : [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)] table-auto">
        <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50 border-b border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]">
          <tr>
            <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center font-mono">
              #
            </th>
            <th className="px-4 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
              USER
            </th>
            <th className="px-4 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
              ROLE
            </th>
            <th className="px-4 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
              ACTION
            </th>
            <th className="px-4 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
              TARGET ITEM
            </th>
            <th className="px-4 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
              DESCRIPTION
            </th>
            <th className="px-4 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
              DATE & TIME
            </th>
            <th className="px-4 py-3.5 text-right text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
          {safeLogs.length > 0 ? (
            safeLogs.map((log, index) => {
              const role = log.user_role || log.user?.role || 'admin';
              const actionInfo = getActionBadge(log.action);
              const ActionIcon = actionInfo.icon;
              const timeData = formatTimestamp(log.created_at);
              const userName = log.user_name || log.user?.name || 'Staff User';
              const userEmail = log.user?.email || (log.ip_address ? `IP: ${log.ip_address}` : 'staff@angkorverses.com');

              return (
                <tr
                  key={log.id}
                  className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors group"
                >
                  {/* Row Index # */}
                  <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                    {startIndex + index + 1}
                  </td>

                  {/* User info: Avatar + Name + Email */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700 overflow-hidden font-bold text-xs text-[#003E83] dark:text-blue-400">
                        {log.user?.avatar ? (
                          <img src={log.user.avatar} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{userName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                          {userName}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                          {userEmail}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role Column */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getRoleColor(role)}`}>
                      {formatRoleLabel(role)}
                    </span>
                  </td>

                  {/* Action Column */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${actionInfo.style}`}>
                      <ActionIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{actionInfo.label}</span>
                    </span>
                  </td>

                  {/* Target Resource */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {log.entity_type ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700">
                        <span>{log.entity_type}</span>
                        {log.entity_id && (
                          <span className="text-gray-400 dark:text-zinc-500 font-mono">#{log.entity_id}</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-xs">—</span>
                    )}
                  </td>

                  {/* Description: Short single-line truncated text that naturally fits the table width */}
                  <td className="px-4 py-3.5 max-w-xs md:max-w-sm">
                    <p
                      className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] truncate"
                      title={log.description}
                    >
                      {log.description || '—'}
                    </p>
                  </td>

                  {/* Date & Time */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]" title={timeData.full}>
                    <div className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted-light)] shrink-0" />
                      <span>{timeData.relative}</span>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right text-xs">
                    <div className="flex items-center justify-end gap-1">
                      {/* View details */}
                      <button
                        type="button"
                        onClick={() => onViewDetails(log)}
                        className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Super Admin Delete record if permitted */}
                      {isSuperAdmin && onDeleteLog && (
                        <button
                          type="button"
                          onClick={() => onDeleteLog(log)}
                          className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title="Delete Activity Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-12 px-4">
                <Activity className="w-12 h-12 text-[#003E83] dark:text-blue-500 mx-auto mb-2 opacity-80" />
                <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
                  No activities found
                </h3>
                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                  Try adjusting your search or role filter criteria
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
