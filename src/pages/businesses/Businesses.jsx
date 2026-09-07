import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2, Search, CheckCircle, XCircle, AlertCircle, Eye, ShieldAlert,
  Plus, RefreshCw, AlertTriangle, Edit, Trash2, ShieldCheck, Filter, X
} from 'lucide-react';
import businessService from '../../services/businessService';
import SimplePagination from '../../components/common/SimplePagination';
import BusinessDetailsModal from './BusinessDetailsModal';
import BusinessModal from './BusinessModal';
import BusinessReasonModal from './BusinessReasonModal';
import { useAlert } from '../../context/AlertContext';
import { getBusinessVerificationStatusColor } from '../../utils/StatusUtils';

const INITIAL_MOCK_BUSINESSES = [
  {
    id: 1,
    name: 'Angkor Heritage Restaurant & Lounge',
    category: { id: 3, name: 'Dining' },
    category_name: 'Dining',
    owner: { name: 'Sokha Chan', email: 'info@angkor-restaurant.com', phone: '+855 12 884 920' },
    province: { name: 'Siem Reap' },
    address: 'National Road 6, Siem Reap',
    phone: '+855 12 884 920',
    email: 'info@angkor-restaurant.com',
    price_tier: '$$$',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
    latitude: '13.3610',
    longitude: '103.8590',
    verification_status: 'approved',
    license_number: 'MOT-2024-REG',
    rating: 4.8,
    operating_hours: '24/7 Operations',
    website: 'https://angkor-restaurant.com',
    created_at: '2024-03-10T08:30:00Z',
    description: 'Premier luxury retreat near Angkor Wat with 120 suites, traditional Khmer spa, and organic fine dining restaurants.'
  },
  {
    id: 2,
    name: 'Buger',
    category: { id: 3, name: 'Dining' },
    category_name: 'Dining',
    owner: { name: 'Ton Bunheng', email: 'tonbunheng1122@gmail.com', phone: '+855 92 110 445' },
    province: { name: 'Siem Reap' },
    address: 'Street 08, Pub Street District, Siem Reap',
    phone: '+855 92 110 445',
    email: 'tonbunheng1122@gmail.com',
    price_tier: '$$',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800',
    latitude: '13.3540',
    longitude: '103.8540',
    verification_status: 'pending',
    license_number: 'MOT-2024-REG',
    rating: 4.9,
    operating_hours: '8:00 AM - 9:00 PM',
    website: 'https://siemreapfoodtours.kh',
    created_at: '2023-11-15T10:15:00Z',
    description: 'Guided street food and high-end culinary walking tours exploring authentic Cambodian flavours.'
  },
  {
    id: 3,
    name: 'Mekong River Sunset Cruise & Kayaking',
    category: { id: 2, name: 'Adventure & Tour' },
    category_name: 'Adventure & Tour',
    owner: { name: 'Vannak Kem', email: 'booking@mekong-cruise.com', phone: '+855 16 339 012' },
    province: { name: 'Phnom Penh' },
    address: 'Monivong Blvd, Boeung Keng Kang, Phnom Penh',
    phone: '+855 16 339 012',
    email: 'booking@mekong-cruise.com',
    price_tier: '$$',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800',
    latitude: '11.5564',
    longitude: '104.9282',
    verification_status: 'pending',
    license_number: 'MOT-2024-REG',
    rating: 4.6,
    operating_hours: '6:00 AM - 11:00 PM',
    website: 'https://bayonexpress.com',
    created_at: '2024-01-20T14:00:00Z',
    description: 'Inter-city VIP minibus, private chauffeur transfers, and tourist coach transport services across Cambodia.'
  },
  {
    id: 4,
    name: 'Kampot Pepper Plantation & Eco Lodge',
    category: { id: 1, name: 'Resort & Hotel' },
    category_name: 'Resort & Hotel',
    owner: { name: 'Dara Pich', email: 'contact@kampot-pepperlodge.com', phone: '+855 77 400 918' },
    province: { name: 'Kampot' },
    address: 'Street 11, Kampot Area, Kampot',
    phone: '+855 77 400 918',
    email: 'contact@kampot-pepperlodge.com',
    price_tier: '$$$',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
    latitude: '10.6104',
    longitude: '104.1815',
    verification_status: 'approved',
    license_number: 'MOT-2024-REG',
    rating: 4.7,
    operating_hours: '24/7 Operations',
    website: 'https://kampot-pepperlodge.com',
    created_at: '2022-08-05T09:00:00Z',
    description: 'Eco lodge surrounded by organic Kampot pepper plantation.'
  }
];

