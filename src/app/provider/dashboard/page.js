'use client';
/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProviderDashboard() {
  const router = useRouter();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    totalEarnings: 0,
    averageRating: 0
  });

  useEffect(() => {
    loadProviderData();
  }, []);

  const loadProviderData = async () => {
    try {
      const res = await fetch('/api/provider/me');
      const data = await res.json();
      
      if (data.success) {
        setProvider(data.provider);
        // Load stats
        loadStats(data.provider.id);
      } else {
        router.push('/provider/login');
      }
    } catch (error) {
      console.error('Error loading provider:', error);
      router.push('/provider/login');
    }
  };

  const loadStats = async (providerId) => {
    try {
      // This would be a real API call in production
      setStats({
        totalJobs: 0,
        completedJobs: 0,
        pendingJobs: 0,
        totalEarnings: 0,
        averageRating: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {provider?.name}!</h1>
          <p className="text-gray-600">Here's what's happening with your business today.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Jobs</p>
            <p className="text-2xl font-bold">{stats.totalJobs}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completedJobs}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingJobs}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Earnings</p>
            <p className="text-2xl font-bold text-teal-600">${stats.totalEarnings}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Rating</p>
            <p className="text-2xl font-bold">{stats.averageRating} ⭐</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/provider/jobs" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <h3 className="font-semibold text-gray-900">Available Jobs</h3>
              <p className="text-sm text-gray-600 mt-1">Find new job opportunities</p>
            </Link>
            <Link href="/provider/schedule" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <h3 className="font-semibold text-gray-900">My Schedule</h3>
              <p className="text-sm text-gray-600 mt-1">View and manage your jobs</p>
            </Link>
            <Link href="/provider/earnings" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <h3 className="font-semibold text-gray-900">Earnings</h3>
              <p className="text-sm text-gray-600 mt-1">Track your payouts</p>
            </Link>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
          </div>
          <div className="p-6 text-center text-gray-500">
            No jobs yet. Complete your profile to start receiving job requests.
          </div>
        </div>
      </div>
    </div>
  );
}