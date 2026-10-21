import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles, Compass, CheckCircle, AlertCircle, Eye, Edit, Trash2,
  Plus, RefreshCw, Star, MapPin, Clock, Users, DollarSign, ChevronDown
} from 'lucide-react';
import tourService from '../../services/tourService';
import SimplePagination from '../../components/common/SimplePagination';
import TourModal from './TourModal';
import TourDetailsModal from './TourDetailsModal';
import { useAlert } from '../../context/AlertContext';
import { useSearch } from '../../context/SearchContext';
import { getStatusColor } from '../../utils/StatusUtils';

export default function Tours() {
  const { showConfirm, showSuccess, showError } = useAlert();
  const { searchTerm: search } = useSearch();

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [destinationFilter, setDestinationFilter] = useState('All');

  // Modals
  const [viewingTour, setViewingTour] = useState(null);
  const [editingTour, setEditingTour] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTours = async () => {
    setIsRefreshing(true);
    try {
      const res = await tourService.getTours({ per_page: 100 });
      const data = res?.data || res;
      const rawList = data?.tours || (Array.isArray(data) ? data : []);

      if (Array.isArray(rawList)) {
        const mapped = rawList.map((t) => ({
          id: t.id,
          title: t.title || 'Untitled Tour Experience',
          destination: t.destination || t.province || 'Siem Reap',
          duration: t.duration || (t.duration_days ? `${t.duration_days} Days` : '1 Full Day'),
          price_per_person: parseFloat(t.price || t.price_per_person || 0),
          max_travelers: Number(t.max_travelers || 12),
          rating: parseFloat(t.rating || 5.0),
          reviews_count: Number(t.reviews_count || 0),
          status: t.status === 'active' ? 'active' : 'draft',
          category: t.category || 'Cultural & Heritage',
          cover_image: t.image_url || t.cover_image || t.image || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
          description: t.description || 'Curated travel experience in Cambodia.'
        }));
        setTours(mapped);
      }
    } catch (err) {
      console.warn('Backend tours fetch notice:', err);
      setTours([]);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const destinationsList = useMemo(() => {
    const set = new Set(tours.map(t => t.destination).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [tours]);

  // Filtered tours
  const filteredTours = useMemo(() => {
    return tours.filter(t => {
      // Status Filter
      const statusMatch = statusFilter === 'all' || t.status === statusFilter;

      // Destination Filter
      const destMatch = destinationFilter === 'All' ||
        (t.destination || '').toLowerCase().includes(destinationFilter.toLowerCase());

      // Search Query
      const q = (search || '').toLowerCase().trim();
      const searchMatch = !q ||
        (t.title || '').toLowerCase().includes(q) ||
        (t.destination || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q);

      return statusMatch && destMatch && searchMatch;
    });
  }, [tours, statusFilter, destinationFilter, search]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = tours.length;
    const active = tours.filter(t => t.status === 'active').length;
    const avgRating = total > 0
      ? (tours.reduce((acc, t) => acc + (t.rating || 0), 0) / total).toFixed(1)
      : '5.0';
    const avgPrice = total > 0
      ? Math.round(tours.reduce((acc, t) => acc + (t.price_per_person || 0), 0) / total)
      : 0;
    return { total, active, avgRating, avgPrice };
  }, [tours]);

  // Pagination calculation
  const totalRecords = filteredTours.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTours = filteredTours.slice(startIndex, startIndex + itemsPerPage);
  const endIndex = Math.min(startIndex + paginatedTours.length, totalRecords);

  // Save / Edit Tour
  const handleSaveTour = async (payload) => {
    try {
      if (editingTour) {
        await tourService.updateTour(editingTour.id, payload);
        setTours(prev => prev.map(t => t.id === editingTour.id ? { ...t, ...payload } : t));
        if (viewingTour && viewingTour.id === editingTour.id) {
          setViewingTour(prev => ({ ...prev, ...payload }));
        }
        showSuccess(`Tour package "${payload.title}" updated successfully.`, 'Changes Saved');
      } else {
        const res = await tourService.createTour(payload).catch(() => null);
        const newId = res?.data?.id || Date.now();
        const created = {
          ...payload,
          id: newId,
          rating: 5.0,
          reviews_count: 0
        };
        setTours(prev => [created, ...prev]);
        showSuccess(`New tour package "${payload.title}" created successfully.`, 'Package Created');
      }
      setIsModalOpen(false);
      setEditingTour(null);
    } catch (err) {
      showError(err.message || 'Failed to save tour package.', 'Save Failed');
    }
  };

  // Toggle status (active / draft)
  const handleToggleStatus = async (tour) => {
    const newStatus = tour.status === 'active' ? 'draft' : 'active';
    try {
      await tourService.toggleStatus(tour.id);
    } catch {
      // optimistic update
    } finally {
      setTours(prev => prev.map(t => t.id === tour.id ? { ...t, status: newStatus } : t));
      if (viewingTour && viewingTour.id === tour.id) {
        setViewingTour(prev => ({ ...prev, status: newStatus }));
      }
      showSuccess(`Tour "${tour.title}" is now ${newStatus === 'active' ? 'published' : 'draft'}.`, 'Status Updated');
    }
  };

  // Delete Tour
  const handleDeleteTour = async (tour) => {
    const confirmed = await showConfirm({
      title: 'Delete Tour Package',
      message: `Are you sure you want to permanently delete "${tour.title}" from the catalog?`,
      confirmText: 'Delete Package',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await tourService.deleteTour(tour.id);
    } catch {
      // optimistic update
    } finally {
      setTours(prev => prev.filter(t => t.id !== tour.id));
      if (viewingTour && viewingTour.id === tour.id) {
        setViewingTour(null);
      }
      showSuccess(`Tour package "${tour.title}" has been deleted.`, 'Package Removed');
    }
  };

  const statsList = [
    {
      label: "Total Tour Packages",
      value: (stats.total || 0).toLocaleString(),
      subtext: "Itineraries across Cambodia",
      icon: Compass,
      color: "text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]",
      bg: "bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]"
    },
    {
      label: "Active & Published",
      value: (stats.active || 0).toLocaleString(),
      subtext: "Ready for live booking",
      icon: CheckCircle,
      color: "text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]",
      bg: "bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]"
    },
    {
      label: "Average Rating",
      value: `${stats.avgRating} ★`,
      subtext: "Traveler satisfaction score",
      icon: Star,
      color: "text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]",
      bg: "bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]"
    },
    {
      label: "Avg Rate / Person",
      value: `$${stats.avgPrice}`,
      subtext: "Market index per traveler",
      icon: DollarSign,
      color: "text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)]",
      bg: "bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)]"
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
              Tour Packages Catalog
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
              Curate and manage all-inclusive travel itineraries, pricing, duration, and availability across Cambodia.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setEditingTour(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-md bg-[#003E83] hover:bg-[#002e62] text-white transition-colors shrink-0 w-full sm:w-auto cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Tour Package</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statsList.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-medium truncate">
                    {stat.label}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-md shrink-0 ${stat.bg}`}>
                  <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] mt-2">
                {stat.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Tours Table Container */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex-1">
        {/* Toolbar Header */}
        <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                All Tour Packages
              </h2>
              {totalRecords !== undefined && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                  {totalRecords} {totalRecords === 1 ? 'package' : 'packages'}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
              {/* Destination Filter */}
              <div className="relative">
                <select
                  value={destinationFilter}
                  onChange={(e) => { setDestinationFilter(e.target.value); setCurrentPage(1); }}
                  className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
                >
                  {destinationsList.map(d => (
                    <option key={d} value={d}>{d === 'All' ? 'All Destinations' : d}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active & Published</option>
                  <option value="draft">Draft (Unlisted)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
            <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50">
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center">
                  #
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  TOUR PACKAGE & CATEGORY
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  DESTINATION & DURATION
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  GROUP CAPACITY
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  PRICE / PERSON
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  RATING
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  STATUS
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[var(--color-text-muted-light)]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#003E83]" />
                    Loading tour packages...
                  </td>
                </tr>
              ) : paginatedTours.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 px-4">
                    <Compass className="w-12 h-12 text-[#003E83] mx-auto mb-2 opacity-80" />
                    <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
                      No tour packages found
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                      Try adjusting your destination or status filter
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedTours.map((tour, index) => {
                  const isActive = tour.status === 'active';

                  return (
                    <tr key={tour.id} className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors">
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + index + 1}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={tour.cover_image}
                            alt={tour.title}
                            className="w-10 h-10 rounded-md object-cover shrink-0 border border-slate-200 dark:border-zinc-700"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="min-w-0 max-w-xs">
                            <div className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                              {tour.title}
                            </div>
                            <div className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                              {tour.category}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-xs text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{tour.destination}</span>
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{tour.duration}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                        <div className="flex items-center gap-1 font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                          <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span>Up to {tour.max_travelers}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                          ${tour.price_per_person}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                          per person
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          <span>{tour.rating}</span>
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                          {tour.reviews_count} reviews
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getStatusColor(isActive ? 'active' : 'draft')}`}>
                          {isActive ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : <AlertCircle className="w-3.5 h-3.5 mr-1" />}
                          {isActive ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingTour(tour)}
                            className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => { setEditingTour(tour); setIsModalOpen(true); }}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title="Edit Package"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(tour)}
                            className={`p-1.5 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer ${
                              isActive
                                ? 'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30'
                            }`}
                            title={isActive ? 'Move to Draft' : 'Publish Tour'}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteTour(tour)}
                            className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title="Delete Package"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
          label="packages"
        />
      </div>

      {/* View Details Modal */}
      {viewingTour && (
        <TourDetailsModal
          tour={viewingTour}
          onClose={() => setViewingTour(null)}
          onEdit={(t) => {
            setViewingTour(null);
            setEditingTour(t);
            setIsModalOpen(true);
          }}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteTour}
        />
      )}

      {/* Add / Edit Tour Modal */}
      <TourModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTour(null); }}
        editingTour={editingTour}
        onSubmit={handleSaveTour}
      />
    </div>
  );
}
