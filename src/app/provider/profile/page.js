'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, MapPin, Briefcase, Clock,
  Star, Camera, Save, Edit2, X, CheckCircle,
  Shield, Award, TrendingUp
} from 'lucide-react';

// removed static location imports

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-medium ${
        toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
      }`}>
        {toast.type === 'success'
          ? <CheckCircle className="h-5 w-5 flex-shrink-0" />
          : <X className="h-5 w-5 flex-shrink-0" />
        }
        {toast.message}
        <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function ProviderProfile() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experience_years: '',
    bio: '',
    location: '',
    city: '',
    service_cities: [],
    service_cities_names: [],
    skills: [],
  });

  const showToast = (message, type = 'success') => setToast({ message, type });

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [expandedDistrict, setExpandedDistrict] = useState(null);
  const [districtCities, setDistrictCities] = useState({});
  const [selectedCitiesNames, setSelectedCitiesNames] = useState({});
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [availableSkills, setAvailableSkills] = useState([]);

  useEffect(() => {
    loadProfile();
    fetchStates();
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      if (data.success) {
        setAvailableSkills(data.data.map(s => s.name));
      }
    } catch (err) {
      console.error('Failed to fetch skills', err);
    }
  };

  const fetchStates = async () => {
    try {
      const res = await fetch('/api/locations?type=states');
      const data = await res.json();
      if (data.success) {
        setStates(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch states', err);
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      setExpandedDistrict(null);
      return;
    }
    const fetchDistricts = async () => {
      try {
        const res = await fetch(`/api/locations?type=districts&parentId=${selectedState}`);
        const data = await res.json();
        if (data.success) setDistricts(data.data);
      } catch (err) {}
    };
    fetchDistricts();
  }, [selectedState]);

  const toggleDistrict = async (districtId) => {
    if (expandedDistrict === districtId) {
      setExpandedDistrict(null);
      return;
    }
    setExpandedDistrict(districtId);
    if (!districtCities[districtId]) {
      try {
        const res = await fetch(`/api/locations?type=cities&parentId=${districtId}`);
        const data = await res.json();
        if (data.success) {
          setDistrictCities(prev => ({ ...prev, [districtId]: data.data }));
        }
      } catch (err) {}
    }
  };

  const loadCityNames = async (cityIds) => {
    if (!cityIds || cityIds.length === 0) return;
    try {
      // In a real scenario we'd have a bulk endpoint, but for simplicity:
      // Assuming we have states -> districts -> cities, we might just show "X Cities Selected" 
      // or we can fetch their names individually or via a special endpoint.
      // Since we don't have a bulk endpoint, let's just show counts or maybe the API should return names.
    } catch (e) {}
  };

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/provider/profile');
      const data = await res.json();
      if (data.success) {
        setProvider(data.data);
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          specialty: data.data.specialty || '',
          experience_years: data.data.experience_years || '',
          bio: data.data.bio || '',
          location: data.data.location || '',
          city: data.data.city || '',
          service_cities: data.data.service_cities || [],
          service_cities_names: data.data.service_cities_names || [],
          skills: data.data.skills || [],
        });
      } else {
        router.push('/provider/login');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      router.push('/provider/login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleArrayItem = (field, value) => {
    setFormData(prev => {
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value]
      };
    });
  };

  const toggleCity = (cityId, cityName) => {
    setFormData(prev => {
      const arr = prev.service_cities || [];
      const names = prev.service_cities_names || [];
      const isSelected = arr.includes(cityId);

      return {
        ...prev,
        service_cities: isSelected ? arr.filter(id => id !== cityId) : [...arr, cityId],
        service_cities_names: isSelected ? names.filter(n => n !== cityName) : [...names, cityName]
      };
    });
  };

  const removeCityByIndex = (idx) => {
    setFormData(prev => {
      const arr = [...(prev.service_cities || [])];
      const names = [...(prev.service_cities_names || [])];
      arr.splice(idx, 1);
      names.splice(idx, 1);
      return { ...prev, service_cities: arr, service_cities_names: names };
    });
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email';
    if (!formData.phone.trim()) e.phone = 'Phone is required';
    return e;
  };

  const handleSave = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/provider/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setProvider(data.data);
        setEditing(false);
        showToast('Profile updated successfully!');
      } else {
        showToast(data.message || 'Update failed', 'error');
      }
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setErrors({});
    // Reset form to current provider data
    setFormData({
      name: provider.name || '',
      email: provider.email || '',
      phone: provider.phone || '',
      specialty: provider.specialty || '',
      experience_years: provider.experience_years || '',
      bio: provider.bio || '',
      location: provider.location || '',
      city: provider.city || '',
      service_cities: provider.service_cities || [],
      service_cities_names: provider.service_cities_names || [],
      skills: provider.skills || [],
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Only JPG, PNG, or WebP images allowed', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'error');
      return;
    }

    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'profile_photo'); // Add document type

      const res = await fetch('/api/provider/upload', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        // Update provider with new avatar URL from documents table
        setProvider(prev => ({ ...prev, avatar_url: data.url }));
        showToast('Profile photo updated!');
      } else {
        showToast(data.message || 'Upload failed', 'error');
      }
    } catch {
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initials = (provider?.name || '').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'P';

  const inputClass = (field) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
      errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
    }`;

  const readonlyClass = 'w-full px-4 py-2.5 border border-gray-100 bg-gray-50 rounded-xl text-sm text-gray-700';

  return (
    <div className="w-full space-y-6">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your personal and professional details</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition shadow-sm shadow-green-200">
            <Edit2 className="h-4 w-4" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
              {saving
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Save className="h-4 w-4" />
              }
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left Column: Avatar + Stats ── */}
        <div className="space-y-4">

          {/* Avatar Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="relative inline-block mb-4">
              {provider?.avatar_url ? (
                <img 
                  src={provider.avatar_url.startsWith('http') ? provider.avatar_url : provider.avatar_url} 
                  alt={provider.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div class="w-24 h-24 rounded-full bg-green-100 border-4 border-white shadow-md flex items-center justify-center">
                      <span class="text-2xl font-bold text-green-700">${initials}</span>
                    </div>`;
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-green-100 border-4 border-white shadow-md flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-700">{initials}</span>
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-md transition disabled:opacity-60"
                title="Change photo"
              >
                {uploadingAvatar
                  ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Camera className="h-3.5 w-3.5" />
                }
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <h2 className="text-lg font-bold text-gray-900">{provider?.name}</h2>
            <p className="text-sm text-green-600 font-medium mt-0.5">{provider?.specialty || 'Service Professional'}</p>
            <p className="text-xs text-gray-400 mt-1">{provider?.city || 'Toronto'}</p>

            <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
              provider?.status === 'active'
                ? 'bg-green-50 text-green-700'
                : provider?.status === 'pending'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                provider?.status === 'active' ? 'bg-green-500' : provider?.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
              {provider?.status?.charAt(0).toUpperCase() + provider?.status?.slice(1)}
            </div>

            <p className="text-xs text-gray-400 mt-3">
              Member since {provider?.join_date ? new Date(provider.join_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
            </p>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">Total Jobs</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{provider?.total_jobs || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Star className="h-4 w-4 text-amber-500" />
                  </div>
                  <span className="text-sm text-gray-600">Avg Rating</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {provider?.avg_rating ? `${parseFloat(provider.avg_rating).toFixed(1)} ★` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600">Reviews</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{provider?.total_reviews || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">Stripe</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  provider?.stripe_onboarding_complete
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {provider?.stripe_onboarding_complete ? 'Connected' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Column: Form ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5 flex items-center gap-2">
              <User className="h-4 w-4" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                {editing
                  ? <input name="name" value={formData.name} onChange={handleChange} className={inputClass('name')} placeholder="John Doe" />
                  : <div className={readonlyClass}>{provider?.name || '—'}</div>
                }
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number *</label>
                {editing
                  ? <input name="phone" value={formData.phone} onChange={handleChange} className={inputClass('phone')} placeholder="+1 (555) 000-0000" />
                  : <div className={readonlyClass}>{provider?.phone || '—'}</div>
                }
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address *</label>
                {editing
                  ? <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass('email')} placeholder="you@example.com" />
                  : <div className={readonlyClass}>{provider?.email || '—'}</div>
                }
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Award className="h-4 w-4" /> Professional Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Specialty</label>
                {editing
                  ? <input name="specialty" value={formData.specialty} onChange={handleChange} className={inputClass('specialty')} placeholder="e.g. Plumbing, Electrical" />
                  : <div className={readonlyClass}>{provider?.specialty || '—'}</div>
                }
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Years of Experience</label>
                {editing
                  ? <input name="experience_years" type="number" min="0" max="50" value={formData.experience_years} onChange={handleChange} className={inputClass('experience_years')} placeholder="e.g. 5" />
                  : <div className={readonlyClass}>{provider?.experience_years ? `${provider.experience_years} years` : '—'}</div>
                }
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">City</label>
                {editing
                  ? <input name="city" value={formData.city} onChange={handleChange} className={inputClass('city')} placeholder="e.g. Toronto" />
                  : <div className={readonlyClass}>{provider?.city || '—'}</div>
                }
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Business Address</label>
                {editing
                  ? <input name="location" value={formData.location} onChange={handleChange} className={inputClass('location')} placeholder="Street address" />
                  : <div className={readonlyClass}>{provider?.location || '—'}</div>
                }
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Professional Bio</label>
                {editing
                  ? <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4}
                      className={`${inputClass('bio')} resize-none`} placeholder="Tell clients about yourself and your experience..." />
                  : <div className={`${readonlyClass} min-h-[80px] whitespace-pre-wrap break-words`}>{provider?.bio || '—'}</div>
                }
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Skills
            </h3>
            {editing ? (
              <div className="space-y-4">
                {formData.skills?.length > 0 && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-sm font-bold text-gray-800 mb-2">Your Saved Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map(skill => (
                        <span key={skill} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-800 border border-green-200 text-xs font-semibold rounded-md">
                          {skill}
                          <button 
                            type="button" 
                            onClick={() => toggleArrayItem('skills', skill)}
                            className="hover:bg-green-200 rounded-full p-0.5 transition"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-2">
                  {availableSkills.map(skill => (
                    <label key={skill} className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                      formData.skills.includes(skill)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}>
                      <input type="checkbox" checked={formData.skills.includes(skill)}
                        onChange={() => toggleArrayItem('skills', skill)} className="sr-only" />
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                        formData.skills.includes(skill) ? 'bg-green-600' : 'border-2 border-gray-300'
                      }`}>
                        {formData.skills.includes(skill) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(provider?.skills || []).length > 0
                  ? provider.skills.map(s => (
                      <span key={s} className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 text-xs font-semibold rounded-full">{s}</span>
                    ))
                  : <p className="text-sm text-gray-400">No skills added yet</p>
                }
              </div>
            )}
          </div>

          {/* Service Areas */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Service Cities
            </h3>
            {editing ? (
              <div className="space-y-6">
                {formData.service_cities_names?.length > 0 && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-sm font-bold text-gray-800 mb-2">Your Saved Service Areas:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.service_cities_names.map((city, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-800 border border-green-200 text-xs font-semibold rounded-md">
                          {city}
                          <button 
                            type="button" 
                            onClick={() => removeCityByIndex(idx)}
                            className="hover:bg-green-200 rounded-full p-0.5 transition"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 mb-4">
                  <div>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                    >
                      <option value="">-- Select State --</option>
                      {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                {districts.length > 0 && (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2 mb-4">
                    {districts.map(district => {
                      const isExpanded = expandedDistrict === district.id;
                      const citiesForDistrict = districtCities[district.id] || [];
                      const isLoadingCities = isExpanded && !districtCities[district.id];

                      return (
                        <div key={district.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                          <div 
                            className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                            onClick={() => toggleDistrict(district.id)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center ${isExpanded ? 'bg-teal-600 border-teal-600' : 'border-gray-400 bg-white'}`}>
                                {isExpanded && <span className="text-white text-xs">✓</span>}
                              </div>
                              <span className="font-semibold text-gray-800">{district.name}</span>
                            </div>
                            <span className="text-gray-400 font-bold">{isExpanded ? '−' : '+'}</span>
                          </div>
                          
                          {isExpanded && (
                            <div className="p-4 border-t border-gray-200 bg-white">
                              {isLoadingCities ? (
                                <p className="text-sm text-gray-500">Loading cities...</p>
                              ) : citiesForDistrict.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  {citiesForDistrict.map(city => (
                                    <label key={city.id} className="flex items-center space-x-2 p-2 border border-gray-100 bg-gray-50 rounded hover:bg-teal-50 cursor-pointer transition">
                                      <input
                                        type="checkbox"
                                        checked={formData.service_cities.includes(city.id)}
                                        onChange={() => toggleCity(city.id, city.name)}
                                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                      />
                                      <span className="text-sm text-gray-700 leading-tight">{city.name}</span>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No active cities found in this district.</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(provider?.service_cities_names || []).length > 0
                  ? provider.service_cities_names.map((city, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 text-xs font-semibold rounded-full">{city}</span>
                    ))
                  : <p className="text-sm text-gray-400">No service areas added yet</p>
                }
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}