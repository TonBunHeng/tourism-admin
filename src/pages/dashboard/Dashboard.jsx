import { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import UserGrowthChart from './UserGrowthChart';
import TopPlaces from './TopPlaces';
import CategoryDistribution from './CategoryDistribution';
import dashboardService from '../../services/dashboardService';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('weekly');
  const [isLoading, setIsLoading] = useState(false);
  const [cache, setCache] = useState({});

  const dashboardData = cache[timeRange] || null;

  const fetchStats = async (range = timeRange) => {
    setIsLoading(true);
    try {
      const res = await dashboardService.getStats(range);
      if (res.success && res.data) {
        setCache((prev) => ({
          ...prev,
          [range]: res.data,
        }));
      }
    } catch (e) {
      console.error('Failed to load dashboard stats from API', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(timeRange);
  }, [timeRange]);

  const handleRefresh = () => {
    fetchStats(timeRange);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <DashboardHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        isLoading={isLoading}
      />

      {/* Charts Section */}
      <div className="mb-6 sm:mb-8">
        {/* User Growth Chart */}
        <UserGrowthChart
          growthData={dashboardData?.user_growth}
          timeRange={timeRange}
          isLoading={isLoading}
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
        {/* Top Places */}
        <TopPlaces
          places={dashboardData?.top_places}
          topPlaces={dashboardData?.top_places}
          timeRange={timeRange}
          isLoading={isLoading}
        />

        {/* Category Distribution & User Status Summary */}
        <CategoryDistribution
          distribution={dashboardData?.category_distribution}
          userStatus={dashboardData?.user_status}
          timeRange={timeRange}
          isLoading={isLoading}
        />
      </div>

      {/* Stats Cards Rows 1 and 2 */}
      <DashboardStats
        apiStats={dashboardData?.stats}
        timeRange={timeRange}
      />
    </div>
  );
}
