import { User, TrendingUp } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function UserGrowthChart({ growthData }) {
  const fallbackData = [
    { month: 'Jan', unitsSold: 25, totalTransaction: 1200 },
    { month: 'Feb', unitsSold: 38, totalTransaction: 1850 },
    { month: 'Mar', unitsSold: 50, totalTransaction: 2400 },
    { month: 'Apr', unitsSold: 65, totalTransaction: 3100 },
    { month: 'May', unitsSold: 78, totalTransaction: 3600 },
    { month: 'Jun', unitsSold: 88, totalTransaction: 4100 },
    { month: 'Jul', unitsSold: 102, totalTransaction: 4800 },
    { month: 'Aug', unitsSold: 115, totalTransaction: 5200 },
    { month: 'Sep', unitsSold: 0, totalTransaction: 0 },
    { month: 'Oct', unitsSold: 0, totalTransaction: 0 },
    { month: 'Nov', unitsSold: 0, totalTransaction: 0 },
    { month: 'Dec', unitsSold: 0, totalTransaction: 0 },
  ];

  const chartData = (Array.isArray(growthData) && growthData.length > 0) ? growthData : fallbackData;

  return (
    <div className="lg:col-span-2 bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">User Growth & Platform Traffic</h3>
          <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Monthly active engagement and visits</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-900/50">
            <TrendingUp className="w-3.5 h-3.5" />
            +18.4% YoY
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="plainline"
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            />
            <Bar dataKey="unitsSold" name="New Travelers" fill="#4472C4" barSize={16} radius={[3, 3, 0, 0]} />
            <Line
              type="monotone"
              dataKey="totalTransaction"
              name="Monthly Visits"
              stroke="#ED7D31"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
