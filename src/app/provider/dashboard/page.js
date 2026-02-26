'use client';
/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, DollarSign, Clock, Star, ArrowRight, TrendingUp, Calendar, Zap } from 'lucide-react';

export default function ProviderDashboard() {
  const router = useRouter();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalJobs: 0, completedJobs: 0, pendingJobs: 0, totalEarnings: 0, averageRating: 0 });

  useEffect(() => { loadProviderData(); }, []);

  const loadProviderData = async () => {
    try {
      const res = await fetch('/api/provider/me');
      const data = await res.json();
      if (data.success) {
        setProvider(data.provider);
        setStats({ totalJobs: 0, completedJobs: 0, pendingJobs: 0, totalEarnings: 0, averageRating: 0 });
      } else {
        router.push('/provider/login');
      }
    } catch {
      router.push('/provider/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'bg-blue-50 text-blue-600', iconBg: 'bg-blue-100' },
    { label: 'Completed', value: stats.completedJobs, icon: TrendingUp, color: 'bg-green-50 text-green-600', iconBg: 'bg-green-100' },
    { label: 'In Progress', value: stats.pendingJobs, icon: Clock, color: 'bg-amber-50 text-amber-600', iconBg: 'bg-amber-100' },
    { label: 'Total Earned', value: `$${stats.totalEarnings}`, icon: DollarSign, color: 'bg-purple-50 text-purple-600', iconBg: 'bg-purple-100' },
    { label: 'Rating', value: stats.averageRating ? `${stats.averageRating} ★` : '—', icon: Star, color: 'bg-orange-50 text-orange-600', iconBg: 'bg-orange-100' },
  ];

  const quickActions = [
    { href: '/provider/jobs', icon: Briefcase, label: 'Browse Jobs', desc: 'Find new opportunities', color: 'group-hover:text-blue-600' },
    { href: '/provider/schedule', icon: Calendar, label: 'My Schedule', desc: 'View upcoming jobs', color: 'group-hover:text-green-600' },
    { href: '/provider/earnings', icon: DollarSign, label: 'Earnings', desc: 'Track your payouts', color: 'group-hover:text-purple-600' },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-green-700 to-teal-600 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-green-200 text-sm font-medium mb-1">Good to see you back</p>
            <h1 className="text-2xl font-bold">{provider?.name} 👋</h1>
            <p className="text-green-100 text-sm mt-1">{provider?.specialty || 'Service Professional'} · {provider?.city || 'Calgary'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
                <div className={`w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center mb-3`}>
                  <Icon className={`h-4 w-4 ${s.color.split(' ')[1]}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.href} href={a.href}
                className="group bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-green-200 transition flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-green-50 transition">
                    <Icon className={`h-5 w-5 text-gray-400 ${a.color} transition`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{a.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Empty state - recent jobs */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Jobs</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
              <Zap className="h-7 w-7 text-green-500" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">No jobs yet</h3>
            <p className="text-sm text-gray-400 max-w-xs">Once you start accepting jobs, they'll appear here. Browse available jobs to get started.</p>
            <Link href="/provider/available-jobs"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition">
              Browse Jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}