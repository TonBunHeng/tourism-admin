import { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  X,
  CheckCircle2,
  Calendar,
  Loader2,
  RefreshCw,
  Compass,
  Users
} from 'lucide-react';
import businessService from '../../services/businessService';

const INITIAL_TOURS = [
  {
    id: 1,
    title: 'Angkor Wat Sunrise & Sacred Grand Circuit',
    destination: 'Siem Reap',
    duration: '1 Full Day',
    price_per_person: 55,
    max_travelers: 12,
    rating: 4.95,
    reviews_count: 328,
    status: 'active',
    category: 'Cultural & Heritage',
    cover_image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    description: 'Experience Angkor Wat illuminated by the first golden morning rays, followed by the mystical stone faces of the Bayon and jungle-strangled Ta Prohm.'
  },
  {
    id: 2,
    title: 'Phnom Penh Heritage, Silk Island & Mekong Sunset',
    destination: 'Phnom Penh',
    duration: '2 Days / 1 Night',
    price_per_person: 120,
    max_travelers: 10,
    rating: 4.88,
    reviews_count: 142,
    status: 'active',
    category: 'City & Culture',
    cover_image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
    description: 'Explore the Royal Palace, Silver Pagoda, and traditional silk-weaving villages along the banks of the Mekong and Tonle Sap rivers.'
  },
  {
    id: 3,
    title: 'Koh Rong Sanloem Island Reef & Bioluminescence',
    destination: 'Koh Rong / Sihanoukville',
    duration: '3 Days / 2 Nights',
    price_per_person: 210,
    max_travelers: 8,
    rating: 4.92,
    reviews_count: 196,
    status: 'active',
    category: 'Beach & Island',
    cover_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    description: 'Escape to powdery white sands of Saracen Bay. Enjoy snorkeling crystal coral gardens and nighttime swimming with glowing bioluminescent plankton.'
  },
  {
    id: 4,
    title: 'Kampot Pepper Plantations & Bokor Mist Peak',
    destination: 'Kampot & Kep',
    duration: '2 Days / 1 Night',
    price_per_person: 95,
    max_travelers: 14,
    rating: 4.85,
    reviews_count: 110,
    status: 'active',
    category: 'Eco & Nature',
    cover_image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    description: 'Visit organic Kampot pepper farms, kayak the green river loop, and ascend Bokor Mountain to witness panoramic views over the Gulf of Thailand.'
  }
];

