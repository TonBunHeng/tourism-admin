import React from 'react';
import { MapPinned, Building2, AlertCircle, Users, MessageSquareText, Star, Tags, Map, CalendarDays, Heart, TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardStats({ apiStats, timeRange = 'weekly' }) {
  const periodChanges = apiStats?.period_changes || {};

  const periodLabel = timeRange === 'today'
    ? 'today'
    : timeRange === 'weekly'
    ? 'this week'
    : timeRange === 'monthly'
    ? 'this month'
    : 'this year';

  const defaultRates = {
    today: {
      places: '+1.0%',
      users: '+3.5%',
      businesses: '+1.2%',
      reviews: '+2.5%',
      events: '+1.0%',
      favorites: '+4.0%',
      rating: '+0.05',
      verifications: '+1',
    },
    weekly: {
      places: '+4.5%',
      users: '+8.2%',
      businesses: '+5.0%',
      reviews: '+12.5%',
      events: '+10.0%',
      favorites: '+15.2%',
      rating: '+0.1',
      verifications: '+1',
    },
    monthly: {
      places: '+14.2%',
      users: '+24.6%',
      businesses: '+12.5%',
      reviews: '+28.0%',
      events: '+20.0%',
      favorites: '+34.8%',
      rating: '+0.2',
      verifications: '+2',
    },
    yearly: {
      places: '+35.0%',
      users: '+68.4%',
      businesses: '+42.0%',
      reviews: '+75.2%',
      events: '+50.0%',
      favorites: '+88.0%',
      rating: '+0.4',
      verifications: '+5',
    },
  }[timeRange] || {
    places: '+5.0%',
    users: '+8.0%',
    businesses: '+4.0%',
    reviews: '+10.0%',
    events: '+5.0%',
    favorites: '+12.0%',
    rating: '+0.1',
    verifications: '+1',
  };

  const getChange = (key, fallback) => {
    return periodChanges[key]?.change || fallback;
  };

  const getTrend = (key, fallback = 'up') => {
    return periodChanges[key]?.trend || fallback;
  };

  const getSubtext = (key, defaultText, entityName) => {
    if (periodChanges[key]?.current !== undefined && periodChanges[key]?.current > 0) {
      return `+${periodChanges[key].current} ${entityName} ${periodLabel}`;
    }
    return defaultText;
  };

  const statsRow1 = [
    {
      title: 'Total Places',
      value: apiStats?.total_places !== undefined ? apiStats.total_places.toLocaleString() : '5',
      subtext: getSubtext('places', 'Registered heritage & attractions', 'places'),
      change: getChange('places', defaultRates.places),
      trend: getTrend('places'),
      icon: MapPinned,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]',
      bg: 'bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    },
    {
      title: 'Total Users',
      value: apiStats?.total_users !== undefined ? apiStats.total_users.toLocaleString() : '6',
      subtext: getSubtext('users', 'Registered traveler accounts', 'users'),
      change: getChange('users', defaultRates.users),
      trend: getTrend('users'),
      icon: Users,
      color: 'text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)]',
      bg: 'bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)]',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    },
    {
      title: 'Total Businesses',
      value: apiStats?.total_businesses !== undefined ? apiStats.total_businesses.toLocaleString() : '4',
      subtext: getSubtext('businesses', 'Registered commercial entities', 'businesses'),
      change: getChange('businesses', defaultRates.businesses),
      trend: getTrend('businesses'),
      icon: Building2,
      color: 'text-[#003E83] dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    },
    {
      title: 'Total Reviews',
      value: apiStats?.total_reviews !== undefined ? apiStats.total_reviews.toLocaleString() : '2',
      subtext: getSubtext('reviews', 'Traveler feedback entries', 'reviews'),
      change: getChange('reviews', defaultRates.reviews),
      trend: getTrend('reviews'),
      icon: MessageSquareText,
      color: 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]',
      bg: 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    },
    {
      title: 'Avg Rating',
      value: apiStats?.avg_rating !== undefined ? `${apiStats.avg_rating} ★` : '5.0 ★',
      subtext: 'Destination score out of 5.0',
      change: defaultRates.rating,
      trend: 'up',
      icon: Star,
      color: 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]',
      bg: 'bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    }
  ];

  const statsRow2 = [
    {
      title: "Pending Verifications",
      value: apiStats?.pending_verifications !== undefined ? apiStats.pending_verifications.toLocaleString() : "2",
      subtext: "Business & Content Editor requests",
      change: defaultRates.verifications,
      trend: "up",
      icon: AlertCircle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800"
    },
    {
      title: 'Total Categories',
      value: apiStats?.total_categories !== undefined ? apiStats.total_categories.toLocaleString() : '8',
      subtext: 'Organized destination types',
      change: '+0',
      trend: 'up',
      icon: Tags,
      color: 'text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)]',
      bg: 'bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)]',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    },
    {
      title: 'Total Provinces',
      value: apiStats?.total_provinces !== undefined ? apiStats.total_provinces.toLocaleString() : '6',
      subtext: 'Active tourism regions',
      change: '+0',
      trend: 'up',
      icon: Map,
      color: 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]',
      bg: 'bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    },
    {
      title: 'Total Events',
      value: apiStats?.total_events !== undefined ? apiStats.total_events.toLocaleString() : '2',
      subtext: getSubtext('events', 'Scheduled festivals & events', 'events'),
      change: getChange('events', defaultRates.events),
      trend: getTrend('events'),
      icon: CalendarDays,
      color: 'text-[var(--color-rose-badge-text)] dark:text-[var(--color-rose-badge-dark-text)]',
      bg: 'bg-[var(--color-rose-badge-bg)] dark:bg-[var(--color-rose-badge-dark-bg)]',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    },
    {
      title: 'Total Favorites',
      value: apiStats?.total_favorites !== undefined ? apiStats.total_favorites.toLocaleString() : '2',
      subtext: getSubtext('favorites', 'Saved wishlist destinations', 'favorites'),
      change: getChange('favorites', defaultRates.favorites),
      trend: getTrend('favorites'),
      icon: Heart,
      color: 'text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)]',
      bg: 'bg-[var(--color-danger-bg)] dark:bg-[var(--color-danger-dark-bg)]',
      border: 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
    }
  ];

  return (
    <>
      {/* Stats Row 1 (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {statsRow1.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-medium truncate">
                    {stat.title}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-md shrink-0 ${stat.bg}`}>
                  <Icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                  {stat.subtext}
                </p>
                <div className={`flex items-center gap-0.5 text-xs font-semibold shrink-0 ml-2 ${
                  stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Row 2 (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statsRow2.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-medium truncate">
                    {stat.title}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-md shrink-0 ${stat.bg}`}>
                  <Icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                  {stat.subtext}
                </p>
                <div className={`flex items-center gap-0.5 text-xs font-semibold shrink-0 ml-2 ${
                  stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
