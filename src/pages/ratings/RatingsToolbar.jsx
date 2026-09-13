import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

export default function RatingsToolbar({
  searchTerm = '',
  onSearchChange,
  setSearchTerm,
  selectedStatus = 'All',
  onStatusChange,
  setSelectedStatus,
  statuses = ['All', 'Approved', 'Pending', 'Rejected'],
  selectedPlace = 'All',
  onPlaceChange,
  setSelectedPlace,
  places = ['All'],
  viewMode = 'table',
  onViewModeChange,
  setViewMode
}) {
  const handleSearch = (val) => {
    if (onSearchChange) onSearchChange(val);
    if (setSearchTerm) setSearchTerm(val);
  };

  const handleStatus = (val) => {
    if (onStatusChange) onStatusChange(val);
    if (setSelectedStatus) setSelectedStatus(val);
  };

  const handlePlace = (val) => {
    if (onPlaceChange) onPlaceChange(val);
    if (setSelectedPlace) setSelectedPlace(val);
  };

  const handleViewMode = (mode) => {
    if (onViewModeChange) onViewModeChange(mode);
    if (setViewMode) setViewMode(mode);
  };

  return (
    <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
          All Reviews
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent w-full sm:w-48 text-sm bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]"
            />
          </div>

          {/* Place Filter */}
          {places && places.length > 1 && (
            <div className="relative">
              <select
                value={selectedPlace}
                onChange={(e) => handlePlace(e.target.value)}
                className="appearance-none w-full pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer"
              >
                {places.map((place) => (
                  <option key={place} value={place}>
                    {place === 'All' ? 'All Places' : place}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
            </div>
          )}

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => handleStatus(e.target.value)}
              className="appearance-none w-full pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'All' ? 'All Status' : status}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="flex bg-[var(--color-border-light)] dark:bg-[var(--color-surface-hover-dark)] rounded-md p-1 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => handleViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' || viewMode === 'list'
                  ? 'bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] shadow-sm'
                  : 'hover:bg-[var(--color-border-subtle-light)] dark:hover:bg-[var(--color-border-dark)]'
              }`}
              title="Table View"
            >
              <svg className="w-4 h-4 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' || viewMode === 'feed'
                  ? 'bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] shadow-sm'
                  : 'hover:bg-[var(--color-border-subtle-light)] dark:hover:bg-[var(--color-border-dark)]'
              }`}
              title="Grid View"
            >
              <svg className="w-4 h-4 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
