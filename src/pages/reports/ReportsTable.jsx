import { useState } from 'react';
import { Search, Filter, Star, ChevronDown, MapPin, Calendar, Users, FolderTree, Eye } from 'lucide-react';
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
  const itemsPerPage = 6;

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
          <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] border border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)] rounded-md">
            Active / Approved
          </span>
        );
      case 'pending':
      case 'upcoming':
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)] text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)] border border-[var(--color-warning-border)] dark:border-[var(--color-warning-dark-border)] rounded-md">
            Pending / Scheduled
          </span>
        );
      case 'suspended':
      case 'flagged':
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold bg-[var(--color-danger-bg)] dark:bg-[var(--color-danger-dark-bg)] text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] border border-[var(--color-danger-border)] dark:border-[var(--color-danger-dark-border)] rounded-md">
            Flagged / Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold bg-[var(--color-neutral-badge-bg)] dark:bg-[var(--color-neutral-badge-dark-bg)] text-[var(--color-neutral-badge-text)] dark:text-[var(--color-neutral-badge-dark-text)] border border-[var(--color-neutral-badge-border)] dark:border-[var(--color-neutral-badge-dark-border)] rounded-md">
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

      {/* Table Toolbar Search & Filter */}
      <div className="p-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-input-dark-bg)]/50">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)]" />
          <input
            type="text"
            placeholder="Search report dataset..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-[var(--color-white)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 absolute left-3 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)] pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="text-xs bg-[var(--color-white)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md pl-8 pr-7 py-2 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none cursor-pointer font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active / Approved</option>
              <option value="Pending">Pending / Scheduled</option>
              <option value="Suspended">Flagged / Suspended</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)]" />
          </div>

          <span className="text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
            {totalRecords} records
          </span>
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
          <thead className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-input-dark-bg)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider text-[11px] font-bold">
            {activeTab === 'places' && (
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Place Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Province</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Reviews</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                
              </tr>
            )}
            {activeTab === 'events' && (
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Event Title</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Start Date</th>
                <th className="py-3.5 px-4">End Date</th>
                <th className="py-3.5 px-4">Attendees</th>
                <th className="py-3.5 px-4">Status</th>
                
              </tr>
            )}
            {activeTab === 'users' && (
              <tr>
                <th className="py-3.5 px-4">User ID</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4">Reviews Written</th>
                <th className="py-3.5 px-4">Status</th>
                
              </tr>
            )}
            {activeTab === 'reviews' && (
              <tr>
                <th className="py-3.5 px-4">Review ID</th>
                <th className="py-3.5 px-4">User Name</th>
                <th className="py-3.5 px-4">Target Place</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Comment</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                
              </tr>
            )}
            {activeTab === 'categories' && (
              <tr>
                <th className="py-3.5 px-4">Category ID</th>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Total Places</th>
                <th className="py-3.5 px-4">Status</th>
                
              </tr>
            )}
          </thead>
          <tbody key={`${activeTab}-${currentPage}`} className="divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)] animate-page-enter">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-16" /></td>
                  <td className="py-4 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-32" /></td>
                  <td className="py-4 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-24" /></td>
                  <td className="py-4 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-20" /></td>
                  <td className="py-4 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-12" /></td>
                  <td className="py-4 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-14" /></td>
                  <td className="py-4 px-4"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-24" /></td>
                  <td className="py-4 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-20" /></td>
                  
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)] font-medium">
                  No report data matching selected search or status filters.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <tr key={i} className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/40 transition-colors">
                  {activeTab === 'places' && (
                    <>
                      <td className="py-3.5 px-4 font-mono text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)]">{row.id}</td>
                      <td className="py-3.5 px-4 font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{row.name}</td>
                      <td className="py-3.5 px-4">{row.category}</td>
                      <td className="py-3.5 px-4">{row.province}</td>
                      <td className="py-3.5 px-4 font-semibold text-amber-500 inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {row.rating}
                      </td>
                      <td className="py-3.5 px-4">{row.reviews}</td>
                      <td className="py-3.5 px-4">{getStatusBadge(row.status)}</td>
                      <td className="py-3.5 px-4 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">{row.createdAt}</td>
                    </>
                  )}
                  {activeTab === 'events' && (
                    <>
                      <td className="py-3.5 px-4 font-mono text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)]">{row.id}</td>
                      <td className="py-3.5 px-4 font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{row.title}</td>
                      <td className="py-3.5 px-4">{row.location}</td>
                      <td className="py-3.5 px-4">{row.startDate}</td>
                      <td className="py-3.5 px-4">{row.endDate}</td>
                      <td className="py-3.5 px-4 font-semibold">{row.attendees?.toLocaleString()}</td>
                      <td className="py-3.5 px-4">{getStatusBadge(row.status)}</td>
                    </>
                  )}
                  {activeTab === 'users' && (
                    <>
                      <td className="py-3.5 px-4 font-mono text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)]">{row.id}</td>
                      <td className="py-3.5 px-4 font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{row.name}</td>
                      <td className="py-3.5 px-4 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">{row.email}</td>
                      <td className="py-3.5 px-4 font-medium">{row.role}</td>
                      <td className="py-3.5 px-4 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">{row.joinedDate}</td>
                      <td className="py-3.5 px-4 font-semibold">{row.reviewsCount}</td>
                      <td className="py-3.5 px-4">{getStatusBadge(row.status)}</td>
                    </>
                  )}
                  {activeTab === 'reviews' && (
                    <>
                      <td className="py-3.5 px-4 font-mono text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)]">{row.id}</td>
                      <td className="py-3.5 px-4 font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{row.userName}</td>
                      <td className="py-3.5 px-4">{row.placeName}</td>
                      <td className="py-3.5 px-4 font-semibold text-amber-500 inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {row.rating}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate">{row.comment}</td>
                      <td className="py-3.5 px-4 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">{row.date}</td>
                      <td className="py-3.5 px-4">{getStatusBadge(row.status)}</td>
                    </>
                  )}
                  {activeTab === 'categories' && (
                    <>
                      <td className="py-3.5 px-4 font-mono text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)]">{row.id}</td>
                      <td className="py-3.5 px-4 font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{row.name}</td>
                      <td className="py-3.5 px-4 max-w-md">{row.description}</td>
                      <td className="py-3.5 px-4 font-semibold">{row.totalPlaces}</td>
                      <td className="py-3.5 px-4">{getStatusBadge(row.status)}</td>
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
    </div>
  );
}
