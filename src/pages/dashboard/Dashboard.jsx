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
  const [dashboardData, setDashboardData] = useState(null);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await dashboardService.getStats();
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (e) {
      console.error('Failed to load dashboard stats from API', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchStats();
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <DashboardHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      {/* Stats Cards Rows 1 and 2 */}
      <DashboardStats apiStats={dashboardData?.stats} />

      {/* Charts Section */}
      <div className="mb-8">
        {/* User Growth Chart */}
        <UserGrowthChart growthData={dashboardData?.user_growth} />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Places */}
        <TopPlaces
          places={dashboardData?.top_places}
          topPlaces={dashboardData?.top_places}
        />

        {/* Category Distribution & User Status Summary */}
        <CategoryDistribution
          distribution={dashboardData?.category_distribution}
          userStatus={dashboardData?.user_status}
        />
      </div>
    </div>
  );
}
