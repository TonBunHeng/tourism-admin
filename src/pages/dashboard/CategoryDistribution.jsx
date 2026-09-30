import { Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CategoryDistribution({ distribution }) {
  const navigate = useNavigate();

  const fallbackDistribution = [
    { name: 'Temples', count: 4, color: 'bg-blue-500' },
    { name: 'Historical Sites', count: 3, color: 'bg-purple-500' },
    { name: 'Beaches', count: 2, color: 'bg-cyan-500' },
    { name: 'Nature Parks', count: 2, color: 'bg-emerald-500' },
    { name: 'Markets', count: 1, color: 'bg-amber-500' }
  ];

  const categories = (Array.isArray(distribution) && distribution.length > 0)
    ? distribution
    : fallbackDistribution;

  const totalCategoryCount = categories.reduce((sum, c) => sum + (Number(c.count) || 0), 0) || 1;
  const isScrollable = categories.length > 10;

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
              {isScrollable
                ? `Destinations grouped by category (scroll to view all ${categories.length})`
                : 'Destinations grouped by category'}
            </p>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Categories list (scrollable when > 10 categories) */}
        <div
          className={`space-y-3 pt-1 ${
            isScrollable ? 'max-h-[380px] overflow-y-auto pr-2' : ''
          }`}
        >
          {categories.map((category, index) => {
            const count = Number(category.count) || 0;
            const pct = Math.round((count / totalCategoryCount) * 100);
            return (
              <div
                key={category.id || index}
                className="group cursor-pointer rounded-md p-1 -m-1 hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors"
                onClick={() => navigate('/categories')}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold w-4">
                      #{index + 1}
                    </span>
                    <span>{category.name}</span>
                  </span>
                  <span className="text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-semibold">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--color-border-light)] dark:bg-[var(--color-surface-hover-dark)] rounded-md overflow-hidden">
                  <div
                    className={`h-full ${category.color || 'bg-blue-500'} rounded-md transition-all duration-500`}
                    style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
