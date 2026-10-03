import { Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const donutColors = [
  '#8B5CF6', // purple-500
  '#3B82F6', // blue-500
  '#06B6D4', // cyan-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#F43F5E', // rose-500
  '#6366F1', // indigo-500
  '#14B8A6', // teal-500
  '#EC4899', // pink-500
  '#0284C7', // sky-600
];

export default function CategoryDistribution({ distribution }) {
  const navigate = useNavigate();

  // Purely database-driven: no static or default categories
  const rawCategories = (Array.isArray(distribution) && distribution.length > 0)
    ? distribution
    : [];

  // Top categories from database
  const categories = rawCategories.slice(0, 10);
  const totalPlacesCount = categories.reduce((sum, c) => sum + (Number(c.count) || 0), 0);
  const totalCount = totalPlacesCount || 1;

  const chartData = categories.map((cat, index) => {
    const countVal = Number(cat.count) || 0;
    const percentage = totalPlacesCount > 0 ? Math.round((countVal / totalCount) * 100) : 0;
    const shortName = (cat.name || '').length > 16 ? cat.name.slice(0, 15) + '…' : (cat.name || `Category ${index + 1}`);

    return {
      id: cat.id || index + 1,
      fullName: cat.name || 'Unnamed Category',
      name: shortName,
      count: countVal,
      percentage,
      rank: index + 1,
      fill: donutColors[index % donutColors.length],
    };
  });

  return (
    <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          <div>
            <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Category Distribution</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/60">
                {categories.length}
              </span>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              Proportional distribution by destination count from database
            </p>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Donut Chart Container */}
        <div className="relative h-[250px] w-full flex items-center justify-center my-1">
          {categories.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs">
              <Layers className="w-8 h-8 mb-2 stroke-1 text-gray-300 dark:text-zinc-600" />
              <p>No category distribution in database</p>
            </div>
          ) : (
            <>
              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                  {totalPlacesCount}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                  Total Places
                </span>
              </div>

              <div className="w-full h-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="count"
                      nameKey="fullName"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                      stroke="none"
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      wrapperStyle={{ zIndex: 50, pointerEvents: 'none' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[var(--color-white)] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 p-2.5 rounded-md shadow-md text-xs space-y-1">
                              <p className="font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.fill }} />
                                {data.fullName}
                              </p>
                              <div className="flex items-center gap-3 pt-1 border-t border-gray-100 dark:border-zinc-800">
                                <span className="text-gray-900 dark:text-zinc-100 font-bold">
                                  {data.count} destinations
                                </span>
                                <span className="text-purple-600 dark:text-purple-400 font-semibold">
                                  ({data.percentage}%)
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* Legend / Breakdown Grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          {chartData.slice(0, 6).map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs min-w-0">
              <div className="flex items-center gap-1.5 min-w-0 pr-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                <span className="text-gray-700 dark:text-zinc-300 font-medium truncate text-[11px]">
                  {item.name}
                </span>
              </div>
              <span className="text-gray-500 dark:text-zinc-400 text-[10px] font-semibold shrink-0">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
