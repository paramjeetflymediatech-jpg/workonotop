'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAdminTheme } from '../layout';
import { toast } from 'react-hot-toast';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

export default function AdminServiceLocationsPage() {
  const router = useRouter();
  const { isDarkMode } = useAdminTheme();

  const [locations, setLocations] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    service_id: '',
    location_name: '',
    location_slug: '',
    meta_title: '',
    meta_description: '',
    keywords: '',
    canonical_url: '',
    custom_heading: '',
    custom_intro: '',
    description: '',
    is_active: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [locRes, servRes] = await Promise.all([
        fetch('/api/service-locations'),
        fetch('/api/services')
      ]);

      const locData = await locRes.json();
      const servData = await servRes.json();

      if (locData.success) {
        setLocations(locData.data || []);
      }
      if (servData.success) {
        setServices(servData.data || []);
      }
    } catch (e) {
      console.error('Error loading service locations:', e);
      toast.error('Failed to load service locations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      service_id: services.length > 0 ? services[0].id : '',
      location_name: '',
      location_slug: '',
      meta_title: '',
      meta_description: '',
      keywords: '',
      canonical_url: '',
      custom_heading: '',
      custom_intro: '',
      description: '',
      is_active: 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      service_id: item.service_id,
      location_name: item.location_name,
      location_slug: item.location_slug,
      meta_title: item.meta_title || '',
      meta_description: item.meta_description || '',
      keywords: item.keywords || '',
      canonical_url: item.canonical_url || '',
      custom_heading: item.custom_heading || '',
      custom_intro: item.custom_intro || '',
      description: item.description || '',
      is_active: item.is_active ? 1 : 0
    });
    setIsModalOpen(true);
  };

  const handleLocationNameChange = (name) => {
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const selectedService = services.find(s => String(s.id) === String(formData.service_id));
    const serviceName = selectedService ? selectedService.name : 'Service';

    setFormData(prev => ({
      ...prev,
      location_name: name,
      location_slug: slug,
      meta_title: prev.meta_title || `Best ${serviceName} Services in ${name}, BC | WorkOnTap`,
      meta_description: prev.meta_description || `Looking for trusted ${serviceName.toLowerCase()} in ${name}, BC? Book top-rated local pros on WorkOnTap.`,
      custom_heading: prev.custom_heading || `#1 Rated ${serviceName} Pros in ${name}, BC`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.service_id || !formData.location_name || !formData.location_slug) {
      toast.error('Service and Location Name are required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/service-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast.success(editingItem ? 'Service Location updated!' : 'Service Location created!');
        setIsModalOpen(false);
        fetchData();
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const filteredLocations = locations.filter(loc => {
    const q = search.toLowerCase();
    return (
      loc.location_name.toLowerCase().includes(q) ||
      loc.service_name?.toLowerCase().includes(q) ||
      loc.location_slug.toLowerCase().includes(q)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLocations = filteredLocations.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className={`p-6 min-h-screen ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Service Locations (SEO)</h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage location-specific service pages, meta tags, custom headings, and SEO landing pages.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2"
        >
          <span>+ Add Service Location</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className={`p-4 rounded-2xl border mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <input
          type="text"
          placeholder="Search location (e.g. Surrey, Burnaby, Plumbing)..."
          value={search}
          onChange={handleSearchChange}
          className={`w-full sm:w-96 px-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
        />
        <div className="text-xs font-semibold text-slate-500">
          Showing {filteredLocations.length} of {locations.length} service locations
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading service locations...</div>
        ) : filteredLocations.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No service locations found. Click &quot;+ Add Service Location&quot; to create one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`text-xs font-bold uppercase border-b ${isDarkMode ? 'bg-slate-900/50 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                <tr>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">URL Route</th>
                  <th className="px-6 py-4">Meta Title</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {currentLocations.map((item) => (
                  <tr key={item.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition`}>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {item.service_name || `Service ID: ${item.service_id}`}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      📍 {item.location_name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      /services/{item.service_slug || 'service'}/{item.location_slug}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {item.meta_title || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/services/${item.service_slug}/${item.location_slug}`}
                        target="_blank"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition inline-block"
                      >
                        View Page
                      </Link>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg text-xs font-bold transition"
                      >
                        Edit SEO
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-1 sm:gap-2 flex-wrap">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {(() => {
            const pages = [];
            if (totalPages <= 5) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
              } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
              } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
              }
            }
            return pages.map((page, idx) => (
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  ...
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => goToPage(page)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all ${currentPage === page ? 'bg-emerald-600 text-white shadow-md' : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {page}
                </button>
              )
            ));
          })()}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-2xl border p-6 max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Service Location SEO' : 'Add New Service Location'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Service & Location Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Service *</label>
                  <select
                    value={formData.service_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_id: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl text-sm border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                    required
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Location Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Surrey"
                    value={formData.location_name}
                    onChange={(e) => handleLocationNameChange(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-sm border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Location URL Slug *</label>
                <input
                  type="text"
                  placeholder="e.g. surrey"
                  value={formData.location_slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, location_slug: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-xl text-sm border font-mono ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Meta Title</label>
                <input
                  type="text"
                  placeholder="Best Plumbing Services in Surrey, BC | WorkOnTap"
                  value={formData.meta_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-xl text-sm border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  placeholder="Looking for trusted plumbers in Surrey, BC? Book top-rated local pros on WorkOnTap."
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-xl text-sm border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Custom Heading (H1)</label>
                <input
                  type="text"
                  placeholder="#1 Rated Plumbing Services Pros in Surrey, BC"
                  value={formData.custom_heading}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_heading: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-xl text-sm border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Custom Intro Paragraph</label>
                <textarea
                  rows={3}
                  placeholder="Need reliable plumbing services in Surrey? WorkOnTap connects you with verified local specialists..."
                  value={formData.custom_intro}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_intro: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-xl text-sm border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Unique Location Description (Rich Text / HTML)</label>
                <div className={`mt-1 ${isDarkMode ? 'dark-mode-ckeditor' : ''}`}>
                  <RichTextEditor
                    value={formData.description || ''}
                    onChange={(data) => setFormData(prev => ({ ...prev, description: data }))}
                    placeholder="Write unique detailed description specifically for this service location..."
                  />
                </div>
                <p className={`text-xs mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Overrides the generic service description on this location page for unique, location-specific content.
                </p>
                {isDarkMode && (
                  <style jsx global>{`
                    .dark-mode-ckeditor .ck-editor__main .ck-content,
                    .dark-mode-ckeditor .ck-toolbar {
                      background-color: #1e293b !important;
                      color: #e2e8f0 !important;
                      border-color: #334155 !important;
                    }
                    .dark-mode-ckeditor .ck-button {
                      color: #cbd5e1 !important;
                    }
                    .dark-mode-ckeditor .ck-button:hover,
                    .dark-mode-ckeditor .ck-button.ck-on {
                      background-color: #334155 !important;
                    }
                  `}</style>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={Boolean(formData.is_active)}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked ? 1 : 0 }))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-semibold">Active & Published on Website/Sitemap</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
