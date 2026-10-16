import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, ChevronDown, MapPin, Calendar, Users, FolderTree, Eye, Landmark, User, X } from 'lucide-react';
import SimplePagination from '../../components/common/SimplePagination';

export default function ReportsTable({
  activeTab,
  onTabChange,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  data,
  isLoading
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setSelectedItem(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedItem]);

  const tabs = [
    { id: 'places', label: 'Places Report', icon: MapPin },
    { id: 'events', label: 'Events Report', icon: Calendar },
    { id: 'users', label: 'Users Report', icon: Users },
    { id: 'reviews', label: 'Reviews Report', icon: Star },
    { id: 'categories', label: 'Categories Report', icon: FolderTree }
  ];

  const totalRecords = data.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] border border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)]">
            {status || 'Active'}
          </span>
        );
      case 'pending':
      case 'upcoming':
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)] text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)] border border-[var(--color-warning-border)] dark:border-[var(--color-warning-dark-border)]">
            {status || 'Pending'}
          </span>
        );
      case 'suspended':
      case 'flagged':
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-[var(--color-danger-bg)] dark:bg-[var(--color-danger-dark-bg)] text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] border border-[var(--color-danger-border)] dark:border-[var(--color-danger-dark-border)]">
            {status || 'Inactive'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-[var(--color-neutral-badge-bg)] dark:bg-[var(--color-neutral-badge-dark-bg)] text-[var(--color-neutral-badge-text)] dark:text-[var(--color-neutral-badge-dark-text)] border border-[var(--color-neutral-badge-border)] dark:border-[var(--color-neutral-badge-dark-border)]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] shadow-sm overflow-hidden transition-colors duration-200">
      {/* Category Navigation Tabs - System Settings Style */}
      <div className="w-full border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-2.5 sm:p-3 bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)]">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => { onTabChange(tab.id); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#003E83] text-white font-semibold'
                    : 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-[var(--color-text-primary-light)] dark:hover:text-[var(--color-white)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]'
                }`}
              >
                {Icon && (
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isSelected
                        ? 'text-[var(--color-white)]'
                        : 'text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]'
                    }`}
                  />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Toolbar Filter */}
      <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
            All Reports
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
            {totalRecords} {totalRecords === 1 ? 'record' : 'records'}
          </span>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active / Approved</option>
              <option value="Pending">Pending / Scheduled</option>
              <option value="Suspended">Flagged / Suspended</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile Card List View (Visible on Mobile Screens < sm) */}
      <div key={`mobile-${activeTab}-${currentPage}`} className="block sm:hidden divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)] animate-page-enter">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="p-4 space-y-3 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-20" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-24" />
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2" />
            </div>
          ))
        ) : paginatedData.length === 0 ? (
          <div className="py-10 px-4 text-center text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)] font-medium text-xs">
            No report data matching selected search or status filters.
          </div>
        ) : (
          paginatedData.map((row, i) => (
            <div key={i} className="p-4 space-y-2 hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/40 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)] font-bold">
                  #{row.id}
                </span>
                <div>{getStatusBadge(row.status)}</div>
              </div>

              {activeTab === 'places' && (
                <>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {row.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">Cat:</span> {row.category}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">Province:</span> {row.province}</div>
                    <div className="inline-flex items-center gap-1 font-semibold text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400" /> {row.rating} ({row.reviews} revs)
                    </div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">Date:</span> {row.createdAt}</div>
                  </div>
                </>
              )}

              {activeTab === 'events' && (
                <>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {row.title}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">Loc:</span> {row.location}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">Attended:</span> {row.attendees?.toLocaleString()}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">Start:</span> {row.startDate}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">End:</span> {row.endDate}</div>
                  </div>
                </>
              )}

              {activeTab === 'users' && (
                <>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {row.name}
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                    {row.email}
                  </p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] pt-1">
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">Role:</span> {row.role}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">Joined:</span> {row.joinedDate}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">Reviews:</span> {row.reviewsCount}</div>
                  </div>
                </>
              )}

              {activeTab === 'reviews' && (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                      {row.userName}
                    </h4>
                    <span className="font-semibold text-xs text-amber-500 inline-flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" /> {row.rating}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    On: <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{row.placeName}</span>
                  </p>
                  <p className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)] italic line-clamp-2">
                    "{row.comment}"
                  </p>
                  <p className="text-[11px] text-right text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)] pt-1">
                    {row.date}
                  </p>
                </>
              )}

              {activeTab === 'categories' && (
                <>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {row.name}
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] line-clamp-2">
                    {row.description}
                  </p>
                  <div className="text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] pt-1">
                    Total Places: <span className="text-[var(--color-primary)] dark:text-[var(--color-brand-teal)]">{row.totalPlaces}</span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end mt-2 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                <button
                  type="button"
                  onClick={() => setSelectedItem(row)}
                  className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-colors cursor-pointer"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs md:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
          <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider text-xs font-medium">
            {activeTab === 'places' && (
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center">#</th>
                <th className="px-4 py-3.5">Place & Category</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-44">Province</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">Rating</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-24">Reviews</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">Status</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">Created Date</th>
                <th className="pl-3 pr-4 py-3.5 text-right w-24 whitespace-nowrap">Actions</th>
              </tr>
            )}
            {activeTab === 'events' && (
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center">#</th>
                <th className="px-4 py-3.5">Event & Location</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">Start Date</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">End Date</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">Attendees</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">Status</th>
                <th className="pl-3 pr-4 py-3.5 text-right w-24 whitespace-nowrap">Actions</th>
              </tr>
            )}
            {activeTab === 'users' && (
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center">#</th>
                <th className="px-4 py-3.5">User & Email</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">Role</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">Joined Date</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">Reviews</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">Status</th>
                <th className="pl-3 pr-4 py-3.5 text-right w-24 whitespace-nowrap">Actions</th>
              </tr>
            )}
            {activeTab === 'reviews' && (
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center">#</th>
                <th className="px-4 py-3.5">User & Review</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-44">Target Place</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">Rating</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">Date</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">Status</th>
                <th className="pl-3 pr-4 py-3.5 text-right w-24 whitespace-nowrap">Actions</th>
              </tr>
            )}
            {activeTab === 'categories' && (
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center">#</th>
                <th className="px-4 py-3.5">Category Name</th>
                <th className="px-3 py-3.5">Description</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">Total Places</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">Status</th>
                <th className="pl-3 pr-4 py-3.5 text-right w-24 whitespace-nowrap">Actions</th>
              </tr>
            )}
          </thead>
          <tbody key={`${activeTab}-${currentPage}`} className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)] animate-page-enter">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-16" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-32" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-24" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-20" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-12" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-14" /></td>
                  <td className="py-3.5 px-4"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-24" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-20" /></td>
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)] font-medium">
                  No report data matching selected search or status filters.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <tr key={i} className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/40 transition-colors">
                  {activeTab === 'places' && (
                    <>
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + i + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                            <Landmark className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                              {row.name}
                            </p>
                            <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] border border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)]">
                              {row.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{row.province}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-[var(--color-warning-text)] text-[var(--color-warning-text)] shrink-0" />
                          <span className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                            {Number(row.rating || 0).toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                        {row.reviews}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                        {row.createdAt}
                      </td>
                      <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(row)}
                            className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'events' && (
                    <>
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + i + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                              {row.title}
                            </p>
                            <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{row.location}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                        {row.startDate}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                        {row.endDate}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                        {row.attendees?.toLocaleString()}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(row)}
                            className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'users' && (
                    <>
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + i + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                              {row.name}
                            </p>
                            <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                              {row.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs">
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] border border-gray-200 dark:border-zinc-700">
                          {row.role}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                        {row.joinedDate}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                        {row.reviewsCount}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(row)}
                            className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'reviews' && (
                    <>
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + i + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                              {row.userName}
                            </p>
                            <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate line-clamp-1">
                              {row.comment || 'Tourist review'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{row.placeName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-[var(--color-warning-text)] text-[var(--color-warning-text)] shrink-0" />
                          <span className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                            {Number(row.rating || 0).toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                        {row.date}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(row)}
                            className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'categories' && (
                    <>
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + i + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                            <FolderTree className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                            {row.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] max-w-xs truncate">
                        {row.description}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                        {row.totalPlaces}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(row)}
                            className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Simple Pagination Footer */}
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        startIndex={startIndex}
        endIndex={endIndex}
        totalRecords={totalRecords}
        label="records"
      />

      {/* Details View Modal */}
      {selectedItem && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-[var(--color-white)] dark:bg-[#18181b] rounded-md shadow-2xl max-w-lg w-full mx-4 p-6 relative border border-[var(--color-border-subtle-light)] dark:border-zinc-800 animate-alert-popup overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle-light)] dark:border-zinc-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                  {activeTab === 'places' && <Landmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                  {activeTab === 'events' && <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                  {activeTab === 'users' && <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                  {activeTab === 'reviews' && <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                  {activeTab === 'categories' && <FolderTree className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--color-text-primary-light)] dark:text-white">
                    {activeTab === 'places' && selectedItem.name}
                    {activeTab === 'events' && selectedItem.title}
                    {activeTab === 'users' && selectedItem.name}
                    {activeTab === 'reviews' && `Review by ${selectedItem.userName}`}
                    {activeTab === 'categories' && selectedItem.name}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted-light)] dark:text-zinc-400 font-mono">
                    ID #{selectedItem.id} • {activeTab.toUpperCase()} REPORT
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-md text-[var(--color-text-muted-light)] hover:text-[var(--color-text-primary-light)] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body with Specific Tab Details */}
            <div className="space-y-4 text-xs sm:text-sm">
              {activeTab === 'places' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Category</span>
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.category}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Province</span>
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.province}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Rating & Score</span>
                      <span className="font-semibold text-amber-500 inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {Number(selectedItem.rating || 0).toFixed(1)} ({selectedItem.reviews} reviews)
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Status</span>
                      <div className="mt-0.5">{getStatusBadge(selectedItem.status)}</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800 space-y-1">
                    <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Location Address</span>
                    <p className="font-medium text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.location || 'Cambodia'}</p>
                    <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-zinc-400 block pt-1 font-mono">Created Date: {selectedItem.createdAt}</span>
                  </div>
                </div>
              )}

              {activeTab === 'events' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Location</span>
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.location}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Status</span>
                      <div className="mt-0.5">{getStatusBadge(selectedItem.status)}</div>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Start Date</span>
                      <span className="font-semibold font-mono text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.startDate}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">End Date</span>
                      <span className="font-semibold font-mono text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.endDate}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
                    <span className="text-xs font-medium text-blue-900 dark:text-blue-300">Total Registered Attendees</span>
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{selectedItem.attendees?.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Email Address</span>
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-white truncate block">{selectedItem.email}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">User Role</span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-[var(--color-text-primary-light)] dark:text-white border border-gray-200 dark:border-zinc-700 inline-block mt-0.5">
                        {selectedItem.role}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Joined Date</span>
                      <span className="font-semibold font-mono text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.joinedDate}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Reviews Written</span>
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.reviewsCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <span className="text-xs font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400">Account Status</span>
                    <div>{getStatusBadge(selectedItem.status)}</div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Target Place</span>
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-white flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        {selectedItem.placeName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Rating</span>
                      <span className="font-bold text-amber-500 inline-flex items-center gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {Number(selectedItem.rating || 0).toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Submission Date</span>
                      <span className="font-semibold font-mono text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.date}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Moderation Status</span>
                      <div className="mt-0.5">{getStatusBadge(selectedItem.status)}</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block mb-1">Tourist Feedback</span>
                    <p className="italic text-xs text-[var(--color-text-secondary-light)] dark:text-zinc-300 leading-relaxed bg-[var(--color-white)] dark:bg-zinc-800 p-2.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-zinc-700">
                      "{selectedItem.comment || 'No comment text provided.'}"
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'categories' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Total Places Listed</span>
                      <span className="text-base font-bold text-[#003E83] dark:text-blue-400">{selectedItem.totalPlaces} Places</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">Status</span>
                      <div className="mt-0.5">{getStatusBadge(selectedItem.status)}</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block mb-1">Description</span>
                    <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-zinc-300 leading-relaxed">
                      {selectedItem.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-[var(--color-border-subtle-light)] dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-xs md:text-sm font-medium rounded-md bg-[#003E83] hover:bg-[#002e62] text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
