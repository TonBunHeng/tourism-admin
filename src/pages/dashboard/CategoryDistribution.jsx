import { UserCheck, UserX, AlertCircle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CategoryDistribution({ distribution, userStatus }) {
  const navigate = useNavigate();

  const fallbackDistribution = [
    { name: 'Temples', count: 4, color: 'bg-blue-500' },
    { name: 'Historical Sites', count: 3, color: 'bg-purple-500' },
    { name: 'Beaches', count: 2, color: 'bg-cyan-500' },
    { name: 'Nature Parks', count: 2, color: 'bg-emerald-500' },
    { name: 'Markets', count: 1, color: 'bg-amber-500' }
  ];

  const categories = (Array.isArray(distribution) && distribution.length > 0)
    ? distribution
    : fallbackDistribution;

  const totalCategoryCount = categories.reduce((sum, c) => sum + (Number(c.count) || 0), 0) || 1;

  const statusCounts = [
    {
      label: 'Active Users',
      value: userStatus?.active ?? 4,
      icon: UserCheck,
      color: 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]',
      bg: 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]'
    },
    {
      label: 'Inactive Users',
      value: userStatus?.inactive ?? 0,
      icon: UserX,
      color: 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]',
      bg: 'bg-[var(--color-border-light)] dark:bg-[var(--color-surface-hover-dark)]'
    },
    {
      label: 'Suspended',
      value: userStatus?.suspended ?? 0,
      icon: AlertCircle,
      color: 'text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)]',
      bg: 'bg-[var(--color-danger-bg)] dark:bg-[var(--color-danger-dark-bg)]'
    },
    {
      label: 'New This Week',
      value: userStatus?.new_this_week ?? 4,
      icon: UserPlus,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
    }
  ];

  return (
    <div className="lg:col-span-1 bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">Category Distribution</h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Destinations grouped by category</p>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {categories.map((category, index) => {
            const count = Number(category.count) || 0;
            const pct = Math.round((count / totalCategoryCount) * 100);
            return (
              <div key={category.id || index}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] font-medium">{category.name}</span>
                  <span className="text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-semibold">{count} ({pct}%)</span>
                </div>
                <div className="w-full h-2 bg-[var(--color-border-light)] dark:bg-[var(--color-surface-hover-dark)] rounded-md overflow-hidden">
                  <div
                    className={`h-full ${category.color || 'bg-blue-500'} rounded-md transition-all duration-500`}
                    style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Status Summary */}
      <div className="mt-6 pt-6 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-3">User Status Overview</h4>
        <div className="grid grid-cols-2 gap-2.5">
          {statusCounts.map((status, index) => {
            const Icon = status.icon;
            return (
              <div key={index} className={`p-2.5 rounded-md ${status.bg} border border-transparent dark:border-zinc-800`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${status.color} shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] truncate">{status.label}</p>
                    <p className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] leading-tight">{status.value.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
