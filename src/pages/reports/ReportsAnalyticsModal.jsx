import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Database,
  Download,
  CheckCircle2,
  Award
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import reportService from '../../services/reportService';

export default function ReportsAnalyticsModal({
  isOpen,
  onClose,
  datasets = {},
  totalExports = 0,
  activeTab = 'ALL'
}) {
  const [timeframe, setTimeframe] = useState('2026');
  const [selectedDataset, setSelectedDataset] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [apiAnalytics, setApiAnalytics] = useState(null);

  const places = useMemo(() => (Array.isArray(datasets.places) ? datasets.places : []), [datasets.places]);
  const events = useMemo(() => (Array.isArray(datasets.events) ? datasets.events : []), [datasets.events]);
  const users = useMemo(() => (Array.isArray(datasets.users) ? datasets.users : []), [datasets.users]);
  const reviews = useMemo(() => (Array.isArray(datasets.reviews) ? datasets.reviews : []), [datasets.reviews]);
  const categories = useMemo(() => (Array.isArray(datasets.categories) ? datasets.categories : []), [datasets.categories]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      reportService.getAnalytics({
        timeframe,
        dataset: selectedDataset,
        status: statusFilter
      })
        .then(res => {
          if (res?.success && res?.data) {
            setApiAnalytics(res.data);
          }
        })
        .catch(() => {
          // Fallback to local dataset calculations
        });
    }
  }, [isOpen, timeframe, selectedDataset, statusFilter]);

  // Total records calculation based on selected dataset
  const currentDatasetItems = useMemo(() => {
    switch (selectedDataset) {
      case 'places': return places;
      case 'events': return events;
      case 'users': return users;
      case 'reviews': return reviews;
      case 'categories': return categories;
      default: return [...places, ...events, ...users, ...reviews, ...categories];
    }
  }, [selectedDataset, places, events, users, reviews, categories]);

  // Filter items by status if statusFilter is active
  const filteredItems = useMemo(() => {
    if (statusFilter === 'ALL') return currentDatasetItems;
    return currentDatasetItems.filter(item => {
      const s = (item.status || '').toLowerCase();
      if (statusFilter === 'Active') return s === 'active' || s === 'published' || s === 'approved';
      if (statusFilter === 'Pending') return s === 'pending' || s === 'upcoming';
      if (statusFilter === 'Archived') return s === 'archived' || s === 'inactive' || s === 'completed';
      return true;
    });
  }, [currentDatasetItems, statusFilter]);

  const totalRecords = filteredItems.length;
  const globalTotalRecords = places.length + events.length + users.length + reviews.length + categories.length;

  // Active items calculation
  const { activeCount, activePct } = useMemo(() => {
    const itemsToCheck = currentDatasetItems;
    if (itemsToCheck.length === 0) return { activeCount: 0, activePct: 100 };
    const active = itemsToCheck.filter(item => {
      const s = (item.status || 'active').toLowerCase();
      return s === 'active' || s === 'published' || s === 'approved' || s === 'upcoming';
    }).length;
    return {
      activeCount: active,
      activePct: Math.round((active / itemsToCheck.length) * 100)
    };
  }, [currentDatasetItems]);

  // Quality & Rating score
  const avgScore = useMemo(() => {
    const rated = [
      ...places.map(p => Number(p.rating)),
      ...reviews.map(r => Number(r.rating))
    ].filter(r => !isNaN(r) && r > 0);
    return rated.length > 0
      ? (rated.reduce((sum, r) => sum + r, 0) / rated.length).toFixed(1)
      : '5.0';
  }, [places, reviews]);

  // Real Monthly Ingestion Trends
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const targetYear = timeframe === '2025' ? 2025 : timeframe === '2026' ? 2026 : null;
    const monthCounts = new Array(12).fill(0);

    const dates = [];
    currentDatasetItems.forEach(item => {
      const dStr = item.createdAt || item.startDate || item.joinedDate || item.date || item.created_at;
      if (dStr) dates.push(dStr);
    });

    dates.forEach(dStr => {
      const d = new Date(dStr);
      if (!isNaN(d.getTime())) {
        if (!targetYear || d.getFullYear() === targetYear) {
          monthCounts[d.getMonth()] += 1;
          return;
        }
      }
      // If no valid date or matches current year
      const currentYear = new Date().getFullYear();
      if (!targetYear || targetYear === currentYear) {
        monthCounts[new Date().getMonth()] += 1;
      }
    });

    let runningIngested = 0;
    return months.map((month, idx) => {
      const count = monthCounts[idx];
      runningIngested += count;
      return {
        month,
        recordsIngested: count,
        cumulative: runningIngested
      };
    });
  }, [currentDatasetItems, timeframe]);

  // Composition Breakdown
  const compositionData = useMemo(() => {
    const palette = ['bg-[#003E83]', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-cyan-500'];

    if (selectedDataset === 'ALL') {
      const total = globalTotalRecords || 1;
      return [
        { name: 'Places & Attractions', count: places.length, percentage: Math.round((places.length / total) * 100), color: palette[0] },
        { name: 'Events & Festivals', count: events.length, percentage: Math.round((events.length / total) * 100), color: palette[1] },
        { name: 'Users & Accounts', count: users.length, percentage: Math.round((users.length / total) * 100), color: palette[2] },
        { name: 'Ratings & Reviews', count: reviews.length, percentage: Math.round((reviews.length / total) * 100), color: palette[3] },
        { name: 'Categories', count: categories.length, percentage: Math.round((categories.length / total) * 100), color: palette[4] }
      ].filter(item => item.count > 0);
    }

    // Specific dataset breakdown
    const map = {};
    if (selectedDataset === 'places') {
      places.forEach(p => {
        const key = p.category || 'General';
        map[key] = (map[key] || 0) + 1;
      });
    } else if (selectedDataset === 'events') {
      events.forEach(e => {
        const key = e.status || 'Upcoming';
        map[key] = (map[key] || 0) + 1;
      });
    } else if (selectedDataset === 'users') {
      users.forEach(u => {
        const key = u.role || 'User';
        map[key] = (map[key] || 0) + 1;
      });
    } else if (selectedDataset === 'reviews') {
      reviews.forEach(r => {
        const key = `${r.rating || 5} Stars`;
        map[key] = (map[key] || 0) + 1;
      });
    } else if (selectedDataset === 'categories') {
      categories.forEach(c => {
        const key = c.name || 'Category';
        map[key] = (map[key] || 0) + 1;
      });
    }

    const total = currentDatasetItems.length || 1;
    return Object.entries(map).map(([name, count], idx) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
      color: palette[idx % palette.length]
    }));
  }, [selectedDataset, globalTotalRecords, places, events, users, reviews, categories, currentDatasetItems]);

  // Real Status Breakdown
  const statusBreakdownData = useMemo(() => {
    let active = 0;
    let pending = 0;
    let archived = 0;

    currentDatasetItems.forEach(item => {
      const s = (item.status || 'active').toLowerCase();
      if (s === 'active' || s === 'published' || s === 'approved') {
        active += 1;
      } else if (s === 'pending' || s === 'upcoming') {
        pending += 1;
      } else {
        archived += 1;
      }
    });

    const total = currentDatasetItems.length || 1;
    return [
      { label: 'Active / Published', count: active, percentage: Math.round((active / total) * 100), color: 'bg-emerald-500' },
      { label: 'Pending / Upcoming', count: pending, percentage: Math.round((pending / total) * 100), color: 'bg-amber-500' },
      { label: 'Archived / Inactive', count: archived, percentage: Math.round((archived / total) * 100), color: 'bg-gray-400' }
    ];
  }, [currentDatasetItems]);

  const isFilterActive = timeframe !== '2026' || selectedDataset !== 'ALL' || statusFilter !== 'ALL';

  const handleReset = () => {
    setTimeframe('2026');
    setSelectedDataset('ALL');
    setStatusFilter('ALL');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity duration-150 animate-alert-backdrop">
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)] rounded-md max-w-4xl w-full max-h-[90vh] shadow-lg border border-gray-200 dark:border-zinc-800 overflow-hidden flex flex-col animate-alert-popup">
        
        {/* Simple Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">
              Reports & Database Analytics Overview
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Live record volume, status composition, and data distribution
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Dataset Selector */}
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-zinc-700 rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-gray-700 dark:text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#003E83] cursor-pointer"
            >
              <option value="ALL">All Datasets (Global)</option>
              <option value="places">Places & Attractions</option>
              <option value="events">Events & Festivals</option>
              <option value="users">Users & Accounts</option>
              <option value="reviews">Ratings & Reviews</option>
              <option value="categories">Categories</option>
            </select>

            {/* Status Selector */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-zinc-700 rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-gray-700 dark:text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#003E83] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active / Published</option>
              <option value="Pending">Pending / Upcoming</option>
              <option value="Archived">Archived / Inactive</option>
            </select>

            {/* Timeframe Selector */}
            <div className="inline-flex rounded-md border border-gray-300 dark:border-zinc-700 overflow-hidden bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)]">
              {['2026', '2025', 'ALL'].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    timeframe === tf
                      ? 'bg-[#003E83] text-white'
                      : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {isFilterActive && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total DB Records */}
            <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 font-medium">
                <span>Total Records</span>
                <Database className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mt-2">
                {totalRecords}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                {selectedDataset === 'ALL' ? `${globalTotalRecords} across all datasets` : `${selectedDataset} entries`}
              </p>
            </div>

            {/* Card 2: Exports Generated */}
            <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 font-medium">
                <span>Exports Generated</span>
                <Download className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mt-2">
                {totalExports}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                PDF & Excel downloads
              </p>
            </div>

            {/* Card 3: Active / Verified Rate */}
            <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 font-medium">
                <span>Active Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mt-2">
                {activePct}%
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                {activeCount} active records
              </p>
            </div>

            {/* Card 4: Quality & Rating Score */}
            <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 font-medium">
                <span>Average Rating</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mt-2">
                {avgScore} ★
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                Destination review satisfaction
              </p>
            </div>
          </div>

          {/* Monthly Ingestion Chart */}
          <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 border border-gray-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                  Record Ingestion Activity ({timeframe})
                </h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Monthly new records and cumulative database volume
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md bg-[#003E83]" />
                  New Records
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-500" />
                  Cumulative Total
                </span>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF" 
                    fontSize={11} 
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={11} 
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                    domain={[0, (dataMax) => (Number.isFinite(dataMax) && dataMax > 5 ? Math.ceil(dataMax * 1.1) : 5)]}
                    allowDecimals={false} 
                    width={32}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-dark-modal, #18181b)',
                      border: '1px solid var(--color-border-dark, #27272a)',
                      borderRadius: '0.375rem',
                      fontSize: '12px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="recordsIngested" fill="#003E83" radius={[3, 3, 0, 0]} name="New Records" barSize={16} />
                  <Line type="monotone" dataKey="cumulative" stroke="#10B981" strokeWidth={2} dot={{ r: 2 }} name="Cumulative Total" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Section: Composition & Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Composition Breakdown Card */}
            <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1">
                Dataset Composition ({selectedDataset === 'ALL' ? 'Global' : selectedDataset})
              </h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">
                Distribution by entity type
              </p>

              {compositionData.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No records found</p>
              ) : (
                <div className="space-y-2.5">
                  {compositionData.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-gray-700 dark:text-zinc-300 truncate max-w-[180px]">
                          {item.name}
                        </span>
                        <span className="text-gray-500 dark:text-zinc-400 font-medium">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-md overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-md transition-all duration-300`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Breakdown Card */}
            <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1">
                Operational Status Breakdown
              </h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">
                Publication and workflow state
              </p>

              <div className="space-y-2.5">
                {statusBreakdownData.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-gray-700 dark:text-zinc-300 truncate max-w-[180px]">
                        {item.label}
                      </span>
                      <span className="text-gray-500 dark:text-zinc-400 font-medium">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-md overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-md transition-all duration-300`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500 dark:text-zinc-400">
            Total {totalRecords} {totalRecords === 1 ? 'record' : 'records'} analyzed
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-md bg-[#003E83] hover:bg-[#002e62] text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
