'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';


export default function Step1Profile({ initialData, onNext, providerId }) {
  const [formData, setFormData] = useState({
    bio: initialData.bio || '',
    specialty: initialData.specialty || '',
    experience_years: initialData.experience_years || '',
    city: initialData.city || '', // Empty by default, user types their city
    location: initialData.location || '',
    service_cities: initialData.service_cities || [],
    service_cities_names: initialData.service_cities_names || [],
    skills: initialData.skills || []
  });
  // bio length constraints
  const BIO_MIN = 50;
  const BIO_MAX = 500;


  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [expandedDistrict, setExpandedDistrict] = useState(null);
  const [districtCities, setDistrictCities] = useState({});
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [availableSkills, setAvailableSkills] = useState([]);

  useEffect(() => {
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

    fetchStates();
    fetchSkills();
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'bio') {
      // enforce maximum length in the textarea as well
      if (val.length > BIO_MAX) val = val.slice(0, BIO_MAX);
    }
    setFormData(prev => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const newArray = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: newArray };
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
    const newErrors = {};
    const bioTrim = formData.bio.trim();
    if (!bioTrim) newErrors.bio = 'Bio is required';
    else if (bioTrim.length < BIO_MIN) newErrors.bio = `Bio must be at least ${BIO_MIN} characters`;
    else if (bioTrim.length > BIO_MAX) newErrors.bio = `Bio must be no more than ${BIO_MAX} characters`;
    if (!formData.specialty.trim()) newErrors.specialty = 'Specialty is required';
    if (!formData.experience_years) newErrors.experience_years = 'Experience is required';
    if (formData.experience_years < 0 || formData.experience_years > 50) {
      newErrors.experience_years = 'Please enter valid experience';
    }
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.location.trim()) newErrors.location = 'Address is required';
    if (formData.service_cities.length === 0) {
      newErrors.service_cities = 'Select at least one service city';
    }
    if (formData.skills.length === 0) {
      newErrors.skills = 'Select at least one skill';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields correctly.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/provider/onboarding/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        onNext(formData);
      } else {
        setErrors({ submit: data.message });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to save profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
      
      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Professional Bio <span className="text-red-500">*</span>
        </label>
        <textarea
          name="bio"
          rows="4"
          maxLength={BIO_MAX}
          value={formData.bio}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent
            ${errors.bio ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Tell us about yourself and your experience..."
        />
        <div className="flex justify-between items-center mt-1">
          {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
          <p className="text-xs text-gray-500 ml-auto">{formData.bio.length}/{BIO_MAX} characters</p>
        </div>
      </div>

      {/* Specialty & Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Specialty <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500
              ${errors.specialty ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g., Plumbing, Electrical"
          />
          {errors.specialty && <p className="mt-1 text-sm text-red-500">{errors.specialty}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Years of Experience <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="experience_years"
            value={formData.experience_years}
            onChange={handleChange}
            min="0"
            max="50"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500
              ${errors.experience_years ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.experience_years && <p className="mt-1 text-sm text-red-500">{errors.experience_years}</p>}
        </div>
      </div>

      {/* Location (Address) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500
            ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Street address"
        />
        {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
      </div>

      {/* City - Text Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500
            ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Enter your city (e.g., Toronto, Brampton)"
        />
        {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
        <p className="mt-1 text-xs text-gray-500">
          Enter the city where your business is located - this helps customers find you in local searches
        </p>
      </div>

      {/* Service Areas (States -> Districts -> Cities) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Areas <span className="text-red-500">*</span>
        </label>
        
        {formData.service_cities_names?.length > 0 && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <p className="text-sm font-bold text-gray-800 mb-2">Your Saved Service Areas:</p>
            <div className="flex flex-wrap gap-2">
              {formData.service_cities_names.map((city, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold rounded-md">
                  {city}
                  <button 
                    type="button" 
                    onClick={() => removeCityByIndex(idx)}
                    className="hover:bg-teal-200 rounded-full p-0.5 transition"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-4">Which areas are you willing to work in? Select a state and district to view and select cities.</p>
        
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

        {formData.service_cities.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700">Selected Cities ({formData.service_cities.length})</p>
          </div>
        )}

        {errors.service_cities && (
          <p className="mt-1 text-sm text-red-500">{errors.service_cities}</p>
        )}
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills <span className="text-red-500">*</span>
        </label>
        
        {formData.skills?.length > 0 && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <p className="text-sm font-bold text-gray-800 mb-2">Your Saved Skills:</p>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold rounded-md">
                  {skill}
                  <button 
                    type="button" 
                    onClick={() => handleArrayToggle('skills', skill)}
                    className="hover:bg-teal-200 rounded-full p-0.5 transition"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-60 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {availableSkills.map(skill => (
              <label key={skill} className="flex items-center space-x-2 p-2 border border-gray-200 bg-white rounded hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={formData.skills.includes(skill)}
                  onChange={() => handleArrayToggle('skills', skill)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700 leading-tight">{skill}</span>
              </label>
            ))}
          </div>
        </div>
        {errors.skills && (
          <p className="mt-1 text-sm text-red-500">{errors.skills}</p>
        )}
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">
          {errors.submit}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 
                     disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Saving...' : 'Continue to Documents'}
        </button>
      </div>
    </form>
  );
}