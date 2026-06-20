'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function DistrictForm({ isEdit = false, initialData = null }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [states, setStates] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    state_id: '',
    is_active: true
  });

  useEffect(() => {
    fetch('/api/admin/states?limit=1000')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStates(data.data);
        }
      });
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        state_id: initialData.state_id || '',
        is_active: initialData.is_active !== 0
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.state_id) {
      toast.error('Name and State are required');
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit && initialData 
        ? `/api/admin/districts/${initialData.id}`
        : '/api/admin/districts';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        name: formData.name,
        state_id: formData.state_id,
        is_active: formData.is_active
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        router.push('/admin/districts');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(isEdit ? 'Failed to update district' : 'Failed to save district');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            District Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Los Angeles County"
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            State <span className="text-red-500">*</span>
          </label>
          <select
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white"
            value={formData.state_id}
            onChange={(e) => setFormData({...formData, state_id: e.target.value})}
          >
            <option value="">Select a state</option>
            {states.map(state => (
              <option key={state.id} value={state.id}>{state.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.is_active}
            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-slate-300">
            Active
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => router.push('/admin/districts')}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-lg transition"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg transition disabled:opacity-50"
          >
            {submitting ? 'Saving...' : (isEdit ? 'Update District' : 'Add District')}
          </button>
        </div>
      </form>
    </div>
  );
}
