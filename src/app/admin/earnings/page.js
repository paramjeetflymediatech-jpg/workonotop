'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminTheme } from '../layout'

export default function EarningsPage() {
    const router = useRouter()
    const { isDarkMode } = useAdminTheme()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState({
        summary: { totalRevenue: 0, totalCommission: 0, totalPayouts: 0, totalInvoices: 0 },
        invoices: [],
        chartData: []
    })
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        providerId: ''
    })
    const [providers, setProviders] = useState([])

    // useEffect(() => {
    //     checkAuth()
    //     loadInitialData()
    // }, [])

    // const checkAuth = () => {
    //     const auth = localStorage.getItem('adminAuth')
    //     if (!auth) router.push('/admin/login')
    // }




    useEffect(() => {
  checkAuth()
}, [])

const checkAuth = async () => {
  try {
    const res = await fetch('/api/admin/me')
    if (!res.ok) {
      router.push('/admin/login')
      return
    }
    loadInitialData() // ✅ auth pass hone ke baad hi load karo
  } catch {
    router.push('/admin/login')
  }
}






    const loadInitialData = async () => {
        setLoading(true)
        try {
            const pRes = await fetch('/api/provider')
            const pData = await pRes.json()
            if (pData.success) setProviders(pData.data || [])
            await fetchEarnings()
        } catch (error) {
            console.error('Load error:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchEarnings = async () => {
        try {
            const query = new URLSearchParams(filters).toString()
            const res = await fetch(`/api/admin/earnings?${query}`)
            const result = await res.json()
            if (result.success) {
                setData(result.data)
            }
        } catch (error) {
            console.error('Fetch error:', error)
        }
    }

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value })
    }

    const applyFilters = () => {
        fetchEarnings()
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
        }).format(amount || 0)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Earnings
                    </h1>
                    <p className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>
                        Track platform revenue and payouts to providers
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className={`px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300'
                            }`}
                    />
                    <span className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}>to</span>
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className={`px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300'
                            }`}
                    />
                    <select
                        name="providerId"
                        value={filters.providerId}
                        onChange={handleFilterChange}
                        className={`px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300'
                            }`}
                    >
                        <option value="">All Providers</option>
                        {providers.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={applyFilters}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition"
                    >
                        Filter
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Revenue</p>
                            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(data.summary.totalRevenue)}</h3>
                            <div className="mt-2 text-xs text-green-500">Gross platform volume</div>
                        </div>

                        <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Platform Commission</p>
                            <h3 className={`text-2xl font-bold text-teal-500`}>{formatCurrency(data.summary.totalCommission)}</h3>
                            <div className="mt-2 text-xs text-teal-600 dark:text-teal-400">Estimated profit</div>
                        </div>

                        <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Provider Payouts</p>
                            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(data.summary.totalPayouts)}</h3>
                            <div className="mt-2 text-xs text-slate-500">Net earnings for pros</div>
                        </div>

                        <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Invoices</p>
                            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.summary.totalInvoices}</h3>
                            <div className="mt-2 text-xs text-slate-500">Completed transactions</div>
                        </div>
                    </div>

                    <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                            <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Detailed Transactions</h2>
                        </div>
                        <div className="overflow-x-auto">
                            {data.invoices.length > 0 ? (
                                <>
                                    {/* Desktop View - Table */}
                                    <div className="hidden md:block">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className={`text-xs uppercase font-semibold ${isDarkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-gray-50 text-gray-500'}`}>
                                                    <th className="px-6 py-4">Invoice #</th>
                                                    <th className="px-6 py-4">Date</th>
                                                    <th className="px-6 py-4">Provider</th>
                                                    <th className="px-6 py-4">Amount</th>
                                                    <th className="px-6 py-4">Commission</th>
                                                    <th className="px-6 py-4">Net Payout</th>
                                                    <th className="px-6 py-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-gray-100'}`}>
                                                {data.invoices.map((inv) => (
                                                    <tr key={inv.id} className={isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}>
                                                        <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{inv.invoice_number}</td>
                                                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                                            {formatDate(inv.completion_date)}
                                                        </td>
                                                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{inv.provider_name}</td>
                                                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(inv.total_amount)}</td>
                                                        <td className={`px-6 py-4 text-sm text-teal-500 font-medium`}>{formatCurrency(inv.commission_amount)}</td>
                                                        <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(inv.provider_earnings)}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${inv.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                inv.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                }`}>
                                                                {inv.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile View - Cards */}
                                    <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800">
                                        {data.invoices.map((inv) => (
                                            <div key={inv.id} className={`p-4 ${isDarkMode ? 'bg-slate-900 hover:bg-slate-800' : 'bg-white hover:bg-gray-50'}`}>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <span className={`text-xs font-bold font-mono ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                                                            {inv.invoice_number}
                                                        </span>
                                                        <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{formatDate(inv.completion_date)}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        inv.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        }`}>
                                                        {inv.status}
                                                    </span>
                                                </div>

                                                <div className="mb-3">
                                                    <p className={`text-[10px] uppercase font-semibold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Provider</p>
                                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{inv.provider_name}</p>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <p className={`text-[10px] uppercase font-semibold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Total</p>
                                                        <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(inv.total_amount)}</p>
                                                    </div>
                                                    <div>
                                                        <p className={`text-[10px] uppercase font-semibold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Comm.</p>
                                                        <p className="text-xs font-bold text-teal-500">{formatCurrency(inv.commission_amount)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-[10px] uppercase font-semibold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Payout</p>
                                                        <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(inv.provider_earnings)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className={`px-6 py-8 text-center text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                    No transactions found for the selected filters
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
