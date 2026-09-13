export default function SettingsTabs({ tabs, activeTab, onTabChange, searchMatchCounts = {} }) {
  return (
    <div className="w-full border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-2.5 sm:p-3 bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)]">
      {/* Horizontal Tabs List */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const matchCount = searchMatchCounts[tab.id];

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#003E83] text-white font-semibold shadow-xs'
                  : 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-[var(--color-text-primary-light)] dark:hover:text-[var(--color-white)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]'}`} />
              <span>{tab.label}</span>
              {Boolean(matchCount) && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-[#003E83]/10 text-[#003E83] dark:bg-blue-900/40 dark:text-blue-300'}`}>
                  {matchCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
