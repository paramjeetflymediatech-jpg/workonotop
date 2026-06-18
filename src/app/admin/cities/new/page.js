import CityForm from '@/components/admin/CityForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Add New City | Admin Panel',
};

export default function NewCityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/cities" className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New City</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create a new service area and map cities to it.</p>
        </div>
      </div>

      <CityForm isEdit={false} />
    </div>
  );
}
