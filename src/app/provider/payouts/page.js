'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Wallet, Clock, TrendingUp, Download, AlertCircle, 
  ArrowLeft, ChevronRight, Calendar, DollarSign, CheckCircle,
  XCircle, HelpCircle
} from 'lucide-react'

export default function ProviderPayouts() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('all')

  useEffect(() => {
    setMounted(true)
    checkAuth()
    loadPayouts()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/provider/me')
      if (!res.ok) router.push('/provider/login')
    } catch {
      router.push('/provider/login')
    }
  }

  const loadPayouts = async () => {
    try {
      const res = await fetch('/api/provider/payouts')
      const result = await res.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        if (res.status === 401) router.push('/provider/login')
        showToast('error', result.message || 'Failed to load')
      }
    } catch {
      showToast('error', 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (type, text) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }

  const formatMoney = (amt) => `$${parseFloat(amt || 0).toFixed(2)}`
  
  const formatDate = (d) => {
    if (!d) return ''
    const date = new Date(d)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <CheckCircle className="w-3.5 h-3.5" />
      case 'processing': return <Clock className="w-3.5 h-3.5" />
      case 'pending': return <Clock className="w-3.5 h-3.5" />
      case 'failed': return <XCircle className="w-3.5 h-3.5" />
      default: return <HelpCircle className="w-3.5 h-3.5" />
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-50 text-green-700 border-green-200'
      case 'processing': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'failed': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const totalPayouts = data?.payouts?.reduce((sum, p) => sum + p.amount, 0) || 0
  const successfulPayouts = data?.payouts?.filter(p => p.status === 'paid').length || 0

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500">Loading your payouts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-medium flex items-center gap-2 animate-slideIn
          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.text}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payouts</h1>
          <div className="w-16 sm:w-20" /> {/* Spacer */}
        </div>

        {/* Stripe Alert */}
        {data?.provider?.stripe_onboarding !== 'complete' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-amber-100 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-800">Stripe account required</p>
                <p className="text-sm text-amber-700">Connect your Stripe account to receive payouts automatically</p>
              </div>
            </div>
            <Link 
              href="/provider/onboarding?step=3" 
              className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-1 w-full sm:w-auto justify-center"
            >
              Connect Now
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="p-2 bg-green-100 rounded-xl w-fit mb-3">
              <Wallet className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Available</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatMoney(data?.balances?.available_balance)}</p>
            <p className="text-xs text-gray-400 mt-1">Ready to withdraw</p>
          </div>
          
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="p-2 bg-amber-100 rounded-xl w-fit mb-3">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Pending</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatMoney(data?.balances?.pending_balance)}</p>
            <p className="text-xs text-gray-400 mt-1">In processing</p>
          </div>
          
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="p-2 bg-blue-100 rounded-xl w-fit mb-3">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Total earned</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatMoney(data?.balances?.total_earnings)}</p>
            <p className="text-xs text-gray-400 mt-1">All time</p>
          </div>
          
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="p-2 bg-purple-100 rounded-xl w-fit mb-3">
              <Download className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Lifetime</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatMoney(data?.balances?.lifetime_balance)}</p>
            <p className="text-xs text-gray-400 mt-1">Total balance</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl p-4 sm:p-5 shadow-lg">
            <p className="text-green-100 text-xs mb-1">Total payouts</p>
            <p className="text-2xl sm:text-3xl font-bold">{formatMoney(totalPayouts)}</p>
            <p className="text-green-100 text-xs mt-1">{successfulPayouts} successful payouts</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-4 sm:p-5 shadow-lg">
            <p className="text-blue-100 text-xs mb-1">Completed jobs</p>
            <p className="text-2xl sm:text-3xl font-bold">{data?.recent_jobs?.length || 0}</p>
            <p className="text-blue-100 text-xs mt-1">Last 30 days</p>
          </div>
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900">Payout history</h2>
            
            {/* Filter Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {['all', 'paid', 'pending'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize
                    ${selectedPeriod === period 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-5">
            {data?.payouts?.filter(p => selectedPeriod === 'all' || p.status === selectedPeriod).length > 0 ? (
              <div className="space-y-3">
                {data.payouts
                  .filter(p => selectedPeriod === 'all' || p.status === selectedPeriod)
                  .map((p, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl border border-gray-200">
                          <Download className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{formatMoney(p.amount)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-500">{formatDate(p.created_at)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:ml-auto">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(p.status)}`}>
                          {getStatusIcon(p.status)}
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-3 bg-gray-100 rounded-2xl w-fit mx-auto mb-3">
                  <Download className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No payouts yet</p>
                <p className="text-sm text-gray-400 mt-1">Your withdrawals will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent completed jobs</h2>
          </div>
          
          <div className="p-5">
            {data?.recent_jobs?.length > 0 ? (
              <div className="space-y-3">
                {data.recent_jobs.map((j, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl border border-gray-200">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{j.service_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">{formatDate(j.end_time)}</p>
                        </div>
                      </div>
                    </div>
                    <p className="font-bold text-green-600 sm:ml-auto">{formatMoney(j.amount)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-3 bg-gray-100 rounded-2xl w-fit mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No completed jobs</p>
                <p className="text-sm text-gray-400 mt-1">Your completed jobs will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Back to Dashboard Link */}
        {/* <div className="mt-6 text-center">
          <Link 
            href="/provider/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            Back to Dashboard
          </Link>
        </div> */}
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}