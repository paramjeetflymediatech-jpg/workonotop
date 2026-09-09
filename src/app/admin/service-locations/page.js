'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAdminTheme } from '../layout';
import { toast } from 'react-hot-toast';
import { 
  FiSearch, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiExternalLink, 
  FiMapPin, 
  FiCheckCircle, 
  FiXCircle, 
  FiFilter, 
  FiRefreshCw, 
  FiLayers, 
  FiGlobe,
  FiCode,
  FiInfo,
  FiCheck,
  FiX,
  FiCopy
} from 'react-icons/fi';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

export default function AdminServiceLocationsPage() {
  const router = useRouter();
  const { isDarkMode } = useAdminTheme();

  // Data States
  const [locations, setLocations] = useState([]);
  const [services, setServices] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    servicesCount: 0,
    locationsCount: 0
  });

  // Filter & Search & Pagination States
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('location_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('general'); // 'general' | 'seo' | 'content'
  const [saving, setSaving] = useState(false);

  // Delete Modal State
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    service_id: '',
    location_name: '',
    location_slug: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    keywords: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    og_image: '',
    custom_heading: '',
    custom_intro: '',
    description: '',
    is_active: 1
  });

  // Initial Load & Auth Check
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/me');
      if (!res.ok) {
        router.push('/admin/login');
        return;
      }
      loadServices();
      loadCities();
    } catch {
      router.push('/admin/login');
    }
  };

  const loadServices = async () => {
    try {
      const res = await fetch('/api/services?admin=true');
      const data = await res.json();
      if (data.success) {
        setServices(data.data || []);
      }
    } catch (e) {
      console.error('Error loading services:', e);
    }
  };

  const loadCities = async () => {
    try {
      const res = await fetch('/api/cities?all=true');
      const data = await res.json();
      if (data.success) {
        setCities(data.data || []);
      }
    } catch (e) {
      console.error('Error loading cities:', e);
    }
  };

  // Fetch Locations with debounce/query
  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        search,
        service_id: selectedService,
        status: selectedStatus,
        sortBy,
        sortOrder
      });

      const res = await fetch(`/api/admin/service-locations?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setLocations(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        toast.error(data.message || 'Failed to load service locations');
      }
    } catch (err) {
      console.error('Error loading service locations:', err);
      toast.error('Network error loading service locations');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, search, selectedService, selectedStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Quick Status Toggle
  const handleToggleStatus = async (item) => {
    setTogglingId(item.id);
    const newStatus = item.is_active ? 0 : 1;
    try {
      const res = await fetch(`/api/admin/service-locations/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(newStatus ? 'Location activated' : 'Location deactivated');
        // Update local state smoothly
        setLocations(prev =>
          prev.map(loc => (loc.id === item.id ? { ...loc, is_active: newStatus } : loc))
        );
        // Refresh stats
        setStats(prev => ({
          ...prev,
          active: newStatus ? prev.active + 1 : Math.max(0, prev.active - 1),
          inactive: newStatus ? Math.max(0, prev.inactive - 1) : prev.inactive + 1
        }));
      } else {
        toast.error(data.message || 'Failed to toggle status');
      }
    } catch (e) {
      toast.error('Error updating status');
    } finally {
      setTogglingId(null);
    }
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setActiveModalTab('general');
    const defaultService = services.length > 0 ? services[0] : null;
    const defaultServiceId = defaultService ? defaultService.id : '';

    setFormData({
      service_id: defaultServiceId,
      location_name: '',
      location_slug: '',
      slug: '',
      meta_title: '',
      meta_description: '',
      keywords: '',
      canonical_url: '',
      og_title: '',
      og_description: '',
      og_image: '',
      custom_heading: '',
      custom_intro: '',
      description: '',
      is_active: 1
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setActiveModalTab('general');
    setFormData({
      service_id: item.service_id,
      location_name: item.location_name || '',
      location_slug: item.location_slug || '',
      slug: item.slug || '',
      meta_title: item.meta_title || '',
      meta_description: item.meta_description || '',
      keywords: item.keywords || '',
      canonical_url: item.canonical_url || '',
      og_title: item.og_title || '',
      og_description: item.og_description || '',
      og_image: item.og_image || '',
      custom_heading: item.custom_heading || '',
      custom_intro: item.custom_intro || '',
      description: item.description || '',
      is_active: item.is_active ? 1 : 0
    });
    setIsModalOpen(true);
  };

  // Auto-generate helper based on selected service and location name
  const handleLocationNameChange = (name) => {
    const cleanSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    const selectedSrv = services.find(s => String(s.id) === String(formData.service_id));
    const srvName = selectedSrv ? selectedSrv.name : 'Service';
    const srvSlug = selectedSrv ? selectedSrv.slug : 'service';

    const pageSlug = `${srvSlug}-${cleanSlug}`;

    setFormData(prev => ({
      ...prev,
      location_name: name,
      location_slug: cleanSlug,
      slug: prev.slug && editingItem ? prev.slug : pageSlug,
      canonical_url: prev.canonical_url || `https://workontap.com/services/${pageSlug}`,
      meta_title: prev.meta_title || `Best ${srvName} in ${name}, BC | WorkOnTap`,
      meta_description: prev.meta_description || `Looking for trusted ${srvName.toLowerCase()} in ${name}, BC? Book top-rated local pros on WorkOnTap. Guaranteed quality service & fast response!`,
      custom_heading: prev.custom_heading || `#1 Rated ${srvName} Pros in ${name}, BC`,
      custom_intro: prev.custom_intro || `Need reliable ${srvName.toLowerCase()} in ${name}? WorkOnTap connects you with verified local background-checked specialists ready to handle your job.`
    }));
  };

  // Auto-generate / Regenerate SEO tags
  const handleAutoGenerateSEO = () => {
    const selectedSrv = services.find(s => String(s.id) === String(formData.service_id));
    const srvName = selectedSrv ? selectedSrv.name : 'Service';
    const srvSlug = selectedSrv ? selectedSrv.slug : 'service';
    const locName = formData.location_name || 'Location';
    const cleanLoc = formData.location_slug || locName.toLowerCase().replace(/\s+/g, '-');
    const pageSlug = `${srvSlug}-${cleanLoc}`;

    setFormData(prev => ({
      ...prev,
      slug: pageSlug,
      canonical_url: `https://workontap.com/services/${pageSlug}`,
      meta_title: `Best ${srvName} in ${locName}, BC | WorkOnTap`,
      meta_description: `Looking for trusted ${srvName.toLowerCase()} in ${locName}, BC? Book top-rated local pros on WorkOnTap. Guaranteed quality service & fast response!`,
      keywords: `${srvName} ${locName}, ${srvName} services ${locName} BC, book ${srvName.toLowerCase()} ${locName}, local pros ${locName}, home services ${locName}`,
      og_title: `Best ${srvName} in ${locName}, BC | WorkOnTap`,
      og_description: `Book top-rated, background-checked ${srvName.toLowerCase()} professionals in ${locName}, BC with WorkOnTap.`,
      custom_heading: `#1 Rated ${srvName} Pros in ${locName}, BC`,
      custom_intro: `Need reliable ${srvName.toLowerCase()} in ${locName}? WorkOnTap connects you with verified local background-checked specialists ready to handle your job.`
    }));
    toast.success('SEO and Content fields populated!');
  };

  // Submit Add / Edit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.service_id || !formData.location_name) {
      toast.error('Service and Location Name are required');
      return;
    }

    setSaving(true);
    try {
      const url = editingItem
        ? `/api/admin/service-locations/${editingItem.id}`
        : '/api/admin/service-locations';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast.success(editingItem ? 'Service Location updated successfully!' : 'Service Location created successfully!');
        setIsModalOpen(false);
        fetchLocations();
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Item
  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/service-locations/${deleteItem.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Service location "${deleteItem.location_name}" deleted`);
        setDeleteItem(null);
        fetchLocations();
      } else {
        toast.error(data.message || 'Failed to delete location');
      }
    } catch (err) {
      toast.error('Error deleting service location');
    } finally {
      setDeleting(false);
    }
  };

  // Copy Link Helper
  const handleCopyLink = (slug) => {
    const url = `${window.location.origin}/services/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Public URL copied to clipboard!');
  };

  // Pagination Handler
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
              <FiMapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Service Locations (SEO)</h1>
              <p className={`text-xs sm:text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Manage programmatic SEO landing pages, localized metadata, and custom city content.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => fetchLocations()}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-sm font-semibold ${
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300' 
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm'
            }`}
            title="Refresh list"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 transform active:scale-95"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Service Location</span>
          </button>
        </div>
      </div>

      {/* ── Summary Stats Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Locations</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold">
              <FiGlobe className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black">{stats.total}</span>
            <span className="text-xs text-slate-400">pages</span>
          </div>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active (Published)</span>
            <span className="p-2 rounded-lg bg-teal-500/10 text-teal-500 font-bold">
              <FiCheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-500">{stats.active}</span>
            <span className="text-xs text-slate-400">
              ({stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Inactive (Draft)</span>
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-500 font-bold">
              <FiXCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-500">{stats.inactive}</span>
            <span className="text-xs text-slate-400">hidden</span>
          </div>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Services Covered</span>
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold">
              <FiLayers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-500">{stats.servicesCount}</span>
            <span className="text-xs text-slate-400">of {services.length} services</span>
          </div>
        </div>
      </div>

      {/* ── Filters & Controls Bar ────────────────────────────── */}
      <div className={`p-4 rounded-2xl border mb-6 transition-all ${isDarkMode ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-sm'}`}>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by location (e.g. Surrey, Burnaby), service name, or URL slug..."
              value={search}
              onChange={handleSearchChange}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setCurrentPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Service Filter */}
            <select
              value={selectedService}
              onChange={(e) => { setSelectedService(e.target.value); setCurrentPage(1); }}
              className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">All Services ({services.length})</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
                setCurrentPage(1);
              }}
              className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="location_name-asc">Location (A to Z)</option>
              <option value="location_name-desc">Location (Z to A)</option>
              <option value="service_name-asc">Service Name</option>
              <option value="created_at-desc">Newest Added</option>
              <option value="status-desc">Active First</option>
            </select>

            {/* Items Per Page */}
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>
          </div>
        </div>

        {/* Filter Indicator */}
        {(search || selectedService !== 'all' || selectedStatus !== 'all') && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Filtered: Showing <strong className="text-emerald-500">{totalCount}</strong> matching service locations
            </span>
            <button
              onClick={() => {
                setSearch('');
                setSelectedService('all');
                setSelectedStatus('all');
                setCurrentPage(1);
              }}
              className="text-emerald-500 hover:text-emerald-600 font-bold underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ── Locations Data Table ──────────────────────────────── */}
      <div className={`rounded-2xl border overflow-hidden shadow-sm transition-all ${isDarkMode ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200/80'}`}>
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm font-medium text-slate-400">Loading service locations...</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <FiMapPin className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold mb-1">No service locations found</h3>
            <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
              {search || selectedService !== 'all' || selectedStatus !== 'all'
                ? 'No service locations match your search or filter criteria.'
                : 'No service location pages have been created yet. Click "+ Add Service Location" to create your first one.'}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition inline-flex items-center gap-1.5"
            >
              <FiPlus className="w-4 h-4" />
              <span>Create Service Location</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`text-xs font-bold uppercase tracking-wider border-b ${isDarkMode ? 'bg-slate-900/60 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                <tr>
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">URL Slug</th>
                  <th className="px-5 py-4">SEO Title & Content</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {locations.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`transition-colors duration-150 ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50/80'}`}
                  >
                    {/* Service Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.service_image_url ? (
                          <img 
                            src={item.service_image_url} 
                            alt={item.service_name} 
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700" 
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                            {item.service_name ? item.service_name.charAt(0) : 'S'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white leading-tight">
                            {item.service_name || `Service ID #${item.service_id}`}
                          </div>
                          {item.base_price && (
                            <span className="text-[11px] text-slate-400 font-mono">
                              From ${item.base_price}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Location Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                        <FiMapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{item.location_name}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        slug: {item.location_slug}
                      </div>
                    </td>

                    {/* URL Route */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                          /services/{item.slug || `${item.service_slug}-${item.location_slug}`}
                        </span>
                        <button
                          onClick={() => handleCopyLink(item.slug || `${item.service_slug}-${item.location_slug}`)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                          title="Copy Link"
                        >
                          <FiCopy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* SEO Preview & Rich Content Status */}
                    <td className="px-5 py-4 max-w-xs">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.meta_title}>
                        {item.meta_title || <span className="text-slate-400 italic font-normal">No custom title</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {item.description ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            <FiCode className="w-3 h-3" /> Custom Description
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Standard Content
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        disabled={togglingId === item.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                          item.is_active
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title="Click to toggle status"
                      >
                        {togglingId === item.id ? (
                          <span className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                        ) : item.is_active ? (
                          <FiCheck className="w-3.5 h-3.5" />
                        ) : (
                          <FiX className="w-3.5 h-3.5" />
                        )}
                        <span>{item.is_active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/services/${item.slug || `${item.service_slug}-${item.location_slug}`}`}
                          target="_blank"
                          className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            isDarkMode 
                              ? 'bg-slate-700/80 hover:bg-slate-700 text-slate-200' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title="View Live Page"
                        >
                          <FiExternalLink className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/70 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold transition"
                          title="Edit Location & SEO"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteItem(item)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/70 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold transition"
                          title="Delete Service Location"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination Footer ───────────────────────────────── */}
        {!loading && locations.length > 0 && (
          <div className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-50/50 border-slate-200'}`}>
            <div className="text-xs font-medium text-slate-500">
              Showing <strong className="text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
              <strong className="text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, totalCount)}</strong> of{' '}
              <strong className="text-slate-900 dark:text-white">{totalCount}</strong> locations
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    currentPage === 1 
                      ? 'opacity-40 cursor-not-allowed' 
                      : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border text-slate-700 hover:bg-slate-100'
                  }`}
                  title="First Page"
                >
                  «
                </button>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    currentPage === 1 
                      ? 'opacity-40 cursor-not-allowed' 
                      : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Prev
                </button>

                {(() => {
                  const pages = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    if (currentPage <= 4) {
                      pages.push(1, 2, 3, 4, 5, '...', totalPages);
                    } else if (currentPage >= totalPages - 3) {
                      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                    }
                  }
                  return pages.map((p, idx) => (
                    p === '...' ? (
                      <span key={`el-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={`pg-${p}`}
                        onClick={() => goToPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          currentPage === p
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                            : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  ));
                })()}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    currentPage === totalPages 
                      ? 'opacity-40 cursor-not-allowed' 
                      : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Next
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    currentPage === totalPages 
                      ? 'opacity-40 cursor-not-allowed' 
                      : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Last Page"
                >
                  »
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-3xl rounded-2xl border p-6 max-h-[92vh] overflow-y-auto shadow-2xl transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">
                    {editingItem ? `Edit: ${editingItem.location_name} (${editingItem.service_name})` : 'Add New Service Location'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Configure localized landing page, metadata, and description.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 mt-4 border-b border-slate-200 dark:border-slate-700 pb-2">
              <button
                type="button"
                onClick={() => setActiveModalTab('general')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeModalTab === 'general'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FiInfo className="w-4 h-4" />
                <span>1. General Details</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('seo')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeModalTab === 'seo'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FiGlobe className="w-4 h-4" />
                <span>2. SEO & Social Meta</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('content')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeModalTab === 'content'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FiCode className="w-4 h-4" />
                <span>3. Page Content & Description</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              
              {/* TAB 1: General Details */}
              {activeModalTab === 'general' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Service Selection */}
                    <div>
                      <label className="block text-xs font-bold mb-1.5">Service *</label>
                      <select
                        value={formData.service_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, service_id: e.target.value }))}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                        required
                      >
                        {services.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Location Name */}
                    <div>
                      <label className="block text-xs font-bold mb-1.5">Location / City Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Surrey, Burnaby, Richmond"
                        value={formData.location_name}
                        onChange={(e) => handleLocationNameChange(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Quick City Suggestions */}
                  {cities.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">Quick Suggestions:</span>
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {cities.slice(0, 15).map(city => (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => handleLocationNameChange(city.name)}
                            className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition ${
                              formData.location_name.toLowerCase() === city.name.toLowerCase()
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : isDarkMode 
                                  ? 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-700' 
                                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            📍 {city.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Location Slug */}
                    <div>
                      <label className="block text-xs font-bold mb-1.5">Location Slug (City part) *</label>
                      <input
                        type="text"
                        placeholder="e.g. surrey"
                        value={formData.location_slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, location_slug: e.target.value }))}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono border focus:ring-2 focus:ring-emerald-500 ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                        required
                      />
                    </div>

                    {/* Full Page URL Slug */}
                    <div>
                      <label className="block text-xs font-bold mb-1.5">Full URL Route Slug *</label>
                      <input
                        type="text"
                        placeholder="e.g. plumbing-surrey"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono border focus:ring-2 focus:ring-emerald-500 ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                        required
                      />
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        Route: /services/{formData.slug || 'service-city'}
                      </p>
                    </div>
                  </div>

                  {/* Active Status Checkbox */}
                  <div className="flex items-center gap-3 pt-3">
                    <input
                      type="checkbox"
                      id="is_active_check"
                      checked={Boolean(formData.is_active)}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked ? 1 : 0 }))}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="is_active_check" className="text-sm font-semibold cursor-pointer">
                      Published & Active on Website / Sitemap
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: SEO & Social Meta */}
              {activeModalTab === 'seo' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                    <div className="text-xs">
                      <strong className="text-emerald-500 block font-bold">Auto-generate SEO Metadata</strong>
                      <span className="text-slate-400">Generate optimized title, meta description, and keywords instantly.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoGenerateSEO}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition"
                    >
                      ✨ Auto Fill SEO
                    </button>
                  </div>

                  {/* Meta Title */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold">Meta Title</label>
                      <span className={`text-[11px] ${formData.meta_title.length > 60 ? 'text-amber-500' : 'text-slate-400'}`}>
                        {formData.meta_title.length} / 60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Best Plumbing Services in Surrey, BC | WorkOnTap"
                      value={formData.meta_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>

                  {/* Meta Description */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold">Meta Description</label>
                      <span className={`text-[11px] ${formData.meta_description.length > 160 ? 'text-amber-500' : 'text-slate-400'}`}>
                        {formData.meta_description.length} / 160 chars
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Looking for trusted plumbers in Surrey, BC? Book top-rated local pros on WorkOnTap."
                      value={formData.meta_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-xs font-bold mb-1">Target Keywords (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="Plumbing Surrey, plumber Surrey BC, emergency plumber Surrey"
                      value={formData.keywords}
                      onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>

                  {/* Canonical URL */}
                  <div>
                    <label className="block text-xs font-bold mb-1">Canonical URL</label>
                    <input
                      type="url"
                      placeholder="https://workontap.com/services/plumbing-surrey"
                      value={formData.canonical_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, canonical_url: e.target.value }))}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono border focus:ring-2 focus:ring-emerald-500 ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>

                  {/* OpenGraph Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold mb-1">OG Title</label>
                      <input
                        type="text"
                        placeholder="Best Plumbing in Surrey, BC"
                        value={formData.og_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, og_title: e.target.value }))}
                        className={`w-full px-3.5 py-2 rounded-xl text-sm border ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">OG Image URL</label>
                      <input
                        type="text"
                        placeholder="https://workontap.com/images/og-service.jpg"
                        value={formData.og_image}
                        onChange={(e) => setFormData(prev => ({ ...prev, og_image: e.target.value }))}
                        className={`w-full px-3.5 py-2 rounded-xl text-sm border font-mono ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Page Content & Headings */}
              {activeModalTab === 'content' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Custom Heading H1 */}
                  <div>
                    <label className="block text-xs font-bold mb-1">Custom Main Heading (H1)</label>
                    <input
                      type="text"
                      placeholder="#1 Rated Plumbing Pros in Surrey, BC"
                      value={formData.custom_heading}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_heading: e.target.value }))}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>

                  {/* Custom Intro Paragraph */}
                  <div>
                    <label className="block text-xs font-bold mb-1">Custom Intro Paragraph</label>
                    <textarea
                      rows={3}
                      placeholder="Looking for reliable plumbing services in Surrey? WorkOnTap connects you with verified local background-checked specialists..."
                      value={formData.custom_intro}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_intro: e.target.value }))}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>

                  {/* Rich Text Editor for Detailed Location Content */}
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Unique Location Body Content (Rich Text / HTML)
                    </label>
                    <div className={`mt-1 ${isDarkMode ? 'dark-mode-ckeditor' : ''}`}>
                      <RichTextEditor
                        value={formData.description || ''}
                        onChange={(data) => setFormData(prev => ({ ...prev, description: data }))}
                        placeholder="Write unique localized content for this location page (e.g. neighborhood coverage, local guarantees, pricing details)..."
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      💡 When filled, this replaces generic service body text with tailored localized content.
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-slate-700">
                <div className="flex gap-2">
                  {activeModalTab !== 'general' && (
                    <button
                      type="button"
                      onClick={() => setActiveModalTab(activeModalTab === 'content' ? 'seo' : 'general')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ← Back
                    </button>
                  )}
                  {activeModalTab !== 'content' && (
                    <button
                      type="button"
                      onClick={() => setActiveModalTab(activeModalTab === 'general' ? 'seo' : 'content')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Next Step →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                    <span>{editingItem ? 'Save Changes' : 'Create Location'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ────────────────────────── */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 mx-auto">
              <FiTrash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">Delete Service Location?</h3>
            <p className="text-xs text-center text-slate-400 mb-6">
              Are you sure you want to permanently delete the location page for{' '}
              <strong className="text-slate-900 dark:text-white">{deleteItem.service_name}</strong> in{' '}
              <strong className="text-slate-900 dark:text-white">{deleteItem.location_name}</strong>?
              This will remove the live URL and SEO landing page.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
                disabled={deleting}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />}
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CKEditor Dark Theme Styling */}
      {isDarkMode && (
        <style jsx global>{`
          .dark-mode-ckeditor .ck-editor__main .ck-content,
          .dark-mode-ckeditor .ck-toolbar {
            background-color: #0f172a !important;
            color: #e2e8f0 !important;
            border-color: #334155 !important;
          }
          .dark-mode-ckeditor .ck-button {
            color: #cbd5e1 !important;
          }
          .dark-mode-ckeditor .ck-button:hover,
          .dark-mode-ckeditor .ck-button.ck-on {
            background-color: #1e293b !important;
          }
          .dark-mode-ckeditor .ck.ck-editor__editable.ck-focused:not(.ck-editor__nested-editable) {
            border-color: #10b981 !important;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
          }
        `}</style>
      )}
    </div>
  );
}
