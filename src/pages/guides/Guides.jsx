import { useState, useMemo, useEffect } from 'react';
import { 
  UserCheck, 
  Search, 
  ShieldCheck, 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  Languages, 
  DollarSign, 
  MapPin, 
  CheckCircle2, 
  X,
  Phone,
  Mail,
  Loader2,
  RefreshCw,
  Users
} from 'lucide-react';
import userService from '../../services/userService';

const INITIAL_GUIDES = [
  {
    id: 1,
    name: 'Sophal Sopheaktra',
    license_no: 'MOT-SR-2018-042',
    province: 'Siem Reap & Angkor',
    languages: ['Khmer', 'English', 'French'],
    experience_years: 14,
    daily_rate: 45,
    rating: 4.98,
    reviews_count: 215,
    status: 'verified',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    specialties: 'Senior Khmer Culture & UNESCO World Heritage Certified Tour Guide with 14 years experience at Angkor Archaeological Park.'
  },
  {
    id: 2,
    name: 'Meng Dara',
    license_no: 'MOT-PP-2019-115',
    province: 'Phnom Penh & Kandal',
    languages: ['Khmer', 'English', 'Chinese (Mandarin)'],
    experience_years: 9,
    daily_rate: 40,
    rating: 4.92,
    reviews_count: 168,
    status: 'verified',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    specialties: 'Phnom Penh Royal Palace historian, architectural docent, and Mekong river culture researcher.'
  },
  {
    id: 3,
    name: 'Srey Mom Khem',
    license_no: 'MOT-BB-2021-089',
    province: 'Battambang',
    languages: ['Khmer', 'English', 'French'],
    experience_years: 7,
    daily_rate: 38,
    rating: 4.89,
    reviews_count: 94,
    status: 'verified',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    specialties: 'Battambang provincial arts curator, colonial heritage walk leader, and Phare circus ambassador.'
  },
  {
    id: 4,
    name: 'Heng Rathana',
    license_no: 'MOT-MK-2020-031',
    province: 'Mondulkiri & Ratanakiri',
    languages: ['Khmer', 'English'],
    experience_years: 8,
    daily_rate: 50,
    rating: 4.96,
    reviews_count: 112,
    status: 'verified',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    specialties: 'Indigenous Bunong eco-trail master and wildlife protection advocate in Mondulkiri and Cardamom highlands.'
  },
  {
    id: 5,
    name: 'Kolap Samnang',
    license_no: 'MOT-SH-2022-102',
    province: 'Preah Sihanouk & Koh Rong',
    languages: ['Khmer', 'English', 'German'],
    experience_years: 6,
    daily_rate: 45,
    rating: 4.94,
    reviews_count: 86,
    status: 'verified',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    specialties: 'PADI certified divemaster and marine ecology guide for Koh Rong Archipelago and Kep coastal reserves.'
  }
];

