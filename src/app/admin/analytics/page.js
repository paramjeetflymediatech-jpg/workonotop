'use client'

import { useState, useEffect } from 'react'
import { useAdminTheme } from '../layout'

export default function AnalyticsPage() {
    const { isDarkMode } = useAdminTheme()

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Analytics</h1>
            </div>

            <div className={`p-12 rounded-xl border border-dashed flex flex-col items-center justify-center ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
                }`}>
                <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Analytics Dashboard Coming Soon</h2>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-center max-w-md`}>
                    We're working on a comprehensive analytics dashboard to help you track business performance, revenue trends, and service popularity.
                </p>
            </div>
        </div>
    )
}
