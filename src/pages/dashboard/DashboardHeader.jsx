import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function DashboardHeader({
  timeRange,
  onTimeRangeChange,
  isLoading = false
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>

        {/* Timeframe Filter Dropdown */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
