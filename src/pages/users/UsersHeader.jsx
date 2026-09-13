import { Plus, RefreshCw } from "lucide-react";

export default function UsersHeader({ onAddUser, onOpenAddModal, onRefresh, isRefreshing }) {
  const handleAdd = onAddUser || onOpenAddModal;

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1 flex items-center gap-2 flex-wrap">
            <span>Manage and monitor all platform users</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md font-medium border border-emerald-200 dark:border-emerald-800 shrink-0">
              <span className="w-1.5 h-1.5 rounded-md bg-emerald-500 animate-pulse" />
              Live Auto-Sync
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh users list"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-md bg-[#003E83] hover:bg-[#002e62] text-white transition-colors shrink-0 flex-1 sm:flex-initial cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add New User</span>
          </button>
        </div>
      </div>
    </div>
  );
}
