import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

const timeRangeOptions = [
  { id: 'today', label: 'Today', description: 'Real-time hourly activity' },
  { id: 'weekly', label: 'Weekly', description: 'Last 7 days overview' },
  { id: 'monthly', label: 'Monthly', description: 'This month breakdown' },
  { id: 'yearly', label: 'Yearly', description: 'Full year 2026 performance' },
];

export default function DashboardHeader({
  timeRange,
  onTimeRangeChange,
  isLoading = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = timeRangeOptions.find((opt) => opt.id === timeRange) || timeRangeOptions[1];

  const handleSelect = (id) => {
    onTimeRangeChange(id);
    setIsOpen(false);
  };

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

        {/* Dropdown Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md shadow-xs hover:border-[var(--color-primary)] text-xs sm:text-sm font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] transition-all cursor-pointer min-w-[150px] justify-between"
            aria-expanded={isOpen}
            aria-label="Select timeframe"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
              <span>{currentOption.label}</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] mb-1">
                <span className="text-[11px] font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                  Select Timeframe
                </span>
              </div>
              {timeRangeOptions.map((opt) => {
                const isSelected = opt.id === timeRange;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs sm:text-sm cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:bg-[var(--color-primary)]/15 dark:text-[var(--color-primary-light)] font-medium'
                        : 'text-[var(--color-text-primary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-xs sm:text-sm">{opt.label}</div>
                      <div className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] opacity-80">
                        {opt.description}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[var(--color-primary)] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
