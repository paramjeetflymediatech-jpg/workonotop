

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Briefcase, DollarSign, Clock, Star, ArrowRight, 
  Zap, MapPin, CheckCircle, AlertCircle, BellRing, TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ProviderDashboard() {
  const router = useRouter();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0, completedJobs: 0, inProgressJobs: 0,
    totalEarnings: 0, averageRating: 0, totalCustomers: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [availableJobsCount, setAvailableJobsCount] = useState(0);
  const [previousJobCount, setPreviousJobCount] = useState(0);
  const [showNewJobAlert, setShowNewJobAlert] = useState(false);
  const [newJobsList, setNewJobsList] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);
  
  // ========== ADD THIS - Payout data for accurate earnings ==========
  const [payoutData, setPayoutData] = useState(null);
  // ================================================================

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, []);

  const loadProviderData = async () => {
    try {
      const providerRes = await fetch('/api/provider/me');
      const providerData = await providerRes.json();
      if (!providerData.success) { router.push('/provider/login'); return; }
      setProvider(providerData.provider);

      const statsRes = await fetch('/api/provider/dashboard-stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats({
          totalJobs: statsData.stats.totalJobs || 0,
          completedJobs: statsData.stats.completedJobs || 0,
          inProgressJobs: statsData.stats.inProgressJobs || 0,
          totalEarnings: statsData.stats.totalEarnings || 0,
          averageRating: statsData.stats.averageRating || 0,
          totalCustomers: statsData.stats.totalCustomers || 0
        });
        setRecentJobs(statsData.stats.recentJobs || []);
      }

      // ========== ADD THIS - Fetch payout data for accurate earnings ==========
      const payoutRes = await fetch('/api/provider/payouts');
      const payoutResult = await payoutRes.json();
      if (payoutResult.success) {
        setPayoutData(payoutResult.data);
      }
      // ================================================================

      await checkForNewJobs();
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewJobs = useCallback(async () => {
    try {
      const jobsRes = await fetch('/api/provider/available-jobs?count=true&limit=5');
      const jobsData = await jobsRes.json();
      if (jobsData.success) {
        const newCount = jobsData.count || 0;
        if (newCount > previousJobCount && previousJobCount > 0 && !alertDismissed) {
          const newJobsAdded = newCount - previousJobCount;
          setShowNewJobAlert(true);
          if (jobsData.recentJobs) setNewJobsList(jobsData.recentJobs.slice(0, newJobsAdded));
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('🔔 New Jobs Available!', {
              body: `${newJobsAdded} new job${newJobsAdded > 1 ? 's' : ''} in your area`,
              icon: '/favicon.ico'
            });
          }
          toast.success(`${newJobsAdded} new job${newJobsAdded > 1 ? 's' : ''} available!`, {
            duration: 5000, position: 'top-right', icon: '🔔'
          });
        }
        setPreviousJobCount(newCount);
        setAvailableJobsCount(newCount);
      }
    } catch (error) {
      console.error('Error checking new jobs:', error);
    }
  }, [previousJobCount, alertDismissed]);

  useEffect(() => { loadProviderData(); }, []);
  useEffect(() => {
    const interval = setInterval(checkForNewJobs, 15000);
    return () => clearInterval(interval);
  }, [checkForNewJobs]);

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const handleDismissAlert = () => {
    setShowNewJobAlert(false);
    setAlertDismissed(true);
    setTimeout(() => setAlertDismissed(false), 300000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stripeConnected = provider?.stripe_onboarding_complete;

  // ========== FIXED: Use actual earnings from payout data ==========
  const actualTotalEarnings = payoutData?.balances?.total_earnings || stats.totalEarnings || 0;
  // ================================================================

  const statCards = [
    { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', href: '/provider/jobs' },
    { label: 'Completed', value: stats.completedJobs, icon: CheckCircle, iconBg: 'bg-green-100', iconColor: 'text-green-600', href: '/provider/jobs?status=completed' },
    { label: 'In Progress', value: stats.inProgressJobs, icon: Clock, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', href: '/provider/jobs?status=in_progress' },
    // ========== FIXED: Use actualTotalEarnings here ==========
    { label: 'Total Earned', value: `$${formatAmount(actualTotalEarnings)}`, icon: DollarSign, iconBg: 'bg-purple-100', iconColor: 'text-purple-600', href: '/provider/payouts' },
    // =========================================================
    { label: 'Rating', value: stats.averageRating ? `${stats.averageRating.toFixed(1)} ★` : 'New', icon: Star, iconBg: 'bg-orange-100', iconColor: 'text-orange-600', href: '/provider/profile' },
  ];

  const quickActions = [
    { href: '/provider/available-jobs', icon: Briefcase, label: 'Browse Jobs', desc: `${availableJobsCount} new opportunities`, badge: availableJobsCount > 0 ? availableJobsCount : null, hoverColor: 'group-hover:text-blue-600' },
    // ========== FIXED: Change href to /provider/payouts instead of /provider/earnings ==========
    { href: '/provider/payouts', icon: DollarSign, label: 'Payouts', desc: `Available: $${formatAmount(payoutData?.balances?.available_balance || 0)}`, hoverColor: 'group-hover:text-purple-600' },
    // =========================================================
  ];

  return (
    <div className="space-y-6 w-full">

      {/* Welcome header */}
      <div className="bg-gradient-to-r from-green-700 to-teal-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div>
            <p className="text-green-200 text-sm font-medium mb-1">
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
            </p>
            <h1 className="text-2xl font-bold">{provider?.name} 👋</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm">
                <MapPin className="h-3.5 w-3.5" /> {provider?.city || 'Calgary'}
              </span>
              {provider?.specialty && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm">
                  {provider.specialty}
                </span>
              )}
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" /> Active
          </span>
        </div>
      </div>

      {/* ⚠️ Stripe Not Connected Banner */}
      {!stripeConnected && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-800 text-base">⚠️ Stripe Not Connected</h3>
            <p className="text-amber-700 text-sm mt-0.5">
              You haven&apos;t connected your Stripe account yet. You can browse the dashboard and view jobs, but you <strong>cannot accept jobs or receive payments</strong> until Stripe is set up.
            </p>
          </div>
          <Link
            href="/provider/onboarding?step=3"
            className="flex-shrink-0 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition whitespace-nowrap"
          >
            Connect Stripe →
          </Link>
        </div>
      )}

      {/* New Job Alert */}
      {showNewJobAlert && availableJobsCount > 0 && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 rounded-2xl animate-pulse opacity-30"></div>
          <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 shadow-2xl border-2 border-yellow-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10"></div>
            <button onClick={handleDismissAlert} className="absolute top-4 right-4 text-white/80 hover:text-white transition z-10">
              <span className="text-2xl">&times;</span>
            </button>
            <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-bounce">
                  <BellRing className="h-10 w-10 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-7 w-7 flex items-center justify-center animate-ping">!</span>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-7 w-7 flex items-center justify-center">
                  {availableJobsCount - previousJobCount}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-yellow-300 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full animate-pulse">🔥 HOT OPPORTUNITY</span>
                  <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">Just now</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {availableJobsCount - previousJobCount} New Job{availableJobsCount - previousJobCount > 1 ? 's' : ''} Available!
                </h3>
                <p className="text-white/90 text-lg mb-4">
                  {availableJobsCount - previousJobCount === 1 ? 'A new job has been posted in your area' : `${availableJobsCount - previousJobCount} new jobs are waiting for you`}
                </p>
                {newJobsList.length > 0 && (
                  <div className="bg-white/10 rounded-xl p-4 mb-5 backdrop-blur-sm border border-white/20">
                    <p className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Latest opportunities:
                    </p>
                    <div className="space-y-2">
                      {newJobsList.map((job, idx) => (
                        <div key={idx} className="flex items-center justify-between text-white text-sm py-2 px-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                            <span>{job.service_name}</span>
                          </div>
                          <span className="font-bold bg-green-500 px-2 py-1 rounded-md text-xs">{job.display_amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <Link href="/provider/available-jobs"
                    className="bg-white text-green-600 px-8 py-3 rounded-xl font-bold hover:bg-green-50 transition transform hover:scale-105 flex items-center gap-2 shadow-lg"
                    onClick={() => setShowNewJobAlert(false)}>
                    View Jobs Now <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button onClick={handleDismissAlert}
                    className="bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition backdrop-blur-sm border border-white/30">
                    Remind Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <Link href={s.href} key={s.label}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-green-200 transition group">
                <div className={`w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition`}>
                  <Icon className={`h-4 w-4 ${s.iconColor}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.href} href={a.href}
                className="group bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-green-200 transition flex items-center justify-between relative">
                {a.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {a.badge}
                  </span>
                )}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-green-50 transition">
                    <Icon className={`h-5 w-5 text-gray-400 ${a.hoverColor} transition`} />
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


    </div>
  );
}