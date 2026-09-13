import { Search, LayoutList, LayoutGrid, Filter } from 'lucide-react';

export default function SecurityToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  totalResults
}) {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'unread', label: 'Unread Only' },
    { value: 'read', label: 'Read / Acknowledged' },
  ];

  return (
    <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] p-3 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by target email, IP address, or incident description..."
          className="w-full pl-10 pr-4 py-2 rounded-md bg-white dark:bg-zinc-800 text-xs text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-slate-400 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] focus:outline-none focus:ring-1 focus:ring-[#003E83] focus:border-[#003E83] transition-colors"
        />
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between md:justify-end">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="py-1.5 px-3 rounded-md bg-white dark:bg-zinc-800 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] text-xs font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-1 focus:ring-[#003E83] focus:border-[#003E83] cursor-pointer transition-colors"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] font-medium">
          {totalResults} {totalResults === 1 ? 'alert' : 'alerts'}
        </span>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md p-0.5 bg-slate-50 dark:bg-zinc-800/40">
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-zinc-700 text-[#003E83] dark:text-blue-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
            }`}
            title="List view"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-zinc-700 text-[#003E83] dark:text-blue-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
