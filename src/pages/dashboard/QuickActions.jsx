import { MapPinned, CalendarDays, Users, BarChart3, Star, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
  const navigate = useNavigate();

  const quickActions = [
    {
      label: 'Add New Place',
      icon: MapPinned,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] border border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)]',
      path: '/place'
    },
    {
      label: 'Create Event',
      icon: CalendarDays,
      color: 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]',
      bg: 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)] border border-[var(--color-warning-border)] dark:border-[var(--color-warning-dark-border)]',
      path: '/events'
    },
    {
      label: 'Manage Users',
      icon: Users,
      color: 'text-[var(--color-purple-text)] dark:text-[var(--color-purple-dark-text)]',
      bg: 'bg-[var(--color-purple-bg)] dark:bg-[var(--color-purple-dark-bg)] border border-[var(--color-purple-border)] dark:border-[var(--color-purple-dark-border)]',
      path: '/users'
    },
    {
      label: 'View Reports',
      icon: BarChart3,
      color: 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]',
      bg: 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] border border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)]',
      path: '/reports'
    },
    {
      label: 'Ratings & Reviews',
      icon: Star,
      color: 'text-[var(--color-rose-badge-text)] dark:text-[var(--color-rose-badge-dark-text)]',
      bg: 'bg-[var(--color-rose-badge-bg)] dark:bg-[var(--color-rose-badge-dark-bg)] border border-[var(--color-rose-badge-border)] dark:border-[var(--color-rose-badge-dark-border)]',
      path: '/ratings'
    },
    {
      label: 'View Category',
      icon: List,
      color: 'text-[var(--color-cyan-badge-text)] dark:text-[var(--color-cyan-badge-dark-text)]',
      bg: 'bg-[var(--color-cyan-badge-bg)] dark:bg-[var(--color-cyan-badge-dark-bg)] border border-[var(--color-cyan-badge-border)] dark:border-[var(--color-cyan-badge-dark-border)]',
      path: '/category'
    }
  ];

  return (
    <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={() => navigate(action.path, (action.label === 'Add New Place' || action.label === 'Create Event') ? { state: { openAdd: true } } : undefined)}
              className={`p-3 ${action.bg} rounded-md hover:brightness-95 transition-colors text-center cursor-pointer flex flex-col items-center justify-center`}
            >
              <Icon className={`w-4 h-4 ${action.color} mb-1`} />
              <span className="text-xs font-medium text-gray-800 dark:text-zinc-200">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
