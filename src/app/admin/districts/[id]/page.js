'use client';

import { useState, useEffect } from 'react';
import DistrictForm from '@/components/admin/DistrictForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function EditDistrictPage() {
  const { id } = useParams();
  const [districtData, setDistrictData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/districts/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDistrictData(data.data);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/districts" className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit District</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Update district details.</p>
        </div>
      </div>

      <DistrictForm isEdit={true} initialData={districtData} />
    </div>
  );
}
