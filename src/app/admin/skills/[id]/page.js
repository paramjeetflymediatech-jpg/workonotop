'use client';

import { useState, useEffect } from 'react';
import SkillForm from '@/components/admin/SkillForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function EditSkillPage() {
  const { id } = useParams();
  const [skillData, setSkillData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait, we need to fetch the specific skill. We don't have a GET /api/admin/skills/[id] yet.
    // Instead of adding an extra GET by ID, we can fetch all and filter or just add the endpoint.
    // Let's add the GET /api/admin/skills/[id] endpoint or just fetch it here with search.
    // For now, I will fetch all and find it, or add the endpoint.
    // I will add the endpoint in `src/app/api/admin/skills/[id]/route.js`
    fetch(`/api/admin/skills/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSkillData(data.data);
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
        <Link href="/admin/skills" className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Skill</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Update skill details.</p>
        </div>
      </div>

      <SkillForm isEdit={true} initialData={skillData} />
    </div>
  );
}
