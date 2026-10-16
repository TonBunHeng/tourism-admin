import { Save, RotateCcw, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SettingsHeader({
  saving,
  saveSuccess,
  onSave,
  onReset
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
      {/* Title & Description */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
          System Settings
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
          AngkorVerses Smart Tourism Platform Administration & System Operations
        </p>
      </div>

      {/* Controls: Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Reset Defaults Button */}
        <button
          type="button"
          onClick={onReset}
          disabled={saving}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-semibold rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          <span>Reset</span>
        </button>

        {/* Save Changes Button */}
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs md:text-sm font-medium rounded-md bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          {saving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
