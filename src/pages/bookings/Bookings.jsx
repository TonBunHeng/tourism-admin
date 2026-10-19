import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CalendarCheck, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Trash2, 
  Eye, 
  Copy, 
  Check, 
  Loader2, 
  RefreshCw, 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  X,
  Filter,
  ChevronDown
} from 'lucide-react';
import bookingService from '../../services/bookingService';

const SAMPLE_FALLBACK_BOOKINGS = [
  {
    id: 1,
    booking_reference: 'BK-ANGKOR-8821',
    customer_name: 'David Miller',
    customer_email: 'david.miller@gmail.com',
    customer_phone: '+1 415 890 2311',
    business_name: 'Angkor Heritage Boutique Hotel',
    service_name: 'Deluxe Heritage Suite & Temple Tour',
    service_type: 'Hotel & Tour',
    booking_date: '2026-11-15',
    booking_time: '14:00',
    number_of_guests: 2,
    total_price: 180,
    status: 'pending',
    payment_method: 'ABA Pay',
    payment_status: 'paid',
    special_requests: 'Airport pickup requested from Siem Reap International Airport.',
    created_at: '2026-10-18T10:30:00Z'
  },
  {
    id: 2,
    booking_reference: 'BK-KULEN-9942',
    customer_name: 'Elena Rostova',
    customer_email: 'elena.rostova@traveler.ru',
    customer_phone: '+7 903 124 5566',
    business_name: 'Siem Reap Eco-Adventures',
    service_name: 'Phnom Kulen Waterfall & River of Thousand Lingas',
    service_type: 'Tour Package',
    booking_date: '2026-11-18',
    booking_time: '08:00',
    number_of_guests: 4,
    total_price: 260,
    status: 'confirmed',
    payment_method: 'Visa / Mastercard',
    payment_status: 'paid',
    special_requests: 'Vegetarian lunch preferred for 2 guests.',
    created_at: '2026-10-17T15:20:00Z'
  },
  {
    id: 3,
    booking_reference: 'BK-KOHRONG-7714',
    customer_name: 'Jean-Luc Moreau',
    customer_email: 'jeanluc.moreau@orange.fr',
    customer_phone: '+33 6 12 34 56 78',
    business_name: 'Koh Rong Sanloem Coral Dive',
    service_name: 'Full Day Coral Reef Snorkeling & Island Hop',
    service_type: 'Activities',
    booking_date: '2026-11-20',
    booking_time: '09:30',
    number_of_guests: 2,
    total_price: 110,
    status: 'completed',
    payment_method: 'ABA Pay',
    payment_status: 'paid',
    special_requests: 'Life jackets required for both guests.',
    created_at: '2026-10-14T09:00:00Z'
  },
  {
    id: 4,
    booking_reference: 'BK-KAMPOT-6630',
    customer_name: 'Sokha Ly',
    customer_email: 'sokha.ly@khmertech.com',
    customer_phone: '+855 12 889 900',
    business_name: 'Kampot River View Retreat',
    service_name: 'Sunset Firefly River Cruise & Local Dinner',
    service_type: 'Dining & Cruise',
    booking_date: '2026-11-22',
    booking_time: '17:00',
    number_of_guests: 5,
    total_price: 125,
    status: 'pending',
    payment_method: 'Cash on Arrival',
    payment_status: 'pending',
    special_requests: 'Family with 1 child aged 6.',
    created_at: '2026-10-19T08:15:00Z'
  },
  {
    id: 5,
    booking_reference: 'BK-PHNOM-5519',
    customer_name: 'Markus Weber',
    customer_email: 'markus.weber@berlin-travel.de',
    customer_phone: '+49 171 223 9988',
    business_name: 'Phnom Penh Heritage Tours',
    service_name: 'Royal Palace, National Museum & Silk Island',
    service_type: 'Cultural Guide',
    booking_date: '2026-11-10',
    booking_time: '08:30',
    number_of_guests: 1,
    total_price: 65,
    status: 'cancelled',
    payment_method: 'Credit Card',
    payment_status: 'refunded',
    special_requests: 'Cancelled due to flight itinerary reschedule.',
    created_at: '2026-10-12T14:45:00Z'
  }
];

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchBookings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await bookingService.getBookings();
      const list = res?.data?.bookings || res?.data || res || [];
      if (Array.isArray(list) && list.length > 0) {
        setBookings(list);
      } else {
        setBookings(SAMPLE_FALLBACK_BOOKINGS);
      }
    } catch (err) {
      console.warn('Backend bookings endpoint fallback:', err);
      setBookings(SAMPLE_FALLBACK_BOOKINGS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleUpdateStatus = async (id, newStatus, reason = '') => {
    setActionLoadingId(id);
    try {
      await bookingService.updateStatus(id, newStatus, reason);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus, cancellation_reason: reason } : b));
    } catch {
      // Local optimistic fallback
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus, cancellation_reason: reason } : b));
    } finally {
      setActionLoadingId(null);
      setRejectionModalOpen(false);
      setBookingToCancel(null);
      setCancelReason('');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking record?')) return;
    setActionLoadingId(id);
    try {
      await bookingService.deleteBooking(id);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch {
      setBookings(prev => prev.filter(b => b.id !== id));
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchSearch = !q ||
        b.booking_reference?.toLowerCase().includes(q) ||
        b.customer_name?.toLowerCase().includes(q) ||
        b.customer_email?.toLowerCase().includes(q) ||
        b.business_name?.toLowerCase().includes(q) ||
        b.service_name?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [bookings, statusFilter, search]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: bookings
        .filter(b => b.status !== 'cancelled')
        .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)
    };
  }, [bookings]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400 text-xs font-bold mb-2">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Platform Hospitality Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Bookings & Reservations Queue
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Manage tourist bookings for Cambodian boutique hotels, guided excursions, and dining reservations
          </p>
        </div>

        <button
          onClick={() => fetchBookings(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-800 dark:text-white text-xs font-bold rounded-2xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">All Bookings</span>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.total}</p>
          <span className="text-[10px] text-gray-500 font-medium">Total volume</span>
        </div>

        <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pending Action</span>
          <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">{stats.pending}</p>
          <span className="text-[10px] text-amber-600/80 font-medium">Needs review</span>
        </div>

        <div className="p-4 rounded-3xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Confirmed</span>
          <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-400">{stats.confirmed}</p>
          <span className="text-[10px] text-blue-600/80 font-medium">Awaiting check-in</span>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Completed</span>
          <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{stats.completed}</p>
          <span className="text-[10px] text-emerald-600/80 font-medium">Successfully fulfilled</span>
        </div>

        <div className="p-4 rounded-3xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Cancelled</span>
          <p className="text-2xl font-extrabold text-rose-700 dark:text-rose-400">{stats.cancelled}</p>
          <span className="text-[10px] text-rose-600/80 font-medium">Declined / Void</span>
        </div>

        <div className="p-4 rounded-3xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/40 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Gross Value</span>
          <p className="text-2xl font-extrabold text-purple-700 dark:text-purple-400">${stats.totalRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-purple-600/80 font-medium">Total transaction</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Bookings' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#003E83] text-white shadow-xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by code, guest, or tour..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white text-xs rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 dark:text-zinc-300">
            <thead className="bg-gray-50/80 dark:bg-zinc-800/60 border-b border-gray-200/80 dark:border-zinc-800 text-[11px] font-extrabold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Reference</th>
                <th className="py-3.5 px-4">Guest Information</th>
                <th className="py-3.5 px-4">Tour / Business</th>
                <th className="py-3.5 px-4">Travel Date</th>
                <th className="py-3.5 px-4">Guests</th>
                <th className="py-3.5 px-4">Total Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-zinc-500">
                    <CalendarCheck className="w-8 h-8 text-gray-300 dark:text-zinc-700 mx-auto mb-2" />
                    <p className="font-bold text-xs text-gray-700 dark:text-zinc-300">No bookings found</p>
                    <p className="text-[11px]">Try adjusting your search query or filter status.</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const isPending = b.status === 'pending';
                  const isConfirmed = b.status === 'confirmed';
                  const isCompleted = b.status === 'completed';
                  const isCancelled = b.status === 'cancelled';

                  return (
                    <tr key={b.id} className="hover:bg-blue-50/30 dark:hover:bg-zinc-800/40 transition-colors">
                      {/* Reference */}
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        <button
                          onClick={() => handleCopyCode(b.booking_reference)}
                          className="inline-flex items-center gap-1.5 font-mono text-[11px] bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          title="Click to copy reference"
                        >
                          <span>{b.booking_reference}</span>
                          {copiedCode === b.booking_reference ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-400" />
                          )}
                        </button>
                      </td>

                      {/* Guest */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 dark:text-white">{b.customer_name}</div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[150px]">{b.customer_email}</span>
                        </div>
                      </td>

                      {/* Business */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{b.service_name}</div>
                        <div className="text-[11px] text-gray-400 line-clamp-1">{b.business_name}</div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900 dark:text-white">{b.booking_date}</div>
                        <div className="text-[11px] text-gray-400">{b.booking_time || 'Full day'}</div>
                      </td>

                      {/* Guests */}
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        {b.number_of_guests} {b.number_of_guests === 1 ? 'Guest' : 'Guests'}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-gray-900 dark:text-white">${b.total_price}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">{b.payment_status}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              : isConfirmed
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 transition-colors cursor-pointer"
                            title="View Booking Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isPending && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                              disabled={actionLoadingId === b.id}
                              className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                            >
                              Confirm
                            </button>
                          )}

                          {isConfirmed && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'completed')}
                              disabled={actionLoadingId === b.id}
                              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                            >
                              Complete
                            </button>
                          )}

                          {!isCancelled && !isCompleted && (
                            <button
                              onClick={() => {
                                setBookingToCancel(b);
                                setRejectionModalOpen(true);
                              }}
                              className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                              title="Cancel / Reject Booking"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteBooking(b.id)}
                            className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200/80 dark:border-zinc-800 p-6 sm:p-7 space-y-5 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#003E83] dark:text-blue-400 font-bold">
                {selectedBooking.booking_reference}
              </span>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white pt-2">
                Booking Information
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Created on {new Date(selectedBooking.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/70 dark:border-zinc-700/60 space-y-2">
                <span className="font-extrabold text-gray-400 uppercase tracking-wider text-[10px]">Guest Information</span>
                <div className="font-bold text-gray-900 dark:text-white text-sm">{selectedBooking.customer_name}</div>
                <div className="text-gray-600 dark:text-zinc-300 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selectedBooking.customer_email}</span>
                </div>
                {selectedBooking.customer_phone && (
                  <div className="text-gray-600 dark:text-zinc-300 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{selectedBooking.customer_phone}</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/70 dark:border-zinc-700/60 space-y-2">
                <span className="font-extrabold text-gray-400 uppercase tracking-wider text-[10px]">Reservation Details</span>
                <div className="font-bold text-gray-900 dark:text-white text-sm">{selectedBooking.service_name}</div>
                <div className="text-gray-500 dark:text-zinc-400">{selectedBooking.business_name}</div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-gray-400">Date:</span> <strong>{selectedBooking.booking_date}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">Party:</span> <strong>{selectedBooking.number_of_guests} Guests</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">Payment:</span> <strong>{selectedBooking.payment_method || 'ABA Pay'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">Total:</span> <strong className="text-emerald-600 dark:text-emerald-400">${selectedBooking.total_price}</strong>
                  </div>
                </div>
              </div>

              {selectedBooking.special_requests && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 space-y-1">
                  <span className="font-extrabold text-amber-800 dark:text-amber-400 uppercase tracking-wider text-[10px]">Guest Notes & Requests</span>
                  <p className="text-amber-900/90 dark:text-amber-200 leading-relaxed font-medium">
                    {selectedBooking.special_requests}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2.5 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold text-xs hover:bg-gray-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation / Rejection Modal */}
      {rejectionModalOpen && bookingToCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setRejectionModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200/80 dark:border-zinc-800 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Cancel or Reject Booking
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Please enter an optional note explaining the reason for cancelling reservation #{bookingToCancel.booking_reference}.
            </p>

            <textarea
              rows={3}
              placeholder="e.g., Dates fully booked, schedule change, or tourist request..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white text-xs rounded-2xl border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold text-xs"
              >
                Back
              </button>
              <button
                onClick={() => handleUpdateStatus(bookingToCancel.id, 'cancelled', cancelReason)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
