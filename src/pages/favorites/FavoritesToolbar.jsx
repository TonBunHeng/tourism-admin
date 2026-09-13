import React from 'react';
import { Search, ChevronDown, X, Trash2, CheckCircle2, LayoutGrid, List, RotateCcw } from 'lucide-react';

export default function FavoritesToolbar({
  totalCount = 0,
  selectedCount = 0,
  searchTerm = '',
  onSearchChange,
  setSearchTerm,
  selectedCategory = 'All',
  onCategoryChange,
  setSelectedCategory,
  categories = ['All'],
  selectedStatus = 'All',
  onStatusChange,
  setSelectedStatus,
  statuses = ['All', 'Visited', 'To Visit'],
  sortBy = 'recent',
  onSortChange,
  setSortBy,
  viewMode = 'grid',
  onViewModeChange,
  setViewMode,
  onClearFilters,
  onBulkDelete,
  onBulkMarkVisited,
  onDeselectAll
}) {
  const handleSearch = onSearchChange || setSearchTerm || (() => {});
  const handleCategory = onCategoryChange || setSelectedCategory || (() => {});
  const handleStatus = onStatusChange || setSelectedStatus || (() => {});
  const handleSort = onSortChange || setSortBy || (() => {});
  const handleViewMode = onViewModeChange || setViewMode || (() => {});

  const hasActiveFilters = Boolean(
    (searchTerm && searchTerm.trim() !== '') ||
    (selectedCategory && selectedCategory !== 'All') ||
    (selectedStatus && selectedStatus !== 'All') ||
    (sortBy && sortBy !== 'recent')
  );

  const handleReset = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      handleSearch('');
      handleCategory('All');
      handleStatus('All');
      handleSort('recent');
    }
  };

  return (
    <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Section title & counters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-base md:text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
            Saved Destinations
          </h2>
          <span className="text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] bg-[var(--color-neutral-badge-bg)] dark:bg-[var(--color-neutral-badge-dark-bg)] px-2.5 py-0.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
            {totalCount} {totalCount === 1 ? 'place' : 'places'}
          </span>
          {selectedCount > 0 && (
            <span className="text-xs font-semibold text-[var(--color-rose-badge-text)] dark:text-[var(--color-rose-badge-dark-text)] bg-[var(--color-rose-badge-bg)] dark:bg-[var(--color-rose-badge-dark-bg)] border border-[var(--color-rose-badge-border)] dark:border-[var(--color-rose-badge-dark-border)] px-2.5 py-0.5 rounded-md animate-in fade-in">
              {selectedCount} selected
            </span>
          )}
        </div>

        {/* Right: Controls & Filters */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Search Bar */}
          <div className="relative flex-1 sm:flex-none sm:w-52 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs md:text-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted-light)] hover:text-[var(--color-text-primary-light)] dark:hover:text-[var(--color-white)] p-0.5 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategory(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-xs md:text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => handleStatus(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-xs md:text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Statuses' : st}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-xs md:text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest Added</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="name">Name (A - Z)</option>
              <option value="most_reviews">Most Reviews</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>

          {/* View Toggle (Grid / List) */}
          <div className="flex bg-[var(--color-border-light)] dark:bg-[var(--color-surface-hover-dark)] p-0.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
            <button
              type="button"
              onClick={() => handleViewMode('grid')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-primary)] shadow-sm font-semibold'
                  : 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-[var(--color-text-primary-light)] dark:hover:text-[var(--color-white)]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleViewMode('list')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-primary)] shadow-sm font-semibold'
                  : 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-[var(--color-text-primary-light)] dark:hover:text-[var(--color-white)]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-2 text-xs md:text-sm font-medium text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar (Visible when items are selected) */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex-wrap animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              Action on {selectedCount} selected:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onBulkMarkVisited && (
              <button
                type="button"
                onClick={onBulkMarkVisited}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] border border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)] hover:opacity-90 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Visited</span>
              </button>
            )}

            {onBulkDelete && (
              <button
                type="button"
                onClick={onBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[var(--color-danger-bg)] dark:bg-[var(--color-danger-dark-bg)] text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] border border-[var(--color-danger-border)] dark:border-[var(--color-danger-dark-border)] hover:opacity-90 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}

            {onDeselectAll && (
              <button
                type="button"
                onClick={onDeselectAll}
                className="px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] rounded-md transition-colors cursor-pointer border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]"
              >
                Deselect All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
