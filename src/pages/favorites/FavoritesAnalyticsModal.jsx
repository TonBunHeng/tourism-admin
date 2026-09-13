import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Heart,
  CheckCircle2,
  Users,
  Star,
  MapPin
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

export default function FavoritesAnalyticsModal({ isOpen, onClose, favorites = [] }) {
  const [timeframe, setTimeframe] = useState('2026');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [visitFilter, setVisitFilter] = useState('ALL');

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

  const safeFavorites = useMemo(() => (Array.isArray(favorites) ? favorites : []), [favorites]);

  const categories = useMemo(() => {
    const set = new Set(safeFavorites.map(f => f.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [safeFavorites]);

  const filteredFavorites = useMemo(() => {
    return safeFavorites.filter(fav => {
      const matchesCategory = selectedCategory === 'ALL' || fav.category === selectedCategory;
      const isVisited = Boolean(fav.visited || fav.status === 'Visited');
      const matchesVisit =
        visitFilter === 'ALL' ||
        (visitFilter === 'VISITED' && isVisited) ||
        (visitFilter === 'PLANNED' && !isVisited);
      return matchesCategory && matchesVisit;
    });
  }, [safeFavorites, selectedCategory, visitFilter]);

  // Real statistics calculations
  const total = filteredFavorites.length;
  const visitedCount = filteredFavorites.filter(f => Boolean(f.visited || f.status === 'Visited')).length;
  const plannedCount = total - visitedCount;
  const visitedPct = total > 0 ? Math.round((visitedCount / total) * 100) : 0;
  const plannedPct = total > 0 ? 100 - visitedPct : 0;

  const uniqueUsers = useMemo(() => {
    return new Set(
      filteredFavorites.map(f => f.user_id || f.user?.id || f.user_email || f.user?.name).filter(Boolean)
    ).size;
  }, [filteredFavorites]);

  const avgRating = useMemo(() => {
    const validRatings = filteredFavorites
      .map(f => Number(f.rating || f.place?.rating))
      .filter(r => !isNaN(r) && r > 0);
    return validRatings.length > 0
      ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(1)
      : '0.0';
  }, [filteredFavorites]);

  // Real monthly trend data based on favorites dates
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const targetYear = timeframe === '2025' ? 2025 : timeframe === '2026' ? 2026 : null;
    const monthCounts = new Array(12).fill(0);

    filteredFavorites.forEach(f => {
      const dateVal = f.created_at || f.saved_date || f.dateAdded;
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          if (!targetYear || d.getFullYear() === targetYear) {
            monthCounts[d.getMonth()] += 1;
            return;
          }
        }
      }
      // Fallback to current month if date isn't parseable and timeframe matches
      const currentYear = new Date().getFullYear();
      if (!targetYear || targetYear === currentYear) {
        monthCounts[new Date().getMonth()] += 1;
      }
    });

    let runningTotal = 0;
    return months.map((month, idx) => {
      const count = monthCounts[idx];
      runningTotal += count;
      return {
        month,
        newSaves: count,
        cumulative: runningTotal
      };
    });
  }, [filteredFavorites, timeframe]);

  // Real category distribution
  const categoryData = useMemo(() => {
    if (total === 0) return [];
    const counts = {};
    filteredFavorites.forEach(f => {
      const cat = f.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const colors = ['bg-[#003E83]', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-cyan-500'];
    return Object.entries(counts).map(([name, count], idx) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
      color: colors[idx % colors.length]
    }));
  }, [filteredFavorites, total]);

  const isFilterActive = timeframe !== '2026' || selectedCategory !== 'ALL' || visitFilter !== 'ALL';

  const handleResetFilters = () => {
    setTimeframe('2026');
    setSelectedCategory('ALL');
    setVisitFilter('ALL');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity duration-150 animate-alert-backdrop">
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)] rounded-md max-w-4xl w-full max-h-[90vh] shadow-lg border border-gray-200 dark:border-zinc-800 overflow-hidden flex flex-col animate-alert-popup">
        
        {/* Simple Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">
              Favorite Places Analytics Overview
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Summary of saved places, traveler wishlists, and journey statuses
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
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-zinc-700 rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-gray-700 dark:text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#003E83] cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'ALL' ? 'All Categories' : cat}</option>
              ))}
            </select>

            {/* Visit Status Filter */}
            <select
              value={visitFilter}
              onChange={(e) => setVisitFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-zinc-700 rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-gray-700 dark:text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#003E83] cursor-pointer"
            >
              <option value="ALL">All Journey Status</option>
              <option value="VISITED">Visited Places</option>
              <option value="PLANNED">To Visit (Planned)</option>
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
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Top 4 KPI Cards - Simple Style */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Saved */}
            <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 font-medium">
                <span>Total Saved</span>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mt-2">
                {total}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                {total === 1 ? '1 place saved' : `${total} places saved`}
              </p>
            </div>

            {/* Card 2: Active Travelers */}
            <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 font-medium">
                <span>Active Travelers</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mt-2">
                {uniqueUsers}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                {uniqueUsers === 1 ? '1 unique account' : `${uniqueUsers} unique accounts`}
              </p>
            </div>

            {/* Card 3: Visited Conversion */}
            <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 font-medium">
                <span>Visited Conversion</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mt-2">
                {visitedPct}%
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                {visitedCount} of {total} marked visited
              </p>
            </div>

            {/* Card 4: Average Rating */}
            <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 font-medium">
                <span>Average Rating</span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mt-2">
                {avgRating} ★
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                Average destination rating
              </p>
            </div>
          </div>

          {/* Charts Row: Monthly Volume & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Chart: Monthly Volume */}
            <div className="lg:col-span-2 bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                    Saved Places Velocity & Growth ({timeframe})
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    Monthly new saves vs cumulative total
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-md bg-[#003E83]" />
                    New Saves
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-rose-500" />
                    Total Wishlist
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
                    <Bar dataKey="newSaves" fill="#003E83" radius={[3, 3, 0, 0]} name="New Saves" barSize={16} />
                    <Line type="monotone" dataKey="cumulative" stroke="#f43f5e" strokeWidth={2} dot={{ r: 2 }} name="Total Wishlist" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category & Status Breakdown */}
            <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1">
                  Category Breakdown
                </h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">
                  Wishlist distribution by category
                </p>

                {categoryData.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No category data available</p>
                ) : (
                  <div className="space-y-2.5">
                    {categoryData.map((cat) => (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-gray-700 dark:text-zinc-300 truncate max-w-[140px]">
                            {cat.name}
                          </span>
                          <span className="text-gray-500 dark:text-zinc-400 font-medium">
                            {cat.count} ({cat.percentage}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-md overflow-hidden">
                          <div
                            className={`h-full ${cat.color} rounded-md transition-all duration-300`}
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Journey Stage Status Summary */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-zinc-800 grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{visitedCount}</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">Visited ({visitedPct}%)</p>
                </div>
                <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{plannedCount}</p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300">To Visit ({plannedPct}%)</p>
                </div>
              </div>
            </div>

          </div>

          {/* Simple Places List */}
          {filteredFavorites.length > 0 && (
            <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                  Saved Destinations
                </h4>
                <span className="text-xs text-gray-500 dark:text-zinc-400">
                  {filteredFavorites.length} {filteredFavorites.length === 1 ? 'place' : 'places'}
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {filteredFavorites.map((fav, index) => (
                  <div key={fav.id || index} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 flex items-center justify-center font-medium text-[11px] shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-zinc-100 truncate">{fav.name}</p>
                        <p className="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">{fav.location || 'Cambodia'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                        {fav.category || 'General'}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-medium">
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span>{Number(fav.rating || fav.place?.rating || 5.0).toFixed(1)}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                        fav.visited || fav.status === 'Visited'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40'
                      }`}>
                        {fav.visited || fav.status === 'Visited' ? 'Visited' : 'To Visit'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500 dark:text-zinc-400">
            Total {total} {total === 1 ? 'favorite entry' : 'favorite entries'}
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
