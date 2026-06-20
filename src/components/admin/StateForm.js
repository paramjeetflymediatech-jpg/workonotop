'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function StateForm({ isEdit = false, initialData = null }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    is_active: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        is_active: initialData.is_active !== 0
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit && initialData 
        ? `/api/admin/states/${initialData.id}`
        : '/api/admin/states';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        name: formData.name,
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
        router.push('/admin/states');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(isEdit ? 'Failed to update state' : 'Failed to save state');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            State Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g., California"
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
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
            onClick={() => router.push('/admin/states')}
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
            {submitting ? 'Saving...' : (isEdit ? 'Update State' : 'Add State')}
          </button>
        </div>
      </form>
    </div>
  );
}
