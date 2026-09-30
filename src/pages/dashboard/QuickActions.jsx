import { useState } from 'react';
import {
  PieChart as PieChartIcon,
  MapPinned,
  CalendarDays,
  Users,
  BarChart3,
  Star,
  List,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const PIE_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#F43F5E', // Rose
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

const fallbackDistribution = [
  { name: 'Temples', count: 4 },
  { name: 'Historical Sites', count: 3 },
  { name: 'Beaches', count: 2 },
  { name: 'Nature Parks', count: 2 },
  { name: 'Markets', count: 1 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] p-2.5 rounded-lg shadow-lg border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] text-xs min-w-[130px]">
        <p className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: data.payload.color || data.fill }}
          />
          {data.name}
        </p>
        <p className="text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
          Places: <strong className="text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{data.value}</strong> ({data.payload.percentage || Math.round(data.percent * 100)}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function QuickActions({ distribution = [], stats = null }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'actions'

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

  const rawCategories = (Array.isArray(distribution) && distribution.length > 0)
    ? distribution
    : fallbackDistribution;

  const totalPlaces = rawCategories.reduce((sum, item) => sum + (Number(item.count) || 0), 0) || 12;

  const pieData = rawCategories.map((item, index) => {
    const count = Number(item.count) || 0;
    const pct = Math.round((count / totalPlaces) * 100);
    return {
      name: item.name,
      value: count,
      percentage: pct,
      color: PIE_COLORS[index % PIE_COLORS.length],
    };
  });

  return (
    <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 flex flex-col justify-between">
      {/* Header with View Toggle */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-1.5">
              {viewMode === 'chart' ? (
                <>
                  <PieChartIcon className="w-4 h-4 text-blue-500" />
                  <span>Category Distribution</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Quick Actions</span>
                </>
              )}
            </h3>
            <p className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {viewMode === 'chart'
                ? 'Destinations grouped by category'
                : 'Platform shortcuts and management'}
            </p>
          </div>

          {/* Toggle pill */}
          <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-md text-[11px] font-medium">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                viewMode === 'chart'
                  ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
              }`}
            >
              Pie Chart
            </button>
            <button
              onClick={() => setViewMode('actions')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                viewMode === 'actions'
                  ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
              }`}
            >
              Actions
            </button>
          </div>
        </div>

        {/* View Content: Pie Chart */}
        {viewMode === 'chart' ? (
          <div>
            {/* Pie / Donut Chart */}
            <div className="h-48 sm:h-52 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Donut Center Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                  {totalPlaces}
                </span>
                <span className="text-[10px] uppercase font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                  Places
                </span>
              </div>
            </div>

            {/* Category Breakdown Badges */}
            <div className="space-y-1.5 mt-2">
              {pieData.slice(0, 4).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-[var(--color-text-primary-light)] dark:text-zinc-300 truncate font-medium">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[var(--color-text-secondary-light)] dark:text-zinc-400 text-[11px]">
                      {cat.value}
                    </span>
                    <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-white">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* View Content: Original Quick Actions Grid */
          <div className="grid grid-cols-2 gap-2.5 py-1">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() =>
                    navigate(
                      action.path,
                      action.label === 'Add New Place' || action.label === 'Create Event'
                        ? { state: { openAdd: true } }
                        : undefined
                    )
                  }
                  className={`p-3 ${action.bg} rounded-md hover:brightness-95 transition-colors text-center cursor-pointer flex flex-col items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 ${action.color} mb-1`} />
                  <span className="text-xs font-medium text-gray-800 dark:text-zinc-200">{action.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Footer Shortcuts */}
      <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
          Quick Links:
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/place', { state: { openAdd: true } })}
            className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5"
          >
            + Place
          </button>
          <span className="text-gray-300 dark:text-zinc-700">•</span>
          <button
            onClick={() => navigate('/events', { state: { openAdd: true } })}
            className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            + Event
          </button>
          <span className="text-gray-300 dark:text-zinc-700">•</span>
          <button
            onClick={() => navigate('/category')}
            className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-zinc-400 hover:text-blue-600 cursor-pointer flex items-center gap-0.5"
          >
            Categories <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
