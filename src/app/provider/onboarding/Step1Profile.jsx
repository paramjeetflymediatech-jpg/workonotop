










'use client';

import { useState } from 'react';

const SERVICE_AREAS = [
  'Surrey', 'Delta', 'Langley', 'Richmond', 
  'Vancouver (North, West, South, East)', 'Burnaby', 
  'Coquitlam/Port Coquitlam', 'Abbotsford', 'New Westminster'
];

const SKILLS = [
  'Cleaning (regular, deep, move out)',
  'Exterior cleaning (pressure washing, gutters, windows)',
  'Handyman',
  'Furniture assembly',
  'Movers',
  'Junk removal',
  'Yard work',
  'Carpet wash'
];

export default function Step1Profile({ initialData, onNext, providerId }) {
  const [formData, setFormData] = useState({
    bio: initialData.bio || '',
    specialty: initialData.specialty || '',
    experience_years: initialData.experience_years || '',
    city: initialData.city || '', // Empty by default, user types their city
    location: initialData.location || '',
    service_areas: initialData.service_areas || [],
    skills: initialData.skills || []
  });
  // bio length constraints
  const BIO_MIN = 50;
  const BIO_MAX = 500;


  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    if (formData.service_areas.length === 0) {
      newErrors.service_areas = 'Select at least one service area';
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
          placeholder="Enter your city (e.g., Surrey, Vancouver)"
        />
        {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
        <p className="mt-1 text-xs text-gray-500">
          Enter the city where your business is located - this helps customers find you in local searches
        </p>
      </div>

      {/* Service Areas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Areas <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {SERVICE_AREAS.map(area => (
            <label key={area} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.service_areas.includes(area)}
                onChange={() => handleArrayToggle('service_areas', area)}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700 leading-tight">{area}</span>
            </label>
          ))}
        </div>
        {errors.service_areas && (
          <p className="mt-1 text-sm text-red-500">{errors.service_areas}</p>
        )}
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {SKILLS.map(skill => (
            <label key={skill} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
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