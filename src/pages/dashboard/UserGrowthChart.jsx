import { User, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function UserGrowthChart({ growthData }) {
  // Purely database-driven: if growthData is empty or loading, default to 12 months with 0 counts
  const chartData = (Array.isArray(growthData) && growthData.length > 0)
    ? growthData
    : monthNames.map((month) => ({ month, unitsSold: 0, totalTransaction: 0 }));

  const totalTravelers = chartData.reduce((acc, curr) => acc + (Number(curr.unitsSold ?? curr.users) || 0), 0);

  return (
    <div className="w-full bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>User Growth & Platform Traffic</span>
          </h3>
          <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
            Monthly active engagement and visits from database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-900/50">
            <TrendingUp className="w-3.5 h-3.5" />
            {totalTravelers} Registered Travelers (2026)
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                fontSize: 12,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="plainline"
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            />
            <Line
              type="monotone"
              dataKey="unitsSold"
              name="New Travelers"
              stroke="#4472C4"
              strokeWidth={3}
              dot={{ r: 3, fill: '#4472C4' }}
              activeDot={{ r: 5, fill: '#4472C4' }}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="totalTransaction"
              name="Platform Activity"
              stroke="#ED7D31"
              strokeWidth={3}
              dot={{ r: 3, fill: '#ED7D31' }}
              activeDot={{ r: 5, fill: '#ED7D31' }}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
