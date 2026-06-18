'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import CityForm from '@/components/admin/CityForm';

export default function EditCityPage() {
  const { id } = useParams();
  const router = useRouter();
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCity();
  }, [id]);

  const fetchCity = async () => {
    try {
      const res = await fetch(`/api/admin/service-areas/${id}`);
      const data = await res.json();
      if (data.success) {
        setCityData(data.data);
      } else {
        toast.error(data.message);
        router.push('/admin/cities');
      }
    } catch (error) {
      toast.error('Failed to load city details');
      router.push('/admin/cities');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/cities" className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Service Area</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Update details and mapped cities for this service area.</p>
        </div>
      </div>

      {cityData && <CityForm isEdit={true} initialData={cityData} />}
    </div>
  );
}