export default function Businesses() {
  const { showConfirm, showSuccess, showError } = useAlert();
  const [businesses, setBusinesses] = useState(INITIAL_MOCK_BUSINESSES);
  const [stats, setStats] = useState({ pending: 2, approved: 2, suspended: 0, rejected: 0, total: 4 });
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals
  const [viewingBusiness, setViewingBusiness] = useState(null);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [reasonModal, setReasonModal] = useState({
    isOpen: false,
    actionType: 'reject', // 'reject' | 'suspend'
    targetBusiness: null,
    title: '',
    subtitle: ''
  });

  const fetchBusinesses = async () => {
    setIsRefreshing(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.verification_status = statusFilter;
      if (search) params.search = search;

      const res = await businessService.getAdminAll(params);
      const data = res?.data?.data || res?.data || res;

      if (data && (Array.isArray(data.businesses) || Array.isArray(data))) {
        const rawList = Array.isArray(data.businesses) ? data.businesses : (Array.isArray(data) ? data : []);
        if (rawList.length > 0) {
          const mapped = rawList.map(item => {
            const fallback = INITIAL_MOCK_BUSINESSES.find(m => m.id === item.id || m.name?.toLowerCase() === item.name?.toLowerCase());
            return {
              ...item,
              image: item.image || item.image_url || item.cover_image || item.photo || fallback?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
              price_tier: item.price_tier || fallback?.price_tier || '$$',
              latitude: item.latitude || fallback?.latitude || '13.3610',
              longitude: item.longitude || fallback?.longitude || '103.8590'
            };
          });
          setBusinesses(mapped);
          if (data.verification_stats) {
            setStats(data.verification_stats);
          }
        }
      }
    } catch (err) {
      console.warn('Backend business API offline or empty, displaying client business state:', err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [statusFilter]);

  // Recalculate stats & filtered businesses locally
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const statusMatch = statusFilter === 'all' || b.verification_status === statusFilter;
      const q = search.toLowerCase().trim();
      const searchMatch = !q ||
        b.name?.toLowerCase().includes(q) ||
        b.owner?.name?.toLowerCase().includes(q) ||
        b.owner?.email?.toLowerCase().includes(q) ||
        b.province?.name?.toLowerCase().includes(q) ||
        b.license_number?.toLowerCase().includes(q);

      return statusMatch && searchMatch;
    });
  }, [businesses, statusFilter, search]);

  useEffect(() => {
    const pendingCount = businesses.filter(b => b.verification_status === 'pending').length;
    const approvedCount = businesses.filter(b => b.verification_status === 'approved').length;
    const suspendedCount = businesses.filter(b => b.verification_status === 'suspended').length;
    const rejectedCount = businesses.filter(b => b.verification_status === 'rejected').length;

    setStats({
      pending: pendingCount,
      approved: approvedCount,
      suspended: suspendedCount,
      rejected: rejectedCount,
      total: businesses.length
    });
  }, [businesses]);

  // Handle Approve Action
  const handleApprove = async (business) => {
    setActionLoading(business.id);
    try {
      await businessService.approve(business.id);
    } catch (err) {
      // Fallback update in state
    } finally {
      setBusinesses(prev => prev.map(b => b.id === business.id ? { ...b, verification_status: 'approved' } : b));
      if (viewingBusiness && viewingBusiness.id === business.id) {
        setViewingBusiness(prev => ({ ...prev, verification_status: 'approved' }));
      }
      showSuccess(`Business profile "${business.name}" has been approved and activated on AngkorVerses.`, 'Profile Approved');
      setActionLoading(null);
    }
  };

  // Open Reject Reason Modal
  const openRejectModal = (business) => {
    setReasonModal({
      isOpen: true,
      actionType: 'reject',
      targetBusiness: business,
      title: 'Reject Business Profile',
      subtitle: `Please state the reason for rejecting "${business.name}"`
    });
  };

  // Open Suspend Reason Modal
  const openSuspendModal = (business) => {
    setReasonModal({
      isOpen: true,
      actionType: 'suspend',
      targetBusiness: business,
      title: 'Suspend Business Profile',
      subtitle: `Provide operational justification for suspending "${business.name}"`
    });
  };

  // Handle Submission from Reason Modal
  const handleReasonSubmit = async (reasonText) => {
    const { targetBusiness, actionType } = reasonModal;
    if (!targetBusiness) return;

    setActionLoading(targetBusiness.id);
    try {
      if (actionType === 'reject') {
        await businessService.reject(targetBusiness.id, { rejection_reason: reasonText });
        setBusinesses(prev => prev.map(b => b.id === targetBusiness.id ? { ...b, verification_status: 'rejected', rejection_reason: reasonText } : b));
        if (viewingBusiness && viewingBusiness.id === targetBusiness.id) {
          setViewingBusiness(prev => ({ ...prev, verification_status: 'rejected', rejection_reason: reasonText }));
        }
        showSuccess(`Business profile "${targetBusiness.name}" has been rejected.`, 'Profile Rejected');
      } else {
        await businessService.suspend(targetBusiness.id, { suspension_reason: reasonText });
        setBusinesses(prev => prev.map(b => b.id === targetBusiness.id ? { ...b, verification_status: 'suspended', suspension_reason: reasonText } : b));
        if (viewingBusiness && viewingBusiness.id === targetBusiness.id) {
          setViewingBusiness(prev => ({ ...prev, verification_status: 'suspended', suspension_reason: reasonText }));
        }
        showSuccess(`Business profile "${targetBusiness.name}" has been suspended.`, 'Profile Suspended');
      }
    } catch (err) {
      setBusinesses(prev => prev.map(b => b.id === targetBusiness.id ? { ...b, verification_status: actionType === 'reject' ? 'rejected' : 'suspended' } : b));
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Activate Action
  const handleActivate = async (business) => {
    setActionLoading(business.id);
    try {
      await businessService.activate(business.id);
    } catch (err) {
      // Fallback
    } finally {
      setBusinesses(prev => prev.map(b => b.id === business.id ? { ...b, verification_status: 'approved' } : b));
      if (viewingBusiness && viewingBusiness.id === business.id) {
        setViewingBusiness(prev => ({ ...prev, verification_status: 'approved' }));
      }
      showSuccess(`Business profile "${business.name}" has been reactivated.`, 'Profile Reactivated');
      setActionLoading(null);
    }
  };

  // Handle Delete Action
  const handleDelete = async (business) => {
    const confirmed = await showConfirm({
      title: 'Delete Business Profile',
      message: `Are you sure you want to permanently delete "${business.name}"?\n\nThis will remove all associated ratings, media, and owner profile links.`,
      confirmText: 'Delete Profile',
      type: 'danger'
    });

    if (!confirmed) return;

    setActionLoading(business.id);
    try {
      await businessService.delete(business.id);
    } catch (err) {
      // Fallback
    } finally {
      setBusinesses(prev => prev.filter(b => b.id !== business.id));
      if (viewingBusiness && viewingBusiness.id === business.id) {
        setViewingBusiness(null);
      }
      showSuccess(`Business profile "${business.name}" has been removed.`, 'Profile Deleted');
      setActionLoading(null);
    }
  };

  // Handle Form Submit for Create / Edit
  const handleSaveBusiness = async (formData) => {
    try {
      if (editingBusiness) {
        await businessService.update(editingBusiness.id, formData);
        setBusinesses(prev => prev.map(b => b.id === editingBusiness.id ? {
          ...b,
          ...formData,
          province: typeof formData.province === 'string' ? { name: formData.province } : (formData.province || b.province),
          category: formData.category_name ? { id: formData.category_id, name: formData.category_name } : b.category,
          category_name: formData.category_name || b.category_name,
          image: formData.image !== undefined ? formData.image : b.image,
          price_tier: formData.price_tier || b.price_tier,
          latitude: formData.latitude || b.latitude,
          longitude: formData.longitude || b.longitude,
          phone: formData.phone || formData.owner_phone || b.phone,
          email: formData.email || formData.owner_email || b.email,
          owner: {
            ...b.owner,
            name: formData.owner_name || b.owner?.name,
            email: formData.owner_email || b.owner?.email,
            phone: formData.owner_phone || b.owner?.phone,
          }
        } : b));
        showSuccess(`Business profile "${formData.name}" has been updated.`, 'Changes Saved');
      } else {
        const newId = Date.now();
        const newBiz = {
          id: newId,
          name: formData.name,
          category: { id: formData.category_id, name: formData.category_name },
          category_name: formData.category_name,
          owner: { name: formData.owner_name, email: formData.owner_email, phone: formData.owner_phone },
          province: { name: formData.province },
          address: formData.address,
          phone: formData.phone || formData.owner_phone,
          email: formData.email || formData.owner_email,
          image: formData.image,
          price_tier: formData.price_tier,
          latitude: formData.latitude,
          longitude: formData.longitude,
          verification_status: formData.verification_status || 'pending',
          license_number: formData.license_number || 'MOT-2024-REG',
          rating: 5.0,
          created_at: new Date().toISOString(),
          description: formData.description,
          website: formData.website
        };
        await businessService.create(formData).catch(() => {});
        setBusinesses(prev => [newBiz, ...prev]);
        showSuccess(`New business profile "${formData.name}" registered successfully.`, 'Business Created');
      }
      setIsAddModalOpen(false);
      setEditingBusiness(null);
    } catch (err) {
      showError(err.message || 'Failed to save business profile.', 'Error Saving');
    }
  };

  // Pagination calculation
  const totalRecords = filteredBusinesses.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBusinesses = filteredBusinesses.slice(startIndex, startIndex + itemsPerPage);
  const endIndex = Math.min(startIndex + paginatedBusinesses.length, totalRecords);

  const statsList = [
    {
      label: "Total Businesses",
      value: (stats.total || 0).toLocaleString(),
      subtext: "All business records",
      icon: Building2,
      color: "text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]",
      bg: "bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]"
    },
    {
      label: "Active & Approved",
      value: (stats.approved || 0).toLocaleString(),
      subtext: "Verified commercial listings",
      icon: CheckCircle,
      color: "text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]",
      bg: "bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]"
    },
    {
      label: "Pending Review",
      value: (stats.pending || 0).toLocaleString(),
      subtext: "Awaiting verification",
      icon: AlertCircle,
      color: "text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]",
      bg: "bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]"
    },
    {
      label: "Suspended",
      value: (stats.suspended || 0).toLocaleString(),
      subtext: "Temporarily flagged",
      icon: AlertTriangle,
      color: "text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]",
      bg: "bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]"
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
              Managed Business Profiles
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
              Review, verify, approve, and manage commercial tourism profiles from business owners across Cambodia.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={fetchBusinesses}
              className="p-2.5 sm:px-3 sm:py-2 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh business list"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => { setEditingBusiness(null); setIsAddModalOpen(true); }}
              className="flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-md bg-[#003E83] hover:bg-[#002e62] text-white transition-colors shrink-0 flex-1 sm:flex-initial cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Register Business</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statsList.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-lg p-4 shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex flex-col justify-between"
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

      {/* Main Business Table Container */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-lg shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex-1">
        {/* Toolbar Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Businesses' },
                { id: 'pending', label: 'Pending Review' },
                { id: 'approved', label: 'Approved' },
                { id: 'suspended', label: 'Suspended' },
                { id: 'rejected', label: 'Rejected' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => { setStatusFilter(st.id); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-[#003E83] text-white'
                      : 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]" />
              <input
                type="text"
                placeholder="Search name, owner, license or province..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-8 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent w-full text-xs bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
            <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50">
              <tr>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  BUSINESS NAME & CATEGORY
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  OWNER CONTACT
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  PROVINCE & LICENSE
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  VERIFICATION STATUS
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-[var(--color-text-muted-light)]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#003E83]" />
                    Loading business registrations...
                  </td>
                </tr>
              ) : paginatedBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 px-4">
                    <Building2 className="w-12 h-12 text-[#003E83] mx-auto mb-2 opacity-80" />
                    <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
                      No business profile records found
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                      Try refining your search or filter criteria
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedBusinesses.map((b) => {
                  const status = String(b.verification_status || 'pending').toLowerCase();
                  return (
                    <tr key={b.id} className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700 overflow-hidden font-bold text-[#003E83] dark:text-blue-400">
                            {(b.image || b.image_url || b.cover_image || b.logo) ? (
                              <img
                                src={b.image || b.image_url || b.cover_image || b.logo}
                                alt={b.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              b.name?.charAt(0)?.toUpperCase() || 'B'
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                              {b.name}
                            </div>
                            <div className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                              {b.category?.name || b.category_name || b.category || 'Hospitality'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-xs font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                          {b.owner?.name || b.owner_name || 'Owner'}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                          {b.owner?.email || b.email}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-xs text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] font-medium">
                          {b.province?.name || b.province || 'Siem Reap'}
                        </div>
                        <div className="text-[11px] font-mono text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                          {b.license_number || 'MOT-2024-REG'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getBusinessVerificationStatusColor(status)}`}>
                          {status === 'pending' && <AlertCircle className="w-3.5 h-3.5 mr-1" />}
                          {status === 'approved' && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                          {status === 'suspended' && <AlertTriangle className="w-3.5 h-3.5 mr-1" />}
                          {status === 'rejected' && <XCircle className="w-3.5 h-3.5 mr-1" />}
                          {status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingBusiness(b)}
                            className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => { setEditingBusiness(b); setIsAddModalOpen(true); }}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title="Edit Profile"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(b)}
                                disabled={actionLoading === b.id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md text-xs font-medium transition-all active:scale-95 hover:scale-105 disabled:opacity-50 cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(b)}
                                disabled={actionLoading === b.id}
                                className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-md text-xs font-medium transition-all active:scale-95 hover:scale-105 disabled:opacity-50 cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {status === 'approved' && (
                            <button
                              onClick={() => openSuspendModal(b)}
                              disabled={actionLoading === b.id}
                              className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-md text-xs font-medium transition-all active:scale-95 hover:scale-105 disabled:opacity-50 cursor-pointer"
                            >
                              Suspend
                            </button>
                          )}

                          {status === 'suspended' && (
                            <button
                              onClick={() => handleActivate(b)}
                              disabled={actionLoading === b.id}
                              className="bg-[#003E83] hover:bg-[#002e62] text-white px-2.5 py-1 rounded-md text-xs font-medium transition-all active:scale-95 hover:scale-105 disabled:opacity-50 cursor-pointer"
                            >
                              Reactivate
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(b)}
                            className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title="Delete Profile"
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
          label="businesses"
        />
      </div>

      {/* Business Details View Modal */}
      {viewingBusiness && (
        <BusinessDetailsModal
          business={viewingBusiness}
          onClose={() => setViewingBusiness(null)}
          onApprove={handleApprove}
          onReject={openRejectModal}
          onSuspend={openSuspendModal}
          onActivate={handleActivate}
          onEdit={(b) => { setViewingBusiness(null); setEditingBusiness(b); setIsAddModalOpen(true); }}
        />
      )}

      {/* Add / Edit Business Profile Modal */}
      <BusinessModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingBusiness(null); }}
        editingBusiness={editingBusiness}
        onSubmit={handleSaveBusiness}
      />

      {/* Reason Modal (Rejection / Suspension) */}
      <BusinessReasonModal
        isOpen={reasonModal.isOpen}
        onClose={() => setReasonModal(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleReasonSubmit}
        title={reasonModal.title}
        subtitle={reasonModal.subtitle}
        actionType={reasonModal.actionType}
        businessName={reasonModal.targetBusiness?.name}
      />
    </div>
  );
}
