'use client';

import { useState, useEffect } from 'react';
import StateForm from '@/components/admin/StateForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function EditStatePage() {
  const { id } = useParams();
  const [stateData, setStateData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/states/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStateData(data.data);
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
        <Link href="/admin/states" className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit State</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Update state details.</p>
        </div>
      </div>

      <StateForm isEdit={true} initialData={stateData} />
    </div>
  );
}
