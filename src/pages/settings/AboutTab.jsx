import {
  Server,
  Layers,
  Code2,
  Database as DbIcon,
  Cpu,
  ShieldCheck,
  HardDrive,
  Clock
} from 'lucide-react';

export default function AboutTab() {
  const systemInfo = [
    {
      title: 'Portal Core Engine',
      value: 'AngkorVerses Smart Tourism v1.0.0',
      desc: 'Official Cultural Heritage & Tourism System',
      icon: Layers,
      color: 'bg-[#003E83]/10 dark:bg-[#003E83]/20 text-[#003E83] dark:text-blue-400'
    },
    {
      title: 'Laravel Backend API',
      value: 'Laravel 11.x (PHP 8.3 FPM)',
      desc: 'High-Throughput RESTful Architecture',
      icon: Server,
      color: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
    },
    {
      title: 'React Single Page App',
      value: 'React 19 + Vite 8 & Tailwind CSS',
      desc: 'Responsive SPA Administration Console',
      icon: Code2,
      color: 'bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
    },
    {
      title: 'Relational Database',
      value: 'MySQL 8.4 / PostgreSQL GIS Engine',
      desc: 'Spatial Indexing & Transactional Storage',
      icon: DbIcon,
      color: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
          About System & Environment Metrics
        </h2>
        <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
          Technical specifications, runtime frameworks, server host health status, and media storage capacity.
        </p>
      </div>

      {/* Card 1: Core Specifications Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {systemInfo.map((info, idx) => {
          const Icon = info.icon;
          return (
            <div
              key={idx}
              className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-4 shadow-xs flex items-center space-x-3.5"
            >
              <div className={`p-3 rounded-md shrink-0 ${info.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] block">
                  {info.title}
                </span>
                <span className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] block truncate mt-0.5">
                  {info.value}
                </span>
                <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block truncate mt-0.5">
                  {info.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card 2: Server Status & Operational Uptime */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]" />
            Server Host & Environment Status
          </h3>
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-md bg-[var(--color-success-text)] animate-pulse" />
            Operational & Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 p-3 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
            <span className="text-[10px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] block">Server Datacenter Region</span>
            <span className="font-mono font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-0.5 block">Asia-Southeast1 (Cambodia ICT)</span>
          </div>

          <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 p-3 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
            <span className="text-[10px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] block">API Uptime Service Level</span>
            <span className="font-mono font-bold text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] mt-0.5 block">99.98% (Online)</span>
          </div>

          <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 p-3 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
            <span className="text-[10px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] block">TLS / SSL Encryption</span>
            <span className="font-mono font-bold text-[var(--color-primary)] mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Active (256-bit TLS)
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Storage Usage Metric */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <HardDrive className="w-4 h-4 text-[var(--color-purple-text)] dark:text-[var(--color-purple-dark-text)]" />
          System Storage Utilization
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
              Media & Database Storage
            </span>
            <span className="font-mono font-bold text-[var(--color-purple-text)] dark:text-[var(--color-purple-dark-text)]">
              42.5 GB / 100 GB (42.5% utilized)
            </span>
          </div>

          <div className="w-full h-2.5 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)] rounded-md overflow-hidden">
            <div
              className="h-full bg-[#003E83] rounded-md transition-all duration-500"
              style={{ width: '42.5%' }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] pt-1">
            <div>• Database: <strong>14.2 GB</strong></div>
            <div>• Destination Media: <strong>23.8 GB</strong></div>
            <div>• Application Cache: <strong>4.5 GB</strong></div>
          </div>
        </div>
      </div>

      {/* Card 4: Last Build Timestamp */}
      <div className="p-4 rounded-md bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex items-center justify-between text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[var(--color-text-muted-light)]" />
          <span>System Environment & Timezone:</span>
        </div>
        <span className="font-mono font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
          Asia/Phnom_Penh (GMT+07:00 ICT)
        </span>
      </div>
    </div>
  );
}
