import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Heart,
  CheckCircle2,
  Users,
  Star,
  MapPin,
  Calendar,
  Filter,
  RotateCcw,
  Landmark
} from 'lucide-react';
import {
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Link } from 'react-router-dom';
import favoriteService from '../../services/favoriteService';

export default function FavoritesAnalytics({ favorites: initialFavorites = [] }) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [timeframe, setTimeframe] = useState('2026');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [visitFilter, setVisitFilter] = useState('ALL');
  const [apiAnalytics, setApiAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync prop favorites or load directly if loaded as a standalone page
  useEffect(() => {
    if (initialFavorites && initialFavorites.length > 0) {
      setFavorites(initialFavorites);
    } else {
      const loadFavoritesData = async () => {
        setIsLoading(true);
        try {
          const res = await favoriteService.getFavorites({ per_page: 100 });
          if (res?.data && Array.isArray(res.data)) {
            setFavorites(res.data);
          }
        } catch (e) {
          console.warn('Failed to fetch favorites list for analytics page', e);
        } finally {
          setIsLoading(false);
        }
      };
      loadFavoritesData();
    }
  }, [initialFavorites]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await favoriteService.getAnalytics({
          timeframe,
          category: selectedCategory,
          visit_status: visitFilter
        });
        if (res && (res.success || res.data)) {
          setApiAnalytics(res.data || res);
        }
      } catch (e) {
        console.warn('Could not fetch remote favorites analytics, using local fallback:', e);
      }
    };
    fetchAnalytics();
  }, [timeframe, selectedCategory, visitFilter]);

  const safeFavorites = useMemo(() => (Array.isArray(favorites) ? favorites : []), [favorites]);

  const categories = useMemo(() => {
    if (apiAnalytics?.categories && Array.isArray(apiAnalytics.categories) && apiAnalytics.categories.length > 0) {
      return ['ALL', ...apiAnalytics.categories];
    }
    const set = new Set(safeFavorites.map(f => f.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [apiAnalytics, safeFavorites]);

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

  // Real statistics calculations from API with local fallback
  const total = useMemo(() => {
    return apiAnalytics?.overview?.total_favorites ?? filteredFavorites.length;
  }, [apiAnalytics, filteredFavorites]);

  const visitedCount = useMemo(() => {
    return apiAnalytics?.overview?.visited_count ?? filteredFavorites.filter(f => Boolean(f.visited || f.status === 'Visited')).length;
  }, [apiAnalytics, filteredFavorites]);

  const plannedCount = useMemo(() => {
    return apiAnalytics?.overview?.wishlist_count ?? Math.max(0, total - visitedCount);
  }, [apiAnalytics, total, visitedCount]);

  const visitedPct = useMemo(() => {
    if (apiAnalytics?.overview?.conversion_rate !== undefined) {
      return Math.round(apiAnalytics.overview.conversion_rate);
    }
    return total > 0 ? Math.round((visitedCount / total) * 100) : 0;
  }, [apiAnalytics, visitedCount, total]);

  const plannedPct = total > 0 ? Math.max(0, 100 - visitedPct) : 0;

  const uniqueUsers = useMemo(() => {
    if (apiAnalytics?.overview?.unique_travelers !== undefined) {
      return apiAnalytics.overview.unique_travelers;
    }
    return new Set(
      filteredFavorites.map(f => f.user_id || f.user?.id || f.user_email || f.user?.name).filter(Boolean)
    ).size;
  }, [apiAnalytics, filteredFavorites]);

  const avgRating = useMemo(() => {
    if (apiAnalytics?.overview?.avg_rating !== undefined && Number(apiAnalytics.overview.avg_rating) > 0) {
      return Number(apiAnalytics.overview.avg_rating).toFixed(1);
    }
    const validRatings = filteredFavorites
      .map(f => Number(f.rating || f.place?.rating))
      .filter(r => !isNaN(r) && r > 0);
    return validRatings.length > 0
      ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(1)
      : '0.0';
  }, [apiAnalytics, filteredFavorites]);

  // Real monthly trend data based on favorites dates
  const monthlyData = useMemo(() => {
    if (apiAnalytics?.monthly_trends && Array.isArray(apiAnalytics.monthly_trends)) {
      return apiAnalytics.monthly_trends.map(item => ({
        month: item.month,
        newSaves: Number(item.newSaves ?? item.count ?? item.saves ?? 0),
        cumulative: Number(item.cumulative ?? item.total ?? 0)
      }));
    }

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
  }, [apiAnalytics, filteredFavorites, timeframe]);

  // Category distribution formatted for vertical Recharts Basic Bar Chart
  const categoryData = useMemo(() => {
    if (apiAnalytics?.category_distribution && Array.isArray(apiAnalytics.category_distribution)) {
      const fillColors = ['#003E83', '#f43f5e', '#10b981', '#f59e0b', '#a855f7', '#06b6d4', '#6366f1'];
      return apiAnalytics.category_distribution.map((item, idx) => ({
        ...item,
        fillColor: item.fillColor || fillColors[idx % fillColors.length]
      }));
    }
    if (total === 0) return [];
    const counts = {};
    filteredFavorites.forEach(f => {
      const cat = f.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const colors = ['bg-[#003E83]', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-cyan-500'];
    const fillColors = ['#003E83', '#f43f5e', '#10b981', '#f59e0b', '#a855f7', '#06b6d4'];
    return Object.entries(counts).map(([name, count], idx) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
      color: colors[idx % colors.length],
      fillColor: fillColors[idx % fillColors.length]
    }));
  }, [apiAnalytics, filteredFavorites, total]);

  const displayFavorites = useMemo(() => {
    if (apiAnalytics?.recent_favorites && Array.isArray(apiAnalytics.recent_favorites) && apiAnalytics.recent_favorites.length > 0) {
      return apiAnalytics.recent_favorites;
    }
    if (apiAnalytics?.favorites && Array.isArray(apiAnalytics.favorites) && apiAnalytics.favorites.length > 0) {
      return apiAnalytics.favorites;
    }
    return filteredFavorites;
  }, [apiAnalytics, filteredFavorites]);

  const isFilterActive = timeframe !== '2026' || selectedCategory !== 'ALL' || visitFilter !== 'ALL';

  const handleResetFilters = () => {
    setTimeframe('2026');
    setSelectedCategory('ALL');
    setVisitFilter('ALL');
  };

  const stats = [
    {
      label: 'Total Favorites',
      value: total.toLocaleString(),
      subtext: total === 1 ? '1 place saved' : `${total.toLocaleString()} places saved`,
      icon: Heart,
      color: 'text-[var(--color-rose-badge-text)] dark:text-[var(--color-rose-badge-dark-text)]',
      bg: 'bg-[var(--color-rose-badge-bg)] dark:bg-[var(--color-rose-badge-dark-bg)]'
    },
    {
      label: 'Active Travelers',
      value: uniqueUsers > 0 ? uniqueUsers.toLocaleString() : total > 0 ? '1' : '0',
      subtext: `${uniqueUsers} user wishlists active`,
      icon: Users,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
    },
    {
      label: 'Average Place Rating',
      value: `${avgRating} ★`,
      subtext: 'Average destination score',
      icon: Star,
      color: 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]',
      bg: 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]'
    },
    {
      label: 'Visited Conversion',
      value: `${visitedPct}%`,
      subtext: `${visitedCount} of ${total} marked visited`,
      icon: CheckCircle2,
      color: 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]',
      bg: 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* 1. Standard Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
              Favorite Places Analytics
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
              Summary of saved places, traveler wishlists, and journey statuses
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <Link
              to="/favorites"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-medium rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Back to Favorites</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-medium truncate">
                    {stat.label}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-md shrink-0 ${stat.bg}`}>
                  <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] mt-2">
                {stat.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* 3. Analytics Filters Toolbar */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] px-4 md:px-6 py-3.5 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#003E83] dark:text-blue-400 shrink-0" />
            <span className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
              Filter Analytics
            </span>
            <span className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              ({filteredFavorites.length} records)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-xs focus:outline-none focus:ring-1 focus:ring-[#003E83] cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'ALL' ? 'All Categories' : cat}</option>
              ))}
            </select>

            {/* Visit Status Filter */}
            <select
              value={visitFilter}
              onChange={(e) => setVisitFilter(e.target.value)}
              className="px-3 py-1.5 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-xs focus:outline-none focus:ring-1 focus:ring-[#003E83] cursor-pointer"
            >
              <option value="ALL">All Journey Status</option>
              <option value="VISITED">Visited Places</option>
              <option value="PLANNED">To Visit (Planned)</option>
            </select>

            {/* Timeframe Selector */}
            <div className="inline-flex rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] p-0.5">
              {['2026', '2025', 'ALL'].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    timeframe === tf
                      ? 'bg-[#003E83] text-white'
                      : 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-gray-100 dark:hover:bg-zinc-800'
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
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Chart 1: Saved Places Velocity & Growth */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-4 sm:p-5 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          <div>
            <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
              <span>Saved Places Velocity & Growth ({timeframe})</span>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
              Monthly new saves vs cumulative total wishlist
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#003E83]" />
              New Saves
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-500 rounded-full" />
              Total Wishlist
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
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

      {/* 5. Chart 2: Category Breakdown (Stacked under Velocity chart) */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-4 sm:p-5 mb-6 sm:mb-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
            <div>
              <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
                <span>Category Breakdown</span>
              </h3>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                Wishlist distribution across attraction categories
              </p>
            </div>
            <span className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              Based on {total.toLocaleString()} saved places
            </span>
          </div>

          {categoryData.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">No category records found</p>
          ) : (
            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 25, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(107, 114, 128, 0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[var(--color-white)] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 p-2.5 rounded-md shadow-md text-xs space-y-1">
                            <p className="font-semibold text-gray-900 dark:text-zinc-100">{data.name}</p>
                            <div className="flex items-center gap-3 pt-1 border-t border-gray-100 dark:border-zinc-800">
                              <span className="text-gray-600 dark:text-zinc-300 font-semibold">
                                {data.count} records ({data.percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fillColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Journey Stage Status Summary */}
        <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] grid grid-cols-2 gap-3 text-center">
          <div className="p-2.5 rounded-md bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] border border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)]">
            <p className="text-sm font-bold text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]">{visitedCount}</p>
            <p className="text-xs text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]">Visited ({visitedPct}%)</p>
          </div>
          <div className="p-2.5 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] border border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)]">
            <p className="text-sm font-bold text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]">{plannedCount}</p>
            <p className="text-xs text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]">To Visit ({plannedPct}%)</p>
          </div>
        </div>
      </div>

      {/* 6. Destination Favorites Explorer List */}
      {displayFavorites.length > 0 && (
        <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                Saved Destinations
              </h3>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                Displaying destinations matching active filter criteria
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[var(--color-border-light)] dark:bg-[var(--color-surface-hover-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {displayFavorites.length} {displayFavorites.length === 1 ? 'place' : 'places'}
            </span>
          </div>

          <div className="divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)]">
            {displayFavorites.map((fav, index) => {
              const placeName = fav.name || fav.place?.name || 'Attraction';
              const locationName = fav.location || fav.place?.location || fav.place?.address || 'Cambodia';
              const catName = fav.category || fav.place?.category || 'General';
              const ratingNum = Number(fav.rating || fav.place?.rating || 5.0);
              const isVisited = Boolean(fav.visited || fav.status === 'Visited');

              return (
                <div key={fav.id || index} className="px-4 md:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-[var(--color-border-light)] dark:bg-[var(--color-surface-hover-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center justify-center font-semibold text-[11px] shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                        {placeName}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{locationName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--color-border-light)] dark:bg-[var(--color-surface-hover-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                      {catName}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{ratingNum.toFixed(1)}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${
                      isVisited
                        ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] dark:bg-[var(--color-success-dark-bg)] dark:text-[var(--color-success-dark-text)] border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)]'
                        : 'bg-[var(--color-info-bg)] text-[var(--color-info-text)] dark:bg-[var(--color-info-dark-bg)] dark:text-[var(--color-info-dark-text)] border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)]'
                    }`}>
                      {isVisited ? 'Visited' : 'To Visit'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