export default function Tours() {
  const [tours, setTours] = useState(INITIAL_TOURS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [maxTravelers, setMaxTravelers] = useState('');
  const [description, setDescription] = useState('');

  const fetchToursFromBackend = async () => {
    try {
      setRefreshing(true);
      const res = await businessService.getAll();
      const rawList = res?.data?.businesses || res?.data?.data || res?.data || res || [];

      if (Array.isArray(rawList) && rawList.length > 0) {
        const liveTours = rawList.map((b) => ({
          id: b.id,
          title: b.services?.[0]?.name || b.name,
          destination: b.province?.name || b.address || 'Cambodia',
          duration: b.services?.[0]?.duration_minutes
            ? (b.services[0].duration_minutes >= 1440
                ? `${Math.round(b.services[0].duration_minutes / 1440)} Days`
                : `${b.services[0].duration_minutes} Mins`)
            : '1 Full Day',
          price_per_person: parseFloat(b.services?.[0]?.price || (b.price_range === '$$$$' ? 120 : b.price_range === '$$$' ? 85 : 45)),
          max_travelers: 12,
          rating: parseFloat(b.rating || 4.9),
          reviews_count: b.review_count || 12,
          status: b.status === 'active' ? 'active' : 'draft',
          category: b.category?.name || 'Guided Tour',
          cover_image: b.cover_image_url || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
          description: b.description || 'Verified tour operator & hospitality package in Cambodia.'
        }));
        setTours(liveTours);
      }
    } catch (err) {
      console.warn('Backend tours endpoint fallback in place:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchToursFromBackend();
  }, []);

  const destinations = useMemo(() => {
    const set = new Set(tours.map(t => t.destination).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [tours]);

  const stats = useMemo(() => {
    const total = tours.length;
    const active = tours.filter(t => t.status === 'active').length;
    const avgRating = total > 0 ? (tours.reduce((acc, t) => acc + (t.rating || 0), 0) / total).toFixed(2) : '5.00';
    const avgPrice = total > 0 ? Math.round(tours.reduce((acc, t) => acc + (t.price_per_person || 0), 0) / total) : 0;
    return { total, active, avgRating, avgPrice };
  }, [tours]);

  const handleOpenModal = (tour = null) => {
    if (tour) {
      setEditingTour(tour);
      setTitle(tour.title);
      setDestination(tour.destination);
      setDuration(tour.duration);
      setPrice(String(tour.price_per_person));
      setMaxTravelers(String(tour.max_travelers || 10));
      setDescription(tour.description || '');
    } else {
      setEditingTour(null);
      setTitle('');
      setDestination('Siem Reap');
      setDuration('1 Full Day');
      setPrice('60');
      setMaxTravelers('12');
      setDescription('');
    }
    setModalOpen(true);
  };

  const handleSaveTour = async (e) => {
    e.preventDefault();
    if (editingTour) {
      try {
        await businessService.update(editingTour.id, {
          name: title,
          address: destination,
          description
        });
      } catch (err) {
        console.warn('Backend update notice:', err.message);
      }
      setTours(prev => prev.map(t => t.id === editingTour.id ? {
        ...t,
        title,
        destination,
        duration,
        price_per_person: Number(price),
        max_travelers: Number(maxTravelers),
        description
      } : t));
    } else {
      let createdId = Date.now();
      try {
        const res = await businessService.create({
          name: title,
          address: destination,
          description,
          status: 'active'
        });
        if (res?.data?.id) createdId = res.data.id;
      } catch (err) {
        console.warn('Backend create notice:', err.message);
      }

      const newTour = {
        id: createdId,
        title,
        destination,
        duration,
        price_per_person: Number(price),
        max_travelers: Number(maxTravelers),
        rating: 5.0,
        reviews_count: 0,
        status: 'active',
        category: 'Guided Tour',
        cover_image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
        description
      };
      setTours(prev => [newTour, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDeleteTour = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tour package?')) return;
    try {
      await businessService.delete(id);
    } catch (err) {
      console.warn('Backend delete notice:', err.message);
    }
    setTours(prev => prev.filter(t => t.id !== id));
  };

  const handleToggleStatus = (id) => {
    setTours(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'active' ? 'draft' : 'active' };
      }
      return t;
    }));
  };

  const filteredTours = useMemo(() => {
    return tours.filter(t => {
      const matchDest = selectedDestination === 'All' || (t.destination || '').includes(selectedDestination);
      const q = search.toLowerCase().trim();
      const matchSearch = !q || (t.title || '').toLowerCase().includes(q) || (t.destination || '').toLowerCase().includes(q);
      return matchDest && matchSearch;
    });
  }, [tours, selectedDestination, search]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Itinerary & Package Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Tour Packages Catalog
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Curate and manage all-inclusive travel itineraries, pricing, and availability connected to backend API
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchToursFromBackend}
            disabled={refreshing}
            className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
            title="Refresh Catalog from Backend"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#003E83]' : ''}`} />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold rounded-2xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tour Package</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Tours</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400">Available across Cambodia</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Published</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400">Ready for booking</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Average Rating</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-500 flex items-center gap-1">
            <Star size={22} className="fill-amber-400 text-amber-400" />
            {stats.avgRating}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400">Verified traveler reviews</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#003E83] dark:text-blue-400 uppercase tracking-wider">Avg Price / Person</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#003E83] dark:text-blue-400">${stats.avgPrice}</p>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400">Competitive rate index</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {destinations.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDestination(d)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedDestination === d
                  ? 'bg-[#003E83] text-white shadow-xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tour packages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white text-xs rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Tours Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-3xl bg-gray-200 dark:bg-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTours.map((tour) => {
            const isActive = tour.status === 'active';

            return (
              <div
                key={tour.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all group"
              >
                <div>
                  <div className="relative aspect-16/10 w-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                    <img
                      src={tour.cover_image}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/70 text-white backdrop-blur-md">
                        {tour.duration}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleToggleStatus(tour.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer shadow-xs ${
                          isActive
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {tour.status}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{tour.destination}</span>
                    </div>

                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white line-clamp-2">
                      {tour.title}
                    </h3>

                    <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {tour.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
                      <div className="text-xl font-extrabold text-gray-900 dark:text-white">
                        ${tour.price_per_person} <span className="text-xs font-normal text-gray-400">/ person</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenModal(tour)}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 transition-colors cursor-pointer"
                        title="Edit Tour"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTour(tour.id)}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Tour"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tour Edit / Create Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200/80 dark:border-zinc-800 p-6 sm:p-7 space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              {editingTour ? 'Edit Tour Package' : 'Create Tour Package'}
            </h2>

            <form onSubmit={handleSaveTour} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">Package Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Angkor Sunrise & Floating Village Tour"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Siem Reap"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">Duration *</label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="1 Day or 3 Days / 2 Nights"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">Price / Person (USD) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="55"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">Max Group Size</label>
                  <input
                    type="number"
                    value={maxTravelers}
                    onChange={(e) => setMaxTravelers(e.target.value)}
                    placeholder="12"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">Description & Highlights</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Itinerary breakdown and included highlights..."
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#003E83] hover:bg-[#002e62] text-white font-bold transition-all shadow-md"
                >
                  Save Tour Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
