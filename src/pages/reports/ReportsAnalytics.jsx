import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  FileText,
  Activity,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Archive,
  Star,
  Sparkles,
  Download,
  Filter,
  RotateCcw
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
import placeService from '../../services/placeService';
import eventService from '../../services/eventService';
import userService from '../../services/userService';
import reviewService from '../../services/reviewService';
import categoryService from '../../services/categoryService';
import reportService from '../../services/reportService';

export default function ReportsAnalytics({ datasets: initialDatasets = null }) {
  const [timeframe, setTimeframe] = useState('2026');
  const [selectedDataset, setSelectedDataset] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [apiAnalytics, setApiAnalytics] = useState(null);

  // Raw dataset holders
  const [datasets, setDatasets] = useState({
    places: [],
    events: [],
    users: [],
    reviews: [],
    categories: []
  });

  // Sync prop datasets or load directly if loaded as a standalone page
  useEffect(() => {
    if (initialDatasets && typeof initialDatasets === 'object') {
      setDatasets({
        places: Array.isArray(initialDatasets.places) ? initialDatasets.places : [],
        events: Array.isArray(initialDatasets.events) ? initialDatasets.events : [],
        users: Array.isArray(initialDatasets.users) ? initialDatasets.users : [],
        reviews: Array.isArray(initialDatasets.reviews) ? initialDatasets.reviews : [],
        categories: Array.isArray(initialDatasets.categories) ? initialDatasets.categories : []
      });
    } else {
      const loadAllData = async () => {
        setIsLoading(true);
        try {
          const [placesRes, eventsRes, usersRes, reviewsRes, categoriesRes] = await Promise.allSettled([
            placeService.getPlaces({ per_page: 100 }),
            eventService.getEvents({ per_page: 100 }),
            userService.getUsers({ per_page: 100 }),
            reviewService.getReviews({ per_page: 100 }),
            categoryService.getCategories({ per_page: 100 })
          ]);

          const formattedPlaces = placesRes.status === 'fulfilled' && placesRes.value?.data
            ? placesRes.value.data.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category_name || (typeof p.category === 'object' ? p.category?.name : p.category) || 'General',
                province: p.province_name || (typeof p.province === 'object' ? p.province?.name : p.province) || 'Cambodia',
                rating: Number(p.rating || 0),
                reviews: Number(p.reviews_count || 0),
                status: p.status || 'Active',
                createdAt: p.created_at ? p.created_at.split('T')[0] : null,
                type: 'Place'
              }))
            : [];

          const formattedEvents = eventsRes.status === 'fulfilled' && eventsRes.value?.data
            ? eventsRes.value.data.map(e => ({
                id: e.id,
                title: e.title,
                name: e.title,
                location: e.location || 'Cambodia',
                startDate: e.start_date || (e.created_at ? e.created_at.split('T')[0] : null),
                endDate: e.end_date || null,
                attendees: Number(e.attendees_count || 0),
                status: e.status || 'Upcoming',
                createdAt: e.created_at ? e.created_at.split('T')[0] : null,
                type: 'Event'
              }))
            : [];

          const formattedUsers = usersRes.status === 'fulfilled' && usersRes.value?.data
            ? usersRes.value.data.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role || 'User',
                joinedDate: u.created_at ? u.created_at.split('T')[0] : null,
                createdAt: u.created_at ? u.created_at.split('T')[0] : null,
                status: u.status || 'Active',
                type: 'User'
              }))
            : [];

          const formattedReviews = reviewsRes.status === 'fulfilled' && reviewsRes.value?.data
            ? reviewsRes.value.data.map(r => ({
                id: r.id,
                name: `${r.place_name || (typeof r.place === 'object' ? r.place?.name : 'Attraction')} Review`,
                userName: r.user_name || (typeof r.user === 'object' ? r.user?.name : r.user) || 'Traveler',
                rating: Number(r.rating || 0),
                comment: r.comment || '',
                date: r.created_at ? r.created_at.split('T')[0] : null,
                createdAt: r.created_at ? r.created_at.split('T')[0] : null,
                status: r.status || 'Approved',
                type: 'Review'
              }))
            : [];

          const formattedCategories = categoriesRes.status === 'fulfilled' && categoriesRes.value?.data
            ? categoriesRes.value.data.map(c => ({
                id: c.id,
                name: c.name,
                description: c.description || '',
                totalPlaces: Number(c.places_count || 0),
                status: c.status || 'Active',
                createdAt: c.created_at ? c.created_at.split('T')[0] : null,
                type: 'Category'
              }))
            : [];

          setDatasets({
            places: formattedPlaces,
            events: formattedEvents,
            users: formattedUsers,
            reviews: formattedReviews,
            categories: formattedCategories
          });
        } catch (e) {
          console.warn('Failed to load datasets for Reports Analytics', e);
        } finally {
          setIsLoading(false);
        }
      };
      loadAllData();
    }
  }, [initialDatasets]);

  // Fetch server analytics
  useEffect(() => {
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
      .catch((e) => {
        console.warn('Could not fetch server reports analytics:', e);
      });
  }, [timeframe, selectedDataset, statusFilter]);

  const places = useMemo(() => (Array.isArray(datasets.places) ? datasets.places : []), [datasets.places]);
  const events = useMemo(() => (Array.isArray(datasets.events) ? datasets.events : []), [datasets.events]);
  const users = useMemo(() => (Array.isArray(datasets.users) ? datasets.users : []), [datasets.users]);
  const reviews = useMemo(() => (Array.isArray(datasets.reviews) ? datasets.reviews : []), [datasets.reviews]);
  const categories = useMemo(() => (Array.isArray(datasets.categories) ? datasets.categories : []), [datasets.categories]);

  // Current dataset items based on selection
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
    if (itemsToCheck.length === 0) return { activeCount: 0, activePct: 0 };
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
      : '0.0';
  }, [places, reviews]);

  // Real Monthly Ingestion Trends
  const monthlyData = useMemo(() => {
    if (apiAnalytics?.monthly_trends && Array.isArray(apiAnalytics.monthly_trends)) {
      let run = 0;
      return apiAnalytics.monthly_trends.map(item => {
        const count = Number(item.recordsIngested ?? item.count ?? 0);
        run += count;
        return {
          month: item.month,
          recordsIngested: count,
          cumulative: run
        };
      });
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const targetYear = timeframe === '2025' ? 2025 : timeframe === '2026' ? 2026 : null;
    const monthCounts = new Array(12).fill(0);

    currentDatasetItems.forEach(item => {
      const dStr = item.createdAt || item.startDate || item.joinedDate || item.date;
      if (dStr) {
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) {
          if (!targetYear || d.getFullYear() === targetYear) {
            monthCounts[d.getMonth()] += 1;
          }
        }
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
  }, [apiAnalytics, currentDatasetItems, timeframe]);

  // Composition Breakdown
  const compositionData = useMemo(() => {
    const palette = ['bg-[#003E83]', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-cyan-500'];
    const fillColors = ['#003E83', '#f43f5e', '#10b981', '#f59e0b', '#a855f7', '#06b6d4'];

    if (selectedDataset === 'ALL') {
      const total = globalTotalRecords || 1;
      return [
        { name: 'Places & Attractions', count: places.length, percentage: Math.round((places.length / total) * 100), color: palette[0], fillColor: fillColors[0] },
        { name: 'Events & Festivals', count: events.length, percentage: Math.round((events.length / total) * 100), color: palette[1], fillColor: fillColors[1] },
        { name: 'Users & Accounts', count: users.length, percentage: Math.round((users.length / total) * 100), color: palette[2], fillColor: fillColors[2] },
        { name: 'Ratings & Reviews', count: reviews.length, percentage: Math.round((reviews.length / total) * 100), color: palette[3], fillColor: fillColors[3] },
        { name: 'Categories', count: categories.length, percentage: Math.round((categories.length / total) * 100), color: palette[4], fillColor: fillColors[4] }
      ].filter(item => item.count > 0);
    }

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
      color: palette[idx % palette.length],
      fillColor: fillColors[idx % fillColors.length]
    }));
  }, [selectedDataset, globalTotalRecords, places, events, users, reviews, categories, currentDatasetItems]);

  // Operational Status Breakdown Data
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
      { label: 'Active / Published', name: 'Active / Published', count: active, percentage: Math.round((active / total) * 100), color: 'bg-emerald-500', fillColor: '#10b981' },
      { label: 'Pending / Upcoming', name: 'Pending / Upcoming', count: pending, percentage: Math.round((pending / total) * 100), color: 'bg-amber-500', fillColor: '#f59e0b' },
      { label: 'Archived / Inactive', name: 'Archived / Inactive', count: archived, percentage: Math.round((archived / total) * 100), color: 'bg-gray-400', fillColor: '#9ca3af' }
    ];
  }, [currentDatasetItems]);

  const isFilterActive = timeframe !== '2026' || selectedDataset !== 'ALL' || statusFilter !== 'ALL';

  const handleReset = () => {
    setTimeframe('2026');
    setSelectedDataset('ALL');
    setStatusFilter('ALL');
  };

  const stats = [
    {
      label: 'Total Ingested Records',
      value: totalRecords.toLocaleString(),
      subtext: `${globalTotalRecords.toLocaleString()} global records in DB`,
      icon: FileText,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
    },
    {
      label: 'Active System Records',
      value: `${activePct}%`,
      subtext: `${activeCount.toLocaleString()} active/published entities`,
      icon: CheckCircle2,
      color: 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]',
      bg: 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]'
    },
    {
      label: 'Dataset Quality Index',
      value: `${avgScore} ★`,
      subtext: 'Average destination & feedback rating',
      icon: Star,
      color: 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]',
      bg: 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]'
    },
    {
      label: 'Database Schema Scope',
      value: `${Object.keys(datasets).length} Tables`,
      subtext: 'Places, Events, Users, Reviews, Categories',
      icon: Layers,
      color: 'text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)]',
      bg: 'bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)]'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* 1. Standard Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
              Reports & System Analytics
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
              Cross-dataset intelligence, volume trends, and database metrics
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <Link
              to="/reports"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-medium rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Back to Reports</span>
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
              ({totalRecords.toLocaleString()} records)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Dataset Selector */}
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="px-3 py-1.5 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-xs focus:outline-none focus:ring-1 focus:ring-[#003E83] cursor-pointer"
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
              className="px-3 py-1.5 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-xs focus:outline-none focus:ring-1 focus:ring-[#003E83] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active / Published</option>
              <option value="Pending">Pending / Upcoming</option>
              <option value="Archived">Archived / Inactive</option>
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
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 & 5. Balanced Side-by-Side Analytics Charts Grid with Smooth Animations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
        
        {/* Chart 1: Record Ingestion Activity */}
        <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <div>
                <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
                  <span>Record Ingestion Activity ({timeframe})</span>
                </h3>
                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                  Monthly new records and cumulative database volume
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#003E83]" />
                  New Records
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-500 rounded-full" />
                  Cumulative Total
                </span>
              </div>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                  <Bar dataKey="recordsIngested" fill="#003E83" radius={[3, 3, 0, 0]} name="New Records" barSize={16} isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
                  <Line type="monotone" dataKey="cumulative" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981' }} activeDot={{ r: 5 }} name="Cumulative Total" isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2: Dataset Composition Breakdown */}
        <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <div>
                <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
                  <span>Dataset Composition ({selectedDataset === 'ALL' ? 'Global' : selectedDataset})</span>
                </h3>
                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                  Volume distribution by entity category
                </p>
              </div>
              <span className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                Based on {totalRecords.toLocaleString()} records
              </span>
            </div>

            {compositionData.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-10">No dataset composition data</p>
            ) : (
              <div className="h-[175px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compositionData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                    <YAxis dataKey="name" type="category" interval={0} width={130} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
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
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={true} animationDuration={800} animationEasing="ease-out">
                      {compositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fillColor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Composition Badges */}
          <div className="mt-3 pt-2.5 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
            {compositionData.slice(0, 3).map((item, idx) => (
              <div key={idx} className="p-2 rounded-md bg-[var(--color-border-light)] dark:bg-[var(--color-surface-hover-dark)]">
                <p className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{item.count} ({item.percentage}%)</p>
                <p className="text-[10px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] truncate">{item.name}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 6. Recent Dataset Records Explorer List */}
      {filteredItems.length > 0 && (
        <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                Database Records Overview
              </h3>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                Displaying tourism database entities matching active filter criteria
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[var(--color-border-light)] dark:bg-[var(--color-surface-hover-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {filteredItems.length} {filteredItems.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          <div className="divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)]">
            {filteredItems.slice(0, 10).map((item, index) => {
              const itemName = item.name || item.title || 'Database Entity';
              const itemType = item.type || (item.category ? 'Place' : item.location ? 'Event' : item.email ? 'User' : 'Record');
              const itemDate = item.createdAt || item.startDate || item.joinedDate || item.date || 'Recent';
              const statusStr = item.status || 'Active';
              const isActive = ['active', 'published', 'approved'].includes(statusStr.toLowerCase());

              return (
                <div key={item.id || index} className="px-4 md:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-[var(--color-border-light)] dark:bg-[var(--color-surface-hover-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center justify-center font-semibold text-[11px] shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                        {itemName}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
                        Logged date: {itemDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--color-border-light)] dark:bg-[var(--color-surface-hover-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                      {itemType}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${
                      isActive
                        ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] dark:bg-[var(--color-success-dark-bg)] dark:text-[var(--color-success-dark-text)] border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)]'
                        : 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] dark:bg-[var(--color-warning-dark-bg)] dark:text-[var(--color-warning-dark-text)] border-[var(--color-warning-border)] dark:border-[var(--color-warning-dark-border)]'
                    }`}>
                      {statusStr}
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