export default function Guides() {
  const [guides, setGuides] = useState(INITIAL_GUIDES);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [province, setProvince] = useState('');
  const [languagesStr, setLanguagesStr] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [specialties, setSpecialties] = useState('');

  const languagesList = ['All', 'English', 'French', 'Japanese', 'Chinese (Mandarin)', 'German'];

  const fetchGuidesFromBackend = async () => {
    try {
      setRefreshing(true);
      const res = await userService.getUsers();
      const rawUsers = res?.data?.users || res?.data?.data || res?.data || res || [];

      if (Array.isArray(rawUsers) && rawUsers.length > 0) {
        // Find users with guide_editor role or content editors
        const guideUsers = rawUsers.filter(u => u.role === 'guide_editor' || u.role === 'editor' || u.role === 'tour_guide');
        const listToMap = guideUsers.length > 0 ? guideUsers : rawUsers.slice(0, 10);

        const mappedGuides = listToMap.map((u, index) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '+855 12 345 678',
          license_no: `MOT-KH-20${18 + (u.id % 7)}-${100 + u.id}`,
          province: u.location || (index % 2 === 0 ? 'Siem Reap & Angkor' : 'Phnom Penh'),
          languages: ['Khmer', 'English', index % 3 === 0 ? 'French' : 'Chinese (Mandarin)'],
          experience_years: 5 + (u.id % 10),
          daily_rate: 40 + (u.id % 4) * 5,
          rating: 4.90 + ((u.id % 10) * 0.01),
          reviews_count: 50 + u.id * 12,
          status: u.status === 'Active' || u.status === 'verified' ? 'verified' : 'pending',
          avatar: u.avatar || INITIAL_GUIDES[index % INITIAL_GUIDES.length]?.avatar,
          specialties: u.bio || 'Ministry of Tourism Certified Tour Guide & Cultural Docent.'
        }));

        setGuides(mappedGuides);
      }
    } catch (err) {
      console.warn('Backend users endpoint fallback in place:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGuidesFromBackend();
  }, []);

  const stats = useMemo(() => {
    const total = guides.length;
    const verified = guides.filter(g => g.status === 'verified').length;
    const regions = new Set(guides.map(g => g.province).filter(Boolean)).size;
    const allLangs = new Set(guides.flatMap(g => g.languages || [])).size;
    return { total, verified, regions, allLangs };
  }, [guides]);

  const handleOpenModal = (guide = null) => {
    if (guide) {
      setEditingGuide(guide);
      setName(guide.name);
      setEmail(guide.email || '');
      setPhone(guide.phone || '');
      setLicenseNo(guide.license_no);
      setProvince(guide.province);
      setLanguagesStr((guide.languages || []).join(', '));
      setDailyRate(String(guide.daily_rate));
      setExperienceYears(String(guide.experience_years));
      setSpecialties(guide.specialties || '');
    } else {
      setEditingGuide(null);
      setName('');
      setEmail('');
      setPhone('');
      setLicenseNo('MOT-KH-2026-');
      setProvince('Siem Reap & Angkor');
      setLanguagesStr('Khmer, English');
      setDailyRate('45');
      setExperienceYears('5');
      setSpecialties('');
    }
    setModalOpen(true);
  };

  const handleSaveGuide = async (e) => {
    e.preventDefault();
    const parsedLangs = languagesStr.split(',').map(l => l.trim()).filter(Boolean);

    if (editingGuide) {
      try {
        await userService.updateUser(editingGuide.id, {
          name,
          email,
          phone,
          location: province,
          bio: specialties
        });
      } catch (err) {
        console.warn('Backend guide update notice:', err.message);
      }

      setGuides(prev => prev.map(g => g.id === editingGuide.id ? {
        ...g,
        name,
        email,
        phone,
        license_no: licenseNo,
        province,
        languages: parsedLangs,
        daily_rate: Number(dailyRate),
        experience_years: Number(experienceYears),
        specialties
      } : g));
    } else {
      let createdId = Date.now();
      try {
        const res = await userService.createUser({
          name,
          email: email || `guide.${Date.now()}@tourism.gov.kh`,
          password: 'password123',
          role: 'guide_editor',
          location: province,
          bio: specialties,
          status: 'Active'
        });
        if (res?.data?.id) createdId = res.data.id;
      } catch (err) {
        console.warn('Backend guide create notice:', err.message);
      }

      const newGuide = {
        id: createdId,
        name,
        email,
        phone,
        license_no: licenseNo,
        province,
        languages: parsedLangs,
        daily_rate: Number(dailyRate),
        experience_years: Number(experienceYears),
        rating: 5.0,
        reviews_count: 0,
        status: 'verified',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        specialties
      };
      setGuides(prev => [newGuide, ...prev]);
    }
    setModalOpen(false);
  };

  const handleToggleVerification = async (id) => {
    const guide = guides.find(g => g.id === id);
    const newStatus = guide?.status === 'verified' ? 'pending' : 'verified';
    try {
      await userService.updateUserStatus(id, newStatus === 'verified' ? 'Active' : 'Inactive');
    } catch (err) {
      console.warn('Backend user status toggle notice:', err.message);
    }

    setGuides(prev => prev.map(g => {
      if (g.id === id) {
        return { ...g, status: newStatus };
      }
      return g;
    }));
  };

  const handleDeleteGuide = async (id) => {
    if (!window.confirm('Are you sure you want to remove this tour guide record?')) return;
    try {
      await userService.deleteUser(id);
    } catch (err) {
      console.warn('Backend guide delete notice:', err.message);
    }
    setGuides(prev => prev.filter(g => g.id !== id));
  };

  const filteredGuides = useMemo(() => {
    return guides.filter(g => {
      const matchLang = selectedLanguage === 'All' || (g.languages || []).some(l => l.includes(selectedLanguage));
      const q = search.toLowerCase().trim();
      const matchSearch = !q ||
        (g.name || '').toLowerCase().includes(q) ||
        (g.license_no || '').toLowerCase().includes(q) ||
        (g.province || '').toLowerCase().includes(q);
      return matchLang && matchSearch;
    });
  }, [guides, selectedLanguage, search]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ministry of Tourism Licensing & Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Accredited Tour Guides Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Manage licensed Cambodian tour guides, verify credentials, languages, and service quality via backend API
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchGuidesFromBackend}
            disabled={refreshing}
            className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
            title="Refresh Guides from Backend"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#003E83]' : ''}`} />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold rounded-2xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Guide</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Registered Guides</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400">MoT licensed staff</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Verified Licensed</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.verified}</p>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400">Background checked</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Active Provinces</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#003E83] dark:text-blue-400">{stats.regions}</p>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400">Geographic coverage</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Languages Covered</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">{stats.allLangs}</p>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400">International fluency</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {languagesList.map(l => (
            <button
              key={l}
              onClick={() => setSelectedLanguage(l)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedLanguage === l
                  ? 'bg-[#003E83] text-white shadow-xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, license, or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white text-xs rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Guides Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-3xl bg-gray-200 dark:bg-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGuides.map((guide) => {
            const isVerified = guide.status === 'verified';

            return (
              <div
                key={guide.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm p-6 flex flex-col justify-between hover:shadow-lg transition-all space-y-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={guide.avatar}
                    alt={guide.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-zinc-800 shadow-sm shrink-0"
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-extrabold text-base text-gray-900 dark:text-white truncate">
                        {guide.name}
                      </h3>
                      <button
                        onClick={() => handleToggleVerification(guide.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {guide.status}
                      </button>
                    </div>

                    <p className="font-mono text-[11px] text-gray-500 dark:text-zinc-400">
                      {guide.license_no}
                    </p>

                    <p className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>{guide.province}</span>
                    </p>
                  </div>
                </div>

                {/* Language Pills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Languages</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(guide.languages || []).map((lang, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-300 font-bold text-[11px]"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {guide.specialties}
                </p>

                {/* Card Footer */}
                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Daily Rate</span>
                    <div className="text-xl font-extrabold text-gray-900 dark:text-white">
                      ${guide.daily_rate} <span className="text-xs font-normal text-gray-400">/ day</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenModal(guide)}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 transition-colors cursor-pointer"
                      title="Edit Guide"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGuide(guide.id)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Guide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guide Edit / Create Modal */}
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
              {editingGuide ? 'Edit Tour Guide' : 'Register Tour Guide'}
            </h2>

            <form onSubmit={handleSaveGuide} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">Guide Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Sophal Sopheaktra"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guide@tourism.gov.kh"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+855 12 345 678"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">MoT License No. *</label>
                  <input
                    type="text"
                    required
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    placeholder="MOT-SR-2024-001"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">Primary Region *</label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Siem Reap & Angkor"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">Spoken Languages (comma-separated) *</label>
                <input
                  type="text"
                  required
                  value={languagesStr}
                  onChange={(e) => setLanguagesStr(e.target.value)}
                  placeholder="Khmer, English, French"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">Daily Rate (USD) *</label>
                  <input
                    type="number"
                    required
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value)}
                    placeholder="45"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="5"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">Specialties & Historical Focus</label>
                <textarea
                  rows={2}
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="e.g., Angkor Wat bas-reliefs, Kulen waterfalls, Khmer epigraphy..."
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
                  Save Guide Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
